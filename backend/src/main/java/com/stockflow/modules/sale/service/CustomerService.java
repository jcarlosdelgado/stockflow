package com.stockflow.modules.sale.service;

import com.stockflow.modules.sale.dto.CustomerDto;
import com.stockflow.modules.sale.entity.Customer;
import com.stockflow.modules.sale.repository.CustomerRepository;
import com.stockflow.shared.exception.BadRequestException;
import com.stockflow.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public List<CustomerDto.Response> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(CustomerDto.Response::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerDto.Response getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con ID: " + id));
        return CustomerDto.Response.fromEntity(customer);
    }

    @Transactional
    public CustomerDto.Response createCustomer(CustomerDto.Request request) {
        if (request.getDocumentNumber() != null && !request.getDocumentNumber().isBlank()
                && customerRepository.existsByDocumentNumber(request.getDocumentNumber())) {
            throw new BadRequestException("Ya existe un cliente con el documento: " + request.getDocumentNumber());
        }

        Customer customer = Customer.builder()
                .documentNumber(request.getDocumentNumber())
                .name(request.getName().trim())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .isActive(true)
                .build();

        return CustomerDto.Response.fromEntity(customerRepository.save(customer));
    }
}
