package com.stockflow.modules.product.dto;

import com.stockflow.modules.product.entity.Product;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class ProductDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String sku;
        private String name;
        private String description;
        private Long categoryId;
        private String categoryName;
        private String unitOfMeasure;
        private BigDecimal costPrice;
        private BigDecimal salePrice;
        private Integer minStock;
        private Integer totalStock;
        private Boolean isLowStock;
        private Boolean isActive;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;

        public static Response fromEntity(Product product, Integer totalStock) {
            int currentStock = totalStock != null ? totalStock : 0;
            return Response.builder()
                    .id(product.getId())
                    .sku(product.getSku())
                    .name(product.getName())
                    .description(product.getDescription())
                    .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                    .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                    .unitOfMeasure(product.getUnitOfMeasure())
                    .costPrice(product.getCostPrice())
                    .salePrice(product.getSalePrice())
                    .minStock(product.getMinStock())
                    .totalStock(currentStock)
                    .isLowStock(currentStock <= product.getMinStock())
                    .isActive(product.getIsActive())
                    .createdAt(product.getCreatedAt())
                    .updatedAt(product.getUpdatedAt())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "El código SKU es obligatorio")
        @Size(max = 50, message = "El SKU no puede exceder los 50 caracteres")
        private String sku;

        @NotBlank(message = "El nombre del producto es obligatorio")
        @Size(max = 150, message = "El nombre no puede exceder los 150 caracteres")
        private String name;

        private String description;

        @NotNull(message = "La categoría es obligatoria")
        private Long categoryId;

        @NotBlank(message = "La unidad de medida es obligatoria")
        private String unitOfMeasure;

        @NotNull(message = "El precio de costo es obligatorio")
        @DecimalMin(value = "0.0", inclusive = true, message = "El precio de costo debe ser mayor o igual a 0")
        private BigDecimal costPrice;

        @NotNull(message = "El precio de venta es obligatorio")
        @DecimalMin(value = "0.0", inclusive = true, message = "El precio de venta debe ser mayor o igual a 0")
        private BigDecimal salePrice;

        @NotNull(message = "El stock mínimo es obligatorio")
        @Min(value = 0, message = "El stock mínimo no puede ser negativo")
        private Integer minStock;

        @Builder.Default
        private Boolean isActive = true;
    }
}
