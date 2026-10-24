package com.stockflow.modules.category.dto;

import com.stockflow.modules.category.entity.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

public class CategoryDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private Boolean isActive;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;

        public static Response fromEntity(Category category) {
            return Response.builder()
                    .id(category.getId())
                    .name(category.getName())
                    .description(category.getDescription())
                    .isActive(category.getIsActive())
                    .createdAt(category.getCreatedAt())
                    .updatedAt(category.getUpdatedAt())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "El nombre de la categoría es obligatorio")
        @Size(max = 100, message = "El nombre no puede exceder los 100 caracteres")
        private String name;

        @Size(max = 255, message = "La descripción no puede exceder los 255 caracteres")
        private String description;

        @Builder.Default
        private Boolean isActive = true;
    }
}
