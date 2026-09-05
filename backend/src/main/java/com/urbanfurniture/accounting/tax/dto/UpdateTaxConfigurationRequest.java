package com.urbanfurniture.accounting.tax.dto;

import com.urbanfurniture.accounting.tax.enums.TaxType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateTaxConfigurationRequest(
        @Size(max = 100) @Pattern(regexp = ".*\\S.*", message = "must not be blank") String name,
        @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal rate,
        TaxType type,
        Long taxAccountId,
        Boolean active
) {
}
