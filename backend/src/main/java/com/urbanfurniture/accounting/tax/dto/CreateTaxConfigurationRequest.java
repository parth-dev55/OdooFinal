package com.urbanfurniture.accounting.tax.dto;

import com.urbanfurniture.accounting.tax.enums.TaxType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateTaxConfigurationRequest(
        @NotBlank @Size(max = 100) String name,
        @NotNull @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal rate,
        @NotNull TaxType type,
        Long taxAccountId,
        Boolean active
) {
}
