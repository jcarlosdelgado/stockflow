package com.stockflow.modules.purchase.controller;

import com.stockflow.modules.purchase.dto.PurchaseDto;
import com.stockflow.modules.purchase.entity.PurchaseStatus;
import com.stockflow.modules.purchase.service.PurchaseService;
import com.stockflow.shared.ApiResponse;
import com.stockflow.shared.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/purchases")
@RequiredArgsConstructor
@Tag(name = "Compras", description = "Endpoints para la gestión de órdenes de compra y recepción de mercancía")
public class PurchaseController {

    private final PurchaseService purchaseService;

    @GetMapping
    @Operation(summary = "Listar órdenes de compra", description = "Obtiene el historial de órdenes de compra con filtros por estado y almacén")
    public ResponseEntity<ApiResponse<PagedResponse<PurchaseDto.Response>>> getAll(
            @RequestParam(required = false) PurchaseStatus status,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.ok(purchaseService.getAllPurchases(status, warehouseId, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener orden de compra por ID", description = "Consulta los detalles y productos solicitados en una orden")
    public ResponseEntity<ApiResponse<PurchaseDto.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseService.getPurchaseById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSEMAN')")
    @Operation(summary = "Crear orden de compra", description = "Genera una orden de compra en estado PENDING sin alterar el inventario todavía")
    public ResponseEntity<ApiResponse<PurchaseDto.Response>> create(
            @Valid @RequestBody PurchaseDto.Request request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        PurchaseDto.Response response = purchaseService.createPurchaseOrder(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Orden de compra creada exitosamente", response));
    }

    @PatchMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSEMAN')")
    @Operation(summary = "Confirmar recepción de mercancía", description = "Confirma la entrada física de la orden al almacén y actualiza existencias")
    public ResponseEntity<ApiResponse<PurchaseDto.Response>> receive(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        PurchaseDto.Response response = purchaseService.receivePurchaseOrder(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Mercancía recepcionada e inventario actualizado", response));
    }
}
