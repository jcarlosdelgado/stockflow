package com.stockflow.modules.product.repository;

import com.stockflow.modules.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    @Query(value = "SELECT p FROM Product p " +
           "JOIN FETCH p.category c " +
           "WHERE (:categoryId IS NULL OR c.id = :categoryId) " +
           "AND (:activeOnly IS NULL OR p.isActive = :activeOnly) " +
           "AND (:searchPattern IS NULL OR LOWER(p.name) LIKE :searchPattern OR LOWER(p.sku) LIKE :searchPattern)",
           countQuery = "SELECT COUNT(p) FROM Product p " +
           "WHERE (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:activeOnly IS NULL OR p.isActive = :activeOnly) " +
           "AND (:searchPattern IS NULL OR LOWER(p.name) LIKE :searchPattern OR LOWER(p.sku) LIKE :searchPattern)")
    Page<Product> findWithFilters(
            @Param("categoryId") Long categoryId,
            @Param("activeOnly") Boolean activeOnly,
            @Param("searchPattern") String searchPattern,
            Pageable pageable
    );

    @Query("SELECT COUNT(p) FROM Product p WHERE p.isActive = true")
    long countActiveProducts();
}
