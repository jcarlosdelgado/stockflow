package com.stockflow.shared.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String message) {
        super(message);
    }

    public InsufficientStockException(String productSku, int requested, int available) {
        super(String.format("Stock insuficiente para el producto '%s'. Solicitado: %d, Disponible: %d", productSku, requested, available));
    }
}
