package com.urbanfurniture.accounting.budget.dto;

import com.urbanfurniture.accounting.budget.enums.BudgetStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateBudgetRequest(
        @Size(max = 150) String name,
        LocalDate startDate,
        LocalDate endDate,
        @DecimalMin("0.00") @Digits(integer = 17, fraction = 2) BigDecimal plannedAmount,
        @DecimalMin("0.00") @Digits(integer = 17, fraction = 2) BigDecimal actualAmount,
        BudgetStatus status
) {
}
