package com.stockflow.modules.purchase.service;

import com.stockflow.modules.purchase.dto.SupplierDto;
import com.stockflow.modules.purchase.entity.Supplier;
import com.stockflow.modules.purchase.repository.SupplierRepository;
import com.stockflow.shared.exception.BadRequestException;
import com.stockflow.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    @Transactional(readOnly = true)
    public List<SupplierDto.Response> getAllSuppliers(boolean onlyActive) {
        List<Supplier> suppliers = onlyActive ? supplierRepository.findByIsActiveTrue() : supplierRepository.findAll();
        return suppliers.stream()
                .map(SupplierDto.Response::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupplierDto.Response getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con ID: " + id));
        return SupplierDto.Response.fromEntity(supplier);
    }

    @Transactional
    public SupplierDto.Response createSupplier(SupplierDto.Request request) {
        if (request.getDocumentNumber() != null && !request.getDocumentNumber().isBlank()
                && supplierRepository.existsByDocumentNumber(request.getDocumentNumber())) {
            throw new BadRequestException("Ya existe un proveedor con el documento: " + request.getDocumentNumber());
        }

        Supplier supplier = Supplier.builder()
                .documentNumber(request.getDocumentNumber())
                .companyName(request.getCompanyName().trim())
                .contactName(request.getContactName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return SupplierDto.Response.fromEntity(supplierRepository.save(supplier));
    }

    @Transactional
    public void toggleActiveStatus(Long id, boolean active) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con ID: " + id));
        supplier.setIsActive(active);
        supplierRepository.save(supplier);
    }
}
