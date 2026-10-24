package com.stockflow.modules.purchase.service;

import com.stockflow.modules.inventory.entity.InventoryMovement;
import com.stockflow.modules.inventory.entity.MovementType;
import com.stockflow.modules.inventory.entity.ReferenceType;
import com.stockflow.modules.inventory.repository.InventoryMovementRepository;
import com.stockflow.modules.product.entity.Product;
import com.stockflow.modules.product.repository.ProductRepository;
import com.stockflow.modules.purchase.dto.PurchaseDto;
import com.stockflow.modules.purchase.entity.PurchaseOrder;
import com.stockflow.modules.purchase.entity.PurchaseOrderItem;
import com.stockflow.modules.purchase.entity.PurchaseStatus;
import com.stockflow.modules.purchase.entity.Supplier;
import com.stockflow.modules.purchase.repository.PurchaseOrderRepository;
import com.stockflow.modules.purchase.repository.SupplierRepository;
import com.stockflow.modules.user.entity.User;
import com.stockflow.modules.user.repository.UserRepository;
import com.stockflow.modules.warehouse.entity.Warehouse;
import com.stockflow.modules.warehouse.entity.WarehouseStock;
import com.stockflow.modules.warehouse.repository.WarehouseRepository;
import com.stockflow.modules.warehouse.repository.WarehouseStockRepository;
import com.stockflow.shared.PagedResponse;
import com.stockflow.shared.exception.BadRequestException;
import com.stockflow.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final WarehouseStockRepository warehouseStockRepository;
    private final InventoryMovementRepository movementRepository;

    @Transactional(readOnly = true)
    public PagedResponse<PurchaseDto.Response> getAllPurchases(PurchaseStatus status, Long warehouseId, Pageable pageable) {
        Page<PurchaseOrder> page = purchaseOrderRepository.findAllOrders(status, warehouseId, pageable);
        return PagedResponse.from(page.map(PurchaseDto.Response::fromEntity));
    }

    @Transactional(readOnly = true)
    public PurchaseDto.Response getPurchaseById(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de compra no encontrada con ID: " + id));
        return PurchaseDto.Response.fromEntity(po);
    }

    @Transactional
    public PurchaseDto.Response createPurchaseOrder(PurchaseDto.Request request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con username: " + username));

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con ID: " + request.getSupplierId()));

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Almacén de destino no encontrado con ID: " + request.getWarehouseId()));

        String orderNumber = "PO-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmssSSS"));

        PurchaseOrder po = PurchaseOrder.builder()
                .orderNumber(orderNumber)
                .supplier(supplier)
                .warehouse(warehouse)
                .user(user)
                .status(PurchaseStatus.PENDING)
                .notes(request.getNotes())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (PurchaseDto.ItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + itemReq.getProductId()));

            BigDecimal lineSubtotal = itemReq.getUnitCost().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(lineSubtotal);

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitCost(itemReq.getUnitCost())
                    .subtotal(lineSubtotal)
                    .build();

            po.addItem(item);
        }

        po.setTotalAmount(totalAmount);
        // Important: does NOT increment inventory until receipt is confirmed!
        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return PurchaseDto.Response.fromEntity(saved);
    }

    @Transactional
    public PurchaseDto.Response receivePurchaseOrder(Long orderId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con username: " + username));

        PurchaseOrder po = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de compra no encontrada con ID: " + orderId));

        if (po.getStatus() != PurchaseStatus.PENDING) {
            throw new BadRequestException("La orden de compra no se encuentra en estado PENDING (estado actual: " + po.getStatus() + ")");
        }

        Warehouse warehouse = po.getWarehouse();

        // Increment stock and record audit movements for each received item
        for (PurchaseOrderItem item : po.getItems()) {
            Product product = item.getProduct();

            WarehouseStock stock = warehouseStockRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                    .orElseGet(() -> WarehouseStock.builder()
                            .product(product)
                            .warehouse(warehouse)
                            .quantity(0)
                            .build());

            int prevStock = stock.getQuantity();
            int newStock = prevStock + item.getQuantity();
            stock.setQuantity(newStock);
            warehouseStockRepository.save(stock);

            // Audit movement
            InventoryMovement movement = InventoryMovement.builder()
                    .type(MovementType.ENTRY)
                    .product(product)
                    .warehouse(warehouse)
                    .quantity(item.getQuantity())
                    .previousStock(prevStock)
                    .newStock(newStock)
                    .referenceType(ReferenceType.PURCHASE)
                    .referenceId(po.getOrderNumber())
                    .notes("Recepción de mercancía por orden de compra: " + po.getOrderNumber())
                    .createdBy(user)
                    .build();
            movementRepository.save(movement);
        }

        po.setStatus(PurchaseStatus.RECEIVED);
        po.setReceivedAt(OffsetDateTime.now());

        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return PurchaseDto.Response.fromEntity(saved);
    }
}
