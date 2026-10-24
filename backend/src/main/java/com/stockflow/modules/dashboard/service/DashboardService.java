package com.stockflow.modules.dashboard.service;

import com.stockflow.modules.dashboard.dto.DashboardStatsDto;
import com.stockflow.modules.inventory.dto.InventoryMovementDto;
import com.stockflow.modules.inventory.repository.InventoryMovementRepository;
import com.stockflow.modules.product.repository.ProductRepository;
import com.stockflow.modules.sale.repository.SaleRepository;
import com.stockflow.modules.warehouse.repository.WarehouseRepository;
import com.stockflow.modules.warehouse.repository.WarehouseStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseStockRepository warehouseStockRepository;
    private final SaleRepository saleRepository;
    private final InventoryMovementRepository movementRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        long activeProducts = productRepository.countActiveProducts();
        long activeWarehouses = warehouseRepository.findByIsActiveTrue().size();
        List<Long> lowStockIds = warehouseStockRepository.findLowStockProductIds();
        long lowStockCount = lowStockIds != null ? lowStockIds.size() : 0;

        BigDecimal inventoryValue = warehouseStockRepository.calculateTotalInventoryCost();
        if (inventoryValue == null) {
            inventoryValue = BigDecimal.ZERO;
        }

        LocalDate today = LocalDate.now();
        OffsetDateTime startOfDay = today.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay().atOffset(ZoneOffset.UTC);

        BigDecimal todaySalesTotal = saleRepository.calculateSalesSince(startOfDay);
        long todaySalesCount = saleRepository.countSalesSince(startOfDay);

        BigDecimal monthlySalesTotal = saleRepository.calculateSalesSince(startOfMonth);
        long monthlySalesCount = saleRepository.countSalesSince(startOfMonth);

        List<InventoryMovementDto.Response> recentMovements = movementRepository
                .findTop10RecentMovements(PageRequest.of(0, 8))
                .stream()
                .map(InventoryMovementDto.Response::fromEntity)
                .collect(Collectors.toList());

        return DashboardStatsDto.builder()
                .totalActiveProducts(activeProducts)
                .totalLowStockProducts(lowStockCount)
                .totalWarehouses(activeWarehouses)
                .estimatedInventoryValue(inventoryValue)
                .todaySalesTotal(todaySalesTotal != null ? todaySalesTotal : BigDecimal.ZERO)
                .todaySalesCount(todaySalesCount)
                .monthlySalesTotal(monthlySalesTotal != null ? monthlySalesTotal : BigDecimal.ZERO)
                .monthlySalesCount(monthlySalesCount)
                .recentMovements(recentMovements)
                .build();
    }
}
