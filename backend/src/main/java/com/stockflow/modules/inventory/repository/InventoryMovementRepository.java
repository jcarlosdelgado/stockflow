package com.stockflow.modules.inventory.repository;

import com.stockflow.modules.inventory.entity.InventoryMovement;
import com.stockflow.modules.inventory.entity.MovementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

    @Query("SELECT m FROM InventoryMovement m " +
           "JOIN FETCH m.product p " +
           "JOIN FETCH m.warehouse w " +
           "LEFT JOIN FETCH m.destinationWarehouse dw " +
           "JOIN FETCH m.createdBy u " +
           "WHERE (:productId IS NULL OR p.id = :productId) " +
           "AND (:warehouseId IS NULL OR w.id = :warehouseId) " +
           "AND (:type IS NULL OR m.type = :type)")
    Page<InventoryMovement> findMovements(
            @Param("productId") Long productId,
            @Param("warehouseId") Long warehouseId,
            @Param("type") MovementType type,
            Pageable pageable
    );

    @Query("SELECT m FROM InventoryMovement m " +
           "JOIN FETCH m.product p " +
           "JOIN FETCH m.warehouse w " +
           "JOIN FETCH m.createdBy u " +
           "ORDER BY m.createdAt DESC")
    List<InventoryMovement> findTop10RecentMovements(Pageable pageable);

    boolean existsByProductId(Long productId);
}
