package com.urbanfurniture.accounting.tax.dto;

import com.urbanfurniture.accounting.tax.enums.TaxType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TaxConfigurationResponse(
        Long id,
        String name,
        BigDecimal rate,
        TaxType type,
        Long taxAccountId,
        String taxAccountCode,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
