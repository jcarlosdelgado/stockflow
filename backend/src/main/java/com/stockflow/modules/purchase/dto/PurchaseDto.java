package com.stockflow.modules.purchase.dto;

import com.stockflow.modules.purchase.entity.PurchaseOrder;
import com.stockflow.modules.purchase.entity.PurchaseOrderItem;
import com.stockflow.modules.purchase.entity.PurchaseStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
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

public class PurchaseDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String orderNumber;
        private Long supplierId;
        private String supplierCompanyName;
        private Long warehouseId;
        private String warehouseName;
        private PurchaseStatus status;
        private Long userId;
        private String userName;
        private BigDecimal totalAmount;
        private OffsetDateTime receivedAt;
        private String notes;
        private List<ItemResponse> items;
        private OffsetDateTime createdAt;

        public static Response fromEntity(PurchaseOrder po) {
            return Response.builder()
                    .id(po.getId())
                    .orderNumber(po.getOrderNumber())
                    .supplierId(po.getSupplier().getId())
                    .supplierCompanyName(po.getSupplier().getCompanyName())
                    .warehouseId(po.getWarehouse().getId())
                    .warehouseName(po.getWarehouse().getName())
                    .status(po.getStatus())
                    .userId(po.getUser().getId())
                    .userName(po.getUser().getFirstName() + " " + po.getUser().getLastName())
                    .totalAmount(po.getTotalAmount())
                    .receivedAt(po.getReceivedAt())
                    .notes(po.getNotes())
                    .items(po.getItems().stream().map(ItemResponse::fromEntity).collect(Collectors.toList()))
                    .createdAt(po.getCreatedAt())
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
        private BigDecimal unitCost;
        private BigDecimal subtotal;

        public static ItemResponse fromEntity(PurchaseOrderItem item) {
            return ItemResponse.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .productSku(item.getProduct().getSku())
                    .productName(item.getProduct().getName())
                    .quantity(item.getQuantity())
                    .unitCost(item.getUnitCost())
                    .subtotal(item.getSubtotal())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotNull(message = "El proveedor es obligatorio")
        private Long supplierId;

        @NotNull(message = "El almacén de destino es obligatorio")
        private Long warehouseId;

        private String notes;

        @NotEmpty(message = "La orden de compra debe contener al menos un producto")
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

        @NotNull(message = "El costo unitario es obligatorio")
        @DecimalMin(value = "0.0", inclusive = true, message = "El costo unitario debe ser mayor o igual a 0")
        private BigDecimal unitCost;
    }
}
