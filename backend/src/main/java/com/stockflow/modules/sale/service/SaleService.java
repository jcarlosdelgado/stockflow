package com.stockflow.modules.sale.service;

import com.stockflow.modules.inventory.entity.InventoryMovement;
import com.stockflow.modules.inventory.entity.MovementType;
import com.stockflow.modules.inventory.entity.ReferenceType;
import com.stockflow.modules.inventory.repository.InventoryMovementRepository;
import com.stockflow.modules.product.entity.Product;
import com.stockflow.modules.product.repository.ProductRepository;
import com.stockflow.modules.sale.dto.SaleDto;
import com.stockflow.modules.sale.entity.Customer;
import com.stockflow.modules.sale.entity.Sale;
import com.stockflow.modules.sale.entity.SaleItem;
import com.stockflow.modules.sale.entity.SaleStatus;
import com.stockflow.modules.sale.repository.CustomerRepository;
import com.stockflow.modules.sale.repository.SaleRepository;
import com.stockflow.modules.user.entity.User;
import com.stockflow.modules.user.repository.UserRepository;
import com.stockflow.modules.warehouse.entity.Warehouse;
import com.stockflow.modules.warehouse.entity.WarehouseStock;
import com.stockflow.modules.warehouse.repository.WarehouseRepository;
import com.stockflow.modules.warehouse.repository.WarehouseStockRepository;
import com.stockflow.shared.PagedResponse;
import com.stockflow.shared.exception.InsufficientStockException;
import com.stockflow.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final WarehouseStockRepository warehouseStockRepository;
    private final InventoryMovementRepository movementRepository;

    @Transactional(readOnly = true)
    public PagedResponse<SaleDto.Response> getAllSales(Long warehouseId, Pageable pageable) {
        Page<Sale> page = saleRepository.findAllSales(warehouseId, pageable);
        return PagedResponse.from(page.map(SaleDto.Response::fromEntity));
    }

    @Transactional(readOnly = true)
    public SaleDto.Response getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + id));
        return SaleDto.Response.fromEntity(sale);
    }

    @Transactional
    public SaleDto.Response createSale(SaleDto.Request request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con username: " + username));

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Almacén no encontrado con ID: " + request.getWarehouseId()));

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con ID: " + request.getCustomerId()));
        }

        String invoiceNumber = "INV-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmssSSS"));

        Sale sale = Sale.builder()
                .invoiceNumber(invoiceNumber)
                .customer(customer)
                .user(user)
                .warehouse(warehouse)
                .status(SaleStatus.COMPLETED)
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (SaleDto.ItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + itemReq.getProductId()));

            WarehouseStock stock = warehouseStockRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                    .orElseThrow(() -> new InsufficientStockException(product.getSku(), itemReq.getQuantity(), 0));

            if (stock.getQuantity() < itemReq.getQuantity()) {
                throw new InsufficientStockException(product.getSku(), itemReq.getQuantity(), stock.getQuantity());
            }

            int prevStock = stock.getQuantity();
            int newStock = prevStock - itemReq.getQuantity();
            stock.setQuantity(newStock);
            warehouseStockRepository.save(stock);

            // Record movement audit
            InventoryMovement movement = InventoryMovement.builder()
                    .type(MovementType.EXIT)
                    .product(product)
                    .warehouse(warehouse)
                    .quantity(itemReq.getQuantity())
                    .previousStock(prevStock)
                    .newStock(newStock)
                    .referenceType(ReferenceType.SALE)
                    .referenceId(invoiceNumber)
                    .notes("Venta registrada bajo factura: " + invoiceNumber)
                    .createdBy(user)
                    .build();
            movementRepository.save(movement);

            BigDecimal lineSubtotal = product.getSalePrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(lineSubtotal);

            SaleItem item = SaleItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getSalePrice())
                    .subtotal(lineSubtotal)
                    .build();

            sale.addItem(item);
        }

        BigDecimal tax = subtotal.multiply(new BigDecimal("0.16")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax).setScale(2, RoundingMode.HALF_UP);

        sale.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        sale.setTax(tax);
        sale.setTotal(total);

        Sale saved = saleRepository.save(sale);
        return SaleDto.Response.fromEntity(saved);
    }
}
