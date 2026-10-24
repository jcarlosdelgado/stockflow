package com.stockflow.modules.warehouse.repository;

import com.stockflow.modules.warehouse.entity.WarehouseStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseStockRepository extends JpaRepository<WarehouseStock, Long> {

    Optional<WarehouseStock> findByProductIdAndWarehouseId(Long productId, Long warehouseId);

    @Query("SELECT COALESCE(SUM(ws.quantity), 0) FROM WarehouseStock ws WHERE ws.product.id = :productId")
    Integer getTotalStockByProductId(@Param("productId") Long productId);

    @Query("SELECT ws FROM WarehouseStock ws " +
           "JOIN FETCH ws.warehouse w " +
           "WHERE ws.product.id = :productId")
    List<WarehouseStock> findByProductIdWithWarehouse(@Param("productId") Long productId);

    @Query("SELECT ws FROM WarehouseStock ws " +
           "JOIN FETCH ws.product p " +
           "JOIN FETCH p.category c " +
           "WHERE ws.warehouse.id = :warehouseId")
    List<WarehouseStock> findByWarehouseIdWithProduct(@Param("warehouseId") Long warehouseId);

    @Query("SELECT COUNT(DISTINCT ws.product.id) FROM WarehouseStock ws " +
           "GROUP BY ws.product.id " +
           "HAVING SUM(ws.quantity) <= (SELECT p.minStock FROM Product p WHERE p.id = ws.product.id)")
    List<Long> findLowStockProductIds();

    @Query("SELECT COALESCE(SUM(CAST(ws.quantity AS bigdecimal) * p.costPrice), 0) FROM WarehouseStock ws JOIN ws.product p WHERE p.isActive = true")
    BigDecimal calculateTotalInventoryCost();
}
