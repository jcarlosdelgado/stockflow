package com.stockflow.modules.inventory.controller;

import com.stockflow.modules.inventory.dto.InventoryMovementDto;
import com.stockflow.modules.inventory.entity.MovementType;
import com.stockflow.modules.inventory.service.InventoryService;
import com.stockflow.shared.ApiResponse;
import com.stockflow.shared.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Control de Inventario", description = "Endpoints para registro de movimientos, transferencias, ajustes y auditoría")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/movements")
    @Operation(summary = "Consultar historial de movimientos", description = "Lista movimientos con filtros por producto, almacén y tipo de movimiento")
    public ResponseEntity<ApiResponse<PagedResponse<InventoryMovementDto.Response>>> getMovements(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) MovementType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getMovements(productId, warehouseId, type, pageable)));
    }

    @PostMapping("/adjustments")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSEMAN')")
    @Operation(summary = "Realizar ajuste de inventario", description = "Registra una entrada, salida o ajuste manual directo de stock")
    public ResponseEntity<ApiResponse<InventoryMovementDto.Response>> adjustStock(
            @Valid @RequestBody InventoryMovementDto.AdjustmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        InventoryMovementDto.Response response = inventoryService.processAdjustment(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Ajuste de inventario procesado exitosamente", response));
    }

    @PostMapping("/transfers")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSEMAN')")
    @Operation(summary = "Transferencia entre almacenes", description = "Transfiere existencias de un almacén de origen a un almacén de destino de forma atómica")
    public ResponseEntity<ApiResponse<InventoryMovementDto.Response>> transferStock(
            @Valid @RequestBody InventoryMovementDto.TransferRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        InventoryMovementDto.Response response = inventoryService.processTransfer(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Transferencia de existencias realizada exitosamente", response));
    }
}
