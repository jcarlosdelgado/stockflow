package com.stockflow.modules.product.service;

import com.stockflow.modules.category.entity.Category;
import com.stockflow.modules.category.repository.CategoryRepository;
import com.stockflow.modules.product.dto.ProductDto;
import com.stockflow.modules.product.entity.Product;
import com.stockflow.modules.product.repository.ProductRepository;
import com.stockflow.modules.warehouse.repository.WarehouseStockRepository;
import com.stockflow.shared.PagedResponse;
import com.stockflow.shared.exception.BadRequestException;
import com.stockflow.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final WarehouseStockRepository warehouseStockRepository;

    @Transactional(readOnly = true)
    public PagedResponse<ProductDto.Response> getProducts(
            Long categoryId,
            Boolean activeOnly,
            String search,
            Pageable pageable
    ) {
        String searchPattern = (search != null && !search.isBlank()) ? "%" + search.toLowerCase().trim() + "%" : null;
        Page<Product> page = productRepository.findWithFilters(categoryId, activeOnly, searchPattern, pageable);
        Page<ProductDto.Response> responsePage = page.map(product -> {
            Integer totalStock = warehouseStockRepository.getTotalStockByProductId(product.getId());
            return ProductDto.Response.fromEntity(product, totalStock);
        });

        return PagedResponse.from(responsePage);
    }

    @Transactional(readOnly = true)
    public ProductDto.Response getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));
        Integer totalStock = warehouseStockRepository.getTotalStockByProductId(product.getId());
        return ProductDto.Response.fromEntity(product, totalStock);
    }

    @Transactional(readOnly = true)
    public ProductDto.Response getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con SKU: " + sku));
        Integer totalStock = warehouseStockRepository.getTotalStockByProductId(product.getId());
        return ProductDto.Response.fromEntity(product, totalStock);
    }

    @Transactional
    public ProductDto.Response createProduct(ProductDto.Request request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("Ya existe un producto con el código SKU: " + request.getSku());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + request.getCategoryId()));

        Product product = Product.builder()
                .sku(request.getSku().toUpperCase().trim())
                .name(request.getName().trim())
                .description(request.getDescription())
                .category(category)
                .unitOfMeasure(request.getUnitOfMeasure().toUpperCase().trim())
                .costPrice(request.getCostPrice())
                .salePrice(request.getSalePrice())
                .minStock(request.getMinStock())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        Product saved = productRepository.save(product);
        return ProductDto.Response.fromEntity(saved, 0);
    }

    @Transactional
    public ProductDto.Response updateProduct(Long id, ProductDto.Request request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));

        if (productRepository.existsBySkuAndIdNot(request.getSku(), id)) {
            throw new BadRequestException("Ya existe otro producto con el código SKU: " + request.getSku());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + request.getCategoryId()));

        product.setSku(request.getSku().toUpperCase().trim());
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setUnitOfMeasure(request.getUnitOfMeasure().toUpperCase().trim());
        product.setCostPrice(request.getCostPrice());
        product.setSalePrice(request.getSalePrice());
        product.setMinStock(request.getMinStock());
        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }

        Product saved = productRepository.save(product);
        Integer totalStock = warehouseStockRepository.getTotalStockByProductId(saved.getId());
        return ProductDto.Response.fromEntity(saved, totalStock);
    }

    @Transactional
    public void deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));
        // Soft-delete to preserve data integrity and movement traceability
        product.setIsActive(false);
        productRepository.save(product);
    }

    @Transactional
    public void activateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));
        product.setIsActive(true);
        productRepository.save(product);
    }
}
