package com.stockflow.modules.purchase.dto;

import com.stockflow.modules.purchase.entity.Supplier;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

public class SupplierDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String documentNumber;
        private String companyName;
        private String contactName;
        private String email;
        private String phone;
        private String address;
        private Boolean isActive;
        private OffsetDateTime createdAt;

        public static Response fromEntity(Supplier s) {
            return Response.builder()
                    .id(s.getId())
                    .documentNumber(s.getDocumentNumber())
                    .companyName(s.getCompanyName())
                    .contactName(s.getContactName())
                    .email(s.getEmail())
                    .phone(s.getPhone())
                    .address(s.getAddress())
                    .isActive(s.getIsActive())
                    .createdAt(s.getCreatedAt())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String documentNumber;

        @NotBlank(message = "El nombre de la empresa es obligatorio")
        @Size(max = 150, message = "El nombre de la empresa no puede exceder 150 caracteres")
        private String companyName;

        private String contactName;
        private String email;
        private String phone;
        private String address;
        @Builder.Default
        private Boolean isActive = true;
    }
}
