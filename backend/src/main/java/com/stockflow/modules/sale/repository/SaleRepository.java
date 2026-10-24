package com.stockflow.modules.sale.repository;

import com.stockflow.modules.sale.entity.Sale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    Optional<Sale> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT s FROM Sale s " +
           "LEFT JOIN FETCH s.customer c " +
           "JOIN FETCH s.user u " +
           "JOIN FETCH s.warehouse w " +
           "WHERE (:warehouseId IS NULL OR w.id = :warehouseId) " +
           "ORDER BY s.createdAt DESC")
    Page<Sale> findAllSales(@Param("warehouseId") Long warehouseId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.status = 'COMPLETED'")
    BigDecimal calculateTotalSalesVolume();

    @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.status = 'COMPLETED' AND s.createdAt >= :startDate")
    BigDecimal calculateSalesSince(@Param("startDate") OffsetDateTime startDate);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.status = 'COMPLETED' AND s.createdAt >= :startDate")
    long countSalesSince(@Param("startDate") OffsetDateTime startDate);
}
