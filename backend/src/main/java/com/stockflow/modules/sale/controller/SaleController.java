package com.stockflow.modules.sale.controller;

import com.stockflow.modules.sale.dto.SaleDto;
import com.stockflow.modules.sale.service.SaleService;
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
@RequestMapping("/api/v1/sales")
@RequiredArgsConstructor
@Tag(name = "Ventas", description = "Endpoints para registro de ventas, cálculo de totales y consulta de comprobantes")
public class SaleController {

    private final SaleService saleService;

    @GetMapping
    @Operation(summary = "Listar ventas", description = "Obtiene el historial paginado de ventas, con filtro opcional por almacén")
    public ResponseEntity<ApiResponse<PagedResponse<SaleDto.Response>>> getAllSales(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.ok(saleService.getAllSales(warehouseId, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar venta por ID", description = "Obtiene el detalle completo de una venta y sus ítems")
    public ResponseEntity<ApiResponse<SaleDto.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(saleService.getSaleById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SELLER')")
    @Operation(summary = "Registrar nueva venta", description = "Crea una venta con descuento transaccional automático de existencias")
    public ResponseEntity<ApiResponse<SaleDto.Response>> createSale(
            @Valid @RequestBody SaleDto.Request request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        SaleDto.Response response = saleService.createSale(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Venta procesada exitosamente", response));
    }
}
