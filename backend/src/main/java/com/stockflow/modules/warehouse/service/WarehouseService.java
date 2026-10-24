package com.stockflow.modules.warehouse.service;

import com.stockflow.modules.warehouse.dto.WarehouseDto;
import com.stockflow.modules.warehouse.entity.Warehouse;
import com.stockflow.modules.warehouse.repository.WarehouseRepository;
import com.stockflow.modules.warehouse.repository.WarehouseStockRepository;
import com.stockflow.shared.exception.BadRequestException;
import com.stockflow.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseStockRepository warehouseStockRepository;

    @Transactional(readOnly = true)
    public List<WarehouseDto.Response> getAllWarehouses(boolean onlyActive) {
        List<Warehouse> warehouses = onlyActive ? warehouseRepository.findByIsActiveTrue() : warehouseRepository.findAll();
        return warehouses.stream()
                .map(WarehouseDto.Response::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WarehouseDto.Response getWarehouseById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Almacén no encontrado con ID: " + id));
        return WarehouseDto.Response.fromEntity(warehouse);
    }

    @Transactional(readOnly = true)
    public List<WarehouseDto.StockItem> getStocksByWarehouse(Long warehouseId) {
        if (!warehouseRepository.existsById(warehouseId)) {
            throw new ResourceNotFoundException("Almacén no encontrado con ID: " + warehouseId);
        }
        return warehouseStockRepository.findByWarehouseIdWithProduct(warehouseId).stream()
                .map(WarehouseDto.StockItem::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WarehouseDto.StockItem> getStocksByProduct(Long productId) {
        return warehouseStockRepository.findByProductIdWithWarehouse(productId).stream()
                .map(WarehouseDto.StockItem::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public WarehouseDto.Response createWarehouse(WarehouseDto.Request request) {
        if (warehouseRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Ya existe un almacén con el código: " + request.getCode());
        }

        Warehouse warehouse = Warehouse.builder()
                .code(request.getCode().toUpperCase().trim())
                .name(request.getName().trim())
                .address(request.getAddress())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return WarehouseDto.Response.fromEntity(warehouseRepository.save(warehouse));
    }

    @Transactional
    public WarehouseDto.Response updateWarehouse(Long id, WarehouseDto.Request request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Almacén no encontrado con ID: " + id));

        if (warehouseRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new BadRequestException("Ya existe otro almacén con el código: " + request.getCode());
        }

        warehouse.setCode(request.getCode().toUpperCase().trim());
        warehouse.setName(request.getName().trim());
        warehouse.setAddress(request.getAddress());
        if (request.getIsActive() != null) {
            warehouse.setIsActive(request.getIsActive());
        }

        return WarehouseDto.Response.fromEntity(warehouseRepository.save(warehouse));
    }

    @Transactional
    public void toggleActiveStatus(Long id, boolean active) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Almacén no encontrado con ID: " + id));
        warehouse.setIsActive(active);
        warehouseRepository.save(warehouse);
    }
}
