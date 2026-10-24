package com.stockflow.modules.inventory.service;

import com.stockflow.modules.inventory.dto.InventoryMovementDto;
import com.stockflow.modules.inventory.entity.InventoryMovement;
import com.stockflow.modules.inventory.entity.MovementType;
import com.stockflow.modules.inventory.entity.ReferenceType;
import com.stockflow.modules.inventory.repository.InventoryMovementRepository;
import com.stockflow.modules.product.entity.Product;
import com.stockflow.modules.product.repository.ProductRepository;
import com.stockflow.modules.user.entity.User;
import com.stockflow.modules.user.repository.UserRepository;
import com.stockflow.modules.warehouse.entity.Warehouse;
import com.stockflow.modules.warehouse.entity.WarehouseStock;
import com.stockflow.modules.warehouse.repository.WarehouseRepository;
import com.stockflow.modules.warehouse.repository.WarehouseStockRepository;
import com.stockflow.shared.PagedResponse;
import com.stockflow.shared.exception.BadRequestException;
import com.stockflow.shared.exception.InsufficientStockException;
import com.stockflow.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryMovementRepository movementRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseStockRepository warehouseStockRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PagedResponse<InventoryMovementDto.Response> getMovements(
            Long productId,
            Long warehouseId,
            MovementType type,
            Pageable pageable
    ) {
        Page<InventoryMovement> page = movementRepository.findMovements(productId, warehouseId, type, pageable);
        return PagedResponse.from(page.map(InventoryMovementDto.Response::fromEntity));
    }

    @Transactional
    public InventoryMovementDto.Response processAdjustment(InventoryMovementDto.AdjustmentRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con username: " + username));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + request.getProductId()));

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Almacén no encontrado con ID: " + request.getWarehouseId()));

        WarehouseStock stock = warehouseStockRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                .orElseGet(() -> WarehouseStock.builder()
                        .product(product)
                        .warehouse(warehouse)
                        .quantity(0)
                        .build());

        int prevStock = stock.getQuantity();
        int newStock;

        if (request.getType() == MovementType.ENTRY) {
            newStock = prevStock + request.getQuantity();
        } else if (request.getType() == MovementType.EXIT || request.getType() == MovementType.ADJUSTMENT) {
            if (prevStock < request.getQuantity()) {
                throw new InsufficientStockException(product.getSku(), request.getQuantity(), prevStock);
            }
            newStock = prevStock - request.getQuantity();
        } else {
            throw new BadRequestException("Tipo de movimiento inválido para ajuste: " + request.getType());
        }

        stock.setQuantity(newStock);
        warehouseStockRepository.save(stock);

        InventoryMovement movement = InventoryMovement.builder()
                .type(request.getType())
                .product(product)
                .warehouse(warehouse)
                .quantity(request.getQuantity())
                .previousStock(prevStock)
                .newStock(newStock)
                .referenceType(ReferenceType.MANUAL_ADJUSTMENT)
                .referenceId("ADJ-" + System.currentTimeMillis())
                .notes(request.getNotes())
                .createdBy(user)
                .build();

        return InventoryMovementDto.Response.fromEntity(movementRepository.save(movement));
    }

    @Transactional
    public InventoryMovementDto.Response processTransfer(InventoryMovementDto.TransferRequest request, String username) {
        if (request.getSourceWarehouseId().equals(request.getDestinationWarehouseId())) {
            throw new BadRequestException("El almacén de origen y destino no pueden ser el mismo");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con username: " + username));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + request.getProductId()));

        Warehouse sourceWh = warehouseRepository.findById(request.getSourceWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Almacén de origen no encontrado"));

        Warehouse destWh = warehouseRepository.findById(request.getDestinationWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Almacén de destino no encontrado"));

        // Source warehouse stock deduction
        WarehouseStock sourceStock = warehouseStockRepository.findByProductIdAndWarehouseId(product.getId(), sourceWh.getId())
                .orElseThrow(() -> new InsufficientStockException(product.getSku(), request.getQuantity(), 0));

        if (sourceStock.getQuantity() < request.getQuantity()) {
            throw new InsufficientStockException(product.getSku(), request.getQuantity(), sourceStock.getQuantity());
        }

        int sourcePrev = sourceStock.getQuantity();
        int sourceNew = sourcePrev - request.getQuantity();
        sourceStock.setQuantity(sourceNew);
        warehouseStockRepository.save(sourceStock);

        // Destination warehouse stock addition
        WarehouseStock destStock = warehouseStockRepository.findByProductIdAndWarehouseId(product.getId(), destWh.getId())
                .orElseGet(() -> WarehouseStock.builder()
                        .product(product)
                        .warehouse(destWh)
                        .quantity(0)
                        .build());

        int destPrev = destStock.getQuantity();
        int destNew = destPrev + request.getQuantity();
        destStock.setQuantity(destNew);
        warehouseStockRepository.save(destStock);

        String transferRef = "TRF-" + System.currentTimeMillis();

        // Register movement for source warehouse (EXIT/TRANSFER)
        InventoryMovement movement = InventoryMovement.builder()
                .type(MovementType.TRANSFER)
                .product(product)
                .warehouse(sourceWh)
                .destinationWarehouse(destWh)
                .quantity(request.getQuantity())
                .previousStock(sourcePrev)
                .newStock(sourceNew)
                .referenceType(ReferenceType.TRANSFER)
                .referenceId(transferRef)
                .notes(request.getNotes())
                .createdBy(user)
                .build();

        InventoryMovement saved = movementRepository.save(movement);

        // Also record corresponding entry movement at destination for clear double-entry traceability
        InventoryMovement destMovement = InventoryMovement.builder()
                .type(MovementType.ENTRY)
                .product(product)
                .warehouse(destWh)
                .destinationWarehouse(null)
                .quantity(request.getQuantity())
                .previousStock(destPrev)
                .newStock(destNew)
                .referenceType(ReferenceType.TRANSFER)
                .referenceId(transferRef)
                .notes("Recepción por transferencia desde " + sourceWh.getName() + ". " + (request.getNotes() != null ? request.getNotes() : ""))
                .createdBy(user)
                .build();
        movementRepository.save(destMovement);

        return InventoryMovementDto.Response.fromEntity(saved);
    }
}
