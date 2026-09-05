package com.urbanfurniture.accounting.budget.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateBudgetRequest(
        @NotBlank @Size(max = 150) String name,
        @NotNull @Positive Long analyticAccountId,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotNull @DecimalMin("0.00") @Digits(integer = 17, fraction = 2) BigDecimal plannedAmount
) {
}
