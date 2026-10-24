package com.stockflow.modules.product.controller;

import com.stockflow.modules.product.dto.ProductDto;
import com.stockflow.modules.product.service.ProductService;
import com.stockflow.shared.ApiResponse;
import com.stockflow.shared.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Productos", description = "Endpoints para la gestión, consulta, filtrado y stock de productos")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Listar productos con paginación y filtros", description = "Busca productos por término, categoría y estado activo")
    public ResponseEntity<ApiResponse<PagedResponse<ProductDto.Response>>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PagedResponse<ProductDto.Response> response = productService.getProducts(categoryId, activeOnly, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto por ID", description = "Obtiene los detalles completos de un producto incluyendo su stock total")
    public ResponseEntity<ApiResponse<ProductDto.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getProductById(id)));
    }

    @GetMapping("/sku/{sku}")
    @Operation(summary = "Obtener producto por SKU", description = "Busca un producto por su código SKU único")
    public ResponseEntity<ApiResponse<ProductDto.Response>> getBySku(@PathVariable String sku) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getProductBySku(sku)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSEMAN')")
    @Operation(summary = "Crear nuevo producto", description = "Registra un producto en el catálogo (Requiere rol ADMIN o WAREHOUSEMAN)")
    public ResponseEntity<ApiResponse<ProductDto.Response>> create(@Valid @RequestBody ProductDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Producto creado exitosamente", productService.createProduct(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSEMAN')")
    @Operation(summary = "Actualizar producto", description = "Actualiza los atributos de un producto")
    public ResponseEntity<ApiResponse<ProductDto.Response>> update(@PathVariable Long id, @Valid @RequestBody ProductDto.Request request) {
        return ResponseEntity.ok(ApiResponse.ok("Producto actualizado exitosamente", productService.updateProduct(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Desactivar producto (baja lógica)", description = "Desactiva el producto sin eliminar registros históricos (Requiere ADMIN)")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        productService.deactivateProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Producto desactivado correctamente", null));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Reactivar producto", description = "Vuelve a activar un producto desactivado previamente")
    public ResponseEntity<ApiResponse<Void>> activate(@PathVariable Long id) {
        productService.activateProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Producto reactivado exitosamente", null));
    }
}
