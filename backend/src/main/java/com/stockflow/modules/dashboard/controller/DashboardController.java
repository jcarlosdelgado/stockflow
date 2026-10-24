package com.stockflow.modules.dashboard.controller;

import com.stockflow.modules.dashboard.dto.DashboardStatsDto;
import com.stockflow.modules.dashboard.service.DashboardService;
import com.stockflow.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard y Métricas", description = "Endpoints para KPIs, resumen de inventario, ventas y alertas")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Obtener estadísticas generales", description = "Retorna métricas ejecutivas: productos activos, existencias bajas, valor de inventario, ventas y movimientos recientes")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDashboardStats()));
    }
}
