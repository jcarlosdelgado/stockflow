package com.stockflow.modules.sale.dto;

import com.stockflow.modules.sale.entity.Customer;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

public class CustomerDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String documentNumber;
        private String name;
        private String email;
        private String phone;
        private String address;
        private Boolean isActive;
        private OffsetDateTime createdAt;

        public static Response fromEntity(Customer customer) {
            return Response.builder()
                    .id(customer.getId())
                    .documentNumber(customer.getDocumentNumber())
                    .name(customer.getName())
                    .email(customer.getEmail())
                    .phone(customer.getPhone())
                    .address(customer.getAddress())
                    .isActive(customer.getIsActive())
                    .createdAt(customer.getCreatedAt())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String documentNumber;

        @NotBlank(message = "El nombre del cliente es obligatorio")
        @Size(max = 150, message = "El nombre no puede exceder los 150 caracteres")
        private String name;

        private String email;
        private String phone;
        private String address;
    }
}
