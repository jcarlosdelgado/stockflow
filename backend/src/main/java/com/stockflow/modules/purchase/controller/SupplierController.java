package com.stockflow.modules.purchase.controller;

import com.stockflow.modules.purchase.dto.SupplierDto;
import com.stockflow.modules.purchase.service.SupplierService;
import com.stockflow.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/suppliers")
@RequiredArgsConstructor
@Tag(name = "Proveedores", description = "Endpoints para la gestión del catálogo de proveedores")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    @Operation(summary = "Listar proveedores", description = "Obtiene los proveedores registrados con filtro opcional de activos")
    public ResponseEntity<ApiResponse<List<SupplierDto.Response>>> getAll(@RequestParam(required = false, defaultValue = "false") boolean onlyActive) {
        return ResponseEntity.ok(ApiResponse.ok(supplierService.getAllSuppliers(onlyActive)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener proveedor por ID", description = "Consulta los detalles de un proveedor específico")
    public ResponseEntity<ApiResponse<SupplierDto.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(supplierService.getSupplierById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSEMAN')")
    @Operation(summary = "Crear proveedor", description = "Registra un nuevo proveedor de productos")
    public ResponseEntity<ApiResponse<SupplierDto.Response>> create(@Valid @RequestBody SupplierDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Proveedor registrado exitosamente", supplierService.createSupplier(request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Activar / Desactivar proveedor", description = "Modifica el estado de un proveedor")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id, @RequestParam boolean active) {
        supplierService.toggleActiveStatus(id, active);
        return ResponseEntity.ok(ApiResponse.ok("Estado del proveedor actualizado", null));
    }
}
