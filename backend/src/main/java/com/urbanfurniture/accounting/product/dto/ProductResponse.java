package com.urbanfurniture.accounting.product.dto;

import com.urbanfurniture.accounting.product.enums.ProductType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(
        Long id,
        String name,
        ProductType type,
        BigDecimal salesPrice,
        BigDecimal purchasePrice,
        String category,
        Long salesTaxId,
        Long purchaseTaxId,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
