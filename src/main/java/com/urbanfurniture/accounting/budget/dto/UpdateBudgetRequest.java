package com.urbanfurniture.accounting.budget.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateBudgetRequest(
        @Size(max = 150) String name,
        LocalDate periodStart,
        LocalDate periodEnd,
        @DecimalMin(value = "0.0", inclusive = false)
        @Digits(integer = 17, fraction = 2) BigDecimal plannedAmount,
        @Size(max = 150) String responsiblePerson,
        @Positive Long analyticAccountId,
        Boolean active
) {
}
