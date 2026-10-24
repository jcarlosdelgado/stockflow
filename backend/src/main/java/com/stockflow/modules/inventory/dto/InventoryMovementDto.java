package com.stockflow.modules.inventory.dto;

import com.stockflow.modules.inventory.entity.InventoryMovement;
import com.stockflow.modules.inventory.entity.MovementType;
import com.stockflow.modules.inventory.entity.ReferenceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

public class InventoryMovementDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private MovementType type;
        private Long productId;
        private String productSku;
        private String productName;
        private Long warehouseId;
        private String warehouseCode;
        private String warehouseName;
        private Long destinationWarehouseId;
        private String destinationWarehouseCode;
        private String destinationWarehouseName;
        private Integer quantity;
        private Integer previousStock;
        private Integer newStock;
        private ReferenceType referenceType;
        private String referenceId;
        private String notes;
        private Long createdById;
        private String createdByName;
        private OffsetDateTime createdAt;

        public static Response fromEntity(InventoryMovement m) {
            return Response.builder()
                    .id(m.getId())
                    .type(m.getType())
                    .productId(m.getProduct().getId())
                    .productSku(m.getProduct().getSku())
                    .productName(m.getProduct().getName())
                    .warehouseId(m.getWarehouse().getId())
                    .warehouseCode(m.getWarehouse().getCode())
                    .warehouseName(m.getWarehouse().getName())
                    .destinationWarehouseId(m.getDestinationWarehouse() != null ? m.getDestinationWarehouse().getId() : null)
                    .destinationWarehouseCode(m.getDestinationWarehouse() != null ? m.getDestinationWarehouse().getCode() : null)
                    .destinationWarehouseName(m.getDestinationWarehouse() != null ? m.getDestinationWarehouse().getName() : null)
                    .quantity(m.getQuantity())
                    .previousStock(m.getPreviousStock())
                    .newStock(m.getNewStock())
                    .referenceType(m.getReferenceType())
                    .referenceId(m.getReferenceId())
                    .notes(m.getNotes())
                    .createdById(m.getCreatedBy() != null ? m.getCreatedBy().getId() : null)
                    .createdByName(m.getCreatedBy() != null ? m.getCreatedBy().getFirstName() + " " + m.getCreatedBy().getLastName() : null)
                    .createdAt(m.getCreatedAt())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdjustmentRequest {
        @NotNull(message = "El producto es obligatorio")
        private Long productId;

        @NotNull(message = "El almacén es obligatorio")
        private Long warehouseId;

        @NotNull(message = "El tipo de ajuste es obligatorio (ENTRY o EXIT o ADJUSTMENT)")
        private MovementType type;

        @NotNull(message = "La cantidad debe ser mayor a 0")
        @Min(value = 1, message = "La cantidad mínima debe ser 1")
        private Integer quantity;

        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransferRequest {
        @NotNull(message = "El producto es obligatorio")
        private Long productId;

        @NotNull(message = "El almacén de origen es obligatorio")
        private Long sourceWarehouseId;

        @NotNull(message = "El almacén de destino es obligatorio")
        private Long destinationWarehouseId;

        @NotNull(message = "La cantidad a transferir debe ser mayor a 0")
        @Min(value = 1, message = "La cantidad mínima a transferir debe ser 1")
        private Integer quantity;

        private String notes;
    }
}
