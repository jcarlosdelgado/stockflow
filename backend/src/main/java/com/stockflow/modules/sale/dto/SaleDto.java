package com.stockflow.modules.sale.dto;

import com.stockflow.modules.sale.entity.PaymentMethod;
import com.stockflow.modules.sale.entity.Sale;
import com.stockflow.modules.sale.entity.SaleItem;
import com.stockflow.modules.sale.entity.SaleStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class SaleDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String invoiceNumber;
        private Long customerId;
        private String customerName;
        private Long userId;
        private String userName;
        private Long warehouseId;
        private String warehouseName;
        private SaleStatus status;
        private PaymentMethod paymentMethod;
        private BigDecimal subtotal;
        private BigDecimal tax;
        private BigDecimal total;
        private String notes;
        private List<ItemResponse> items;
        private OffsetDateTime createdAt;

        public static Response fromEntity(Sale s) {
            return Response.builder()
                    .id(s.getId())
                    .invoiceNumber(s.getInvoiceNumber())
                    .customerId(s.getCustomer() != null ? s.getCustomer().getId() : null)
                    .customerName(s.getCustomer() != null ? s.getCustomer().getName() : "Venta Mostrador")
                    .userId(s.getUser().getId())
                    .userName(s.getUser().getFirstName() + " " + s.getUser().getLastName())
                    .warehouseId(s.getWarehouse().getId())
                    .warehouseName(s.getWarehouse().getName())
                    .status(s.getStatus())
                    .paymentMethod(s.getPaymentMethod())
                    .subtotal(s.getSubtotal())
                    .tax(s.getTax())
                    .total(s.getTotal())
                    .notes(s.getNotes())
                    .items(s.getItems().stream().map(ItemResponse::fromEntity).collect(Collectors.toList()))
                    .createdAt(s.getCreatedAt())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemResponse {
        private Long id;
        private Long productId;
        private String productSku;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;

        public static ItemResponse fromEntity(SaleItem item) {
            return ItemResponse.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .productSku(item.getProduct().getSku())
                    .productName(item.getProduct().getName())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .subtotal(item.getSubtotal())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private Long customerId;

        @NotNull(message = "El almacén de despacho es obligatorio")
        private Long warehouseId;

        @NotNull(message = "El método de pago es obligatorio")
        private PaymentMethod paymentMethod;

        private String notes;

        @NotEmpty(message = "La venta debe contener al menos un producto")
        @Valid
        private List<ItemRequest> items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemRequest {
        @NotNull(message = "El producto es obligatorio")
        private Long productId;

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad mínima debe ser 1")
        private Integer quantity;
    }
}
