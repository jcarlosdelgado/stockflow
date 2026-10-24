package com.stockflow.modules.category.service;

import com.stockflow.modules.category.dto.CategoryDto;
import com.stockflow.modules.category.entity.Category;
import com.stockflow.modules.category.repository.CategoryRepository;
import com.stockflow.shared.exception.BadRequestException;
import com.stockflow.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryDto.Response> getAllCategories(boolean onlyActive) {
        List<Category> categories = onlyActive ? categoryRepository.findByIsActiveTrue() : categoryRepository.findAll();
        return categories.stream()
                .map(CategoryDto.Response::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDto.Response getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));
        return CategoryDto.Response.fromEntity(category);
    }

    @Transactional
    public CategoryDto.Response createCategory(CategoryDto.Request request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Ya existe una categoría con el nombre: " + request.getName());
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return CategoryDto.Response.fromEntity(categoryRepository.save(category));
    }

    @Transactional
    public CategoryDto.Response updateCategory(Long id, CategoryDto.Request request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));

        if (categoryRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new BadRequestException("Ya existe otra categoría con el nombre: " + request.getName());
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }

        return CategoryDto.Response.fromEntity(categoryRepository.save(category));
    }

    @Transactional
    public void toggleActiveStatus(Long id, boolean active) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));
        category.setIsActive(active);
        categoryRepository.save(category);
    }
}
