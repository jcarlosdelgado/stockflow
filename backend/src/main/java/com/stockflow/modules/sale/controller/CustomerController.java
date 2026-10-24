package com.stockflow.modules.sale.controller;

import com.stockflow.modules.sale.dto.CustomerDto;
import com.stockflow.modules.sale.service.CustomerService;
import com.stockflow.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Tag(name = "Clientes", description = "Endpoints para la consulta y registro de clientes")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @Operation(summary = "Listar clientes", description = "Obtiene la lista de clientes registrados")
    public ResponseEntity<ApiResponse<List<CustomerDto.Response>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(customerService.getAllCustomers()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener cliente por ID", description = "Consulta los detalles de un cliente específico")
    public ResponseEntity<ApiResponse<CustomerDto.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(customerService.getCustomerById(id)));
    }

    @PostMapping
    @Operation(summary = "Registrar nuevo cliente", description = "Crea un nuevo cliente en el sistema")
    public ResponseEntity<ApiResponse<CustomerDto.Response>> create(@Valid @RequestBody CustomerDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Cliente registrado exitosamente", customerService.createCustomer(request)));
    }
}
