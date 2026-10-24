package com.stockflow.modules.purchase.repository;

import com.stockflow.modules.purchase.entity.PurchaseOrder;
import com.stockflow.modules.purchase.entity.PurchaseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Optional<PurchaseOrder> findByOrderNumber(String orderNumber);

    @Query("SELECT po FROM PurchaseOrder po " +
           "JOIN FETCH po.supplier s " +
           "JOIN FETCH po.warehouse w " +
           "JOIN FETCH po.user u " +
           "WHERE (:status IS NULL OR po.status = :status) " +
           "AND (:warehouseId IS NULL OR w.id = :warehouseId) " +
           "ORDER BY po.createdAt DESC")
    Page<PurchaseOrder> findAllOrders(
            @Param("status") PurchaseStatus status,
            @Param("warehouseId") Long warehouseId,
            Pageable pageable
    );
}
