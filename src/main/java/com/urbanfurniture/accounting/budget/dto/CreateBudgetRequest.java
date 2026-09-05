package com.urbanfurniture.accounting.budget.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateBudgetRequest(
        @NotBlank @Size(max = 150) String name,
        @NotNull LocalDate periodStart,
        @NotNull LocalDate periodEnd,
        @NotNull @DecimalMin(value = "0.0", inclusive = false)
        @Digits(integer = 17, fraction = 2) BigDecimal plannedAmount,
        @NotBlank @Size(max = 150) String responsiblePerson,
        @NotNull @Positive Long analyticAccountId,
        Boolean active
) {
}
