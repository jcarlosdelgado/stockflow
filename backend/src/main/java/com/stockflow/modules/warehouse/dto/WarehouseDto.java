package com.stockflow.modules.warehouse.dto;

import com.stockflow.modules.warehouse.entity.Warehouse;
import com.stockflow.modules.warehouse.entity.WarehouseStock;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

public class WarehouseDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String code;
        private String name;
        private String address;
        private Boolean isActive;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;

        public static Response fromEntity(Warehouse warehouse) {
            return Response.builder()
                    .id(warehouse.getId())
                    .code(warehouse.getCode())
                    .name(warehouse.getName())
                    .address(warehouse.getAddress())
                    .isActive(warehouse.getIsActive())
                    .createdAt(warehouse.getCreatedAt())
                    .updatedAt(warehouse.getUpdatedAt())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "El código del almacén es obligatorio")
        @Size(max = 30, message = "El código no puede exceder los 30 caracteres")
        private String code;

        @NotBlank(message = "El nombre del almacén es obligatorio")
        @Size(max = 100, message = "El nombre no puede exceder los 100 caracteres")
        private String name;

        @Size(max = 255, message = "La dirección no puede exceder los 255 caracteres")
        private String address;

        @Builder.Default
        private Boolean isActive = true;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockItem {
        private Long stockId;
        private Long productId;
        private String productSku;
        private String productName;
        private Long warehouseId;
        private String warehouseCode;
        private String warehouseName;
        private Integer quantity;
        private OffsetDateTime updatedAt;

        public static StockItem fromEntity(WarehouseStock stock) {
            return StockItem.builder()
                    .stockId(stock.getId())
                    .productId(stock.getProduct().getId())
                    .productSku(stock.getProduct().getSku())
                    .productName(stock.getProduct().getName())
                    .warehouseId(stock.getWarehouse().getId())
                    .warehouseCode(stock.getWarehouse().getCode())
                    .warehouseName(stock.getWarehouse().getName())
                    .quantity(stock.getQuantity())
                    .updatedAt(stock.getUpdatedAt())
                    .build();
        }
    }
}
