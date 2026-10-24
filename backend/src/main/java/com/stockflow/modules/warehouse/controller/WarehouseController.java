package com.stockflow.modules.warehouse.controller;

import com.stockflow.modules.warehouse.dto.WarehouseDto;
import com.stockflow.modules.warehouse.service.WarehouseService;
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
@RequestMapping("/api/v1/warehouses")
@RequiredArgsConstructor
@Tag(name = "Almacenes", description = "Endpoints para la administración de almacenes y consulta de existencias")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping
    @Operation(summary = "Listar almacenes", description = "Obtiene la lista de almacenes registrados")
    public ResponseEntity<ApiResponse<List<WarehouseDto.Response>>> getAll(@RequestParam(required = false, defaultValue = "false") boolean onlyActive) {
        return ResponseEntity.ok(ApiResponse.ok(warehouseService.getAllWarehouses(onlyActive)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener almacén por ID", description = "Consulta los detalles de un almacén específico")
    public ResponseEntity<ApiResponse<WarehouseDto.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(warehouseService.getWarehouseById(id)));
    }

    @GetMapping("/{id}/stocks")
    @Operation(summary = "Consultar existencias por almacén", description = "Obtiene el inventario detallado de todos los productos en un almacén")
    public ResponseEntity<ApiResponse<List<WarehouseDto.StockItem>>> getStocks(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(warehouseService.getStocksByWarehouse(id)));
    }

    @GetMapping("/products/{productId}/stocks")
    @Operation(summary = "Consultar existencias de un producto por almacén", description = "Obtiene el desglose de existencias de un producto en cada almacén")
    public ResponseEntity<ApiResponse<List<WarehouseDto.StockItem>>> getProductStocks(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(warehouseService.getStocksByProduct(productId)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Crear almacén", description = "Registra un nuevo almacén (Requiere rol ROLE_ADMIN)")
    public ResponseEntity<ApiResponse<WarehouseDto.Response>> create(@Valid @RequestBody WarehouseDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Almacén creado exitosamente", warehouseService.createWarehouse(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Actualizar almacén", description = "Modifica los datos de un almacén existente (Requiere rol ROLE_ADMIN)")
    public ResponseEntity<ApiResponse<WarehouseDto.Response>> update(@PathVariable Long id, @Valid @RequestBody WarehouseDto.Request request) {
        return ResponseEntity.ok(ApiResponse.ok("Almacén actualizado exitosamente", warehouseService.updateWarehouse(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Activar / Desactivar almacén", description = "Cambia el estado de un almacén")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id, @RequestParam boolean active) {
        warehouseService.toggleActiveStatus(id, active);
        return ResponseEntity.ok(ApiResponse.ok("Estado del almacén actualizado correctamente", null));
    }
}
