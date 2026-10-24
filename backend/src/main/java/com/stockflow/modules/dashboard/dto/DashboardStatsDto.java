package com.stockflow.modules.dashboard.dto;

import com.stockflow.modules.inventory.dto.InventoryMovementDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalActiveProducts;
    private long totalLowStockProducts;
    private long totalWarehouses;
    private BigDecimal estimatedInventoryValue;
    private BigDecimal todaySalesTotal;
    private long todaySalesCount;
    private BigDecimal monthlySalesTotal;
    private long monthlySalesCount;
    private List<InventoryMovementDto.Response> recentMovements;
}
