package com.stockflow.modules.category.controller;

import com.stockflow.modules.category.dto.CategoryDto;
import com.stockflow.modules.category.service.CategoryService;
import com.stockflow.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Categorías", description = "Endpoints para la gestión de categorías de productos")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Listar categorías", description = "Retorna el listado de categorías, opcionalmente filtrado por estado activo")
    public ResponseEntity<ApiResponse<List<CategoryDto.Response>>> getAll(@RequestParam(required = false, defaultValue = "false") boolean onlyActive) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllCategories(onlyActive)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener categoría por ID", description = "Retorna el detalle de una categoría específica")
    public ResponseEntity<ApiResponse<CategoryDto.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getCategoryById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSEMAN')")
    @Operation(summary = "Crear nueva categoría", description = "Registra una nueva categoría en el sistema")
    public ResponseEntity<ApiResponse<CategoryDto.Response>> create(@Valid @RequestBody CategoryDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Categoría creada exitosamente", categoryService.createCategory(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSEMAN')")
    @Operation(summary = "Actualizar categoría", description = "Modifica los datos de una categoría existente")
    public ResponseEntity<ApiResponse<CategoryDto.Response>> update(@PathVariable Long id, @Valid @RequestBody CategoryDto.Request request) {
        return ResponseEntity.ok(ApiResponse.ok("Categoría actualizada exitosamente", categoryService.updateCategory(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Activar / Desactivar categoría", description = "Modifica el estado de visibilidad de una categoría")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id, @RequestParam boolean active) {
        categoryService.toggleActiveStatus(id, active);
        return ResponseEntity.ok(ApiResponse.ok("Estado de la categoría actualizado correctamente", null));
    }
}
