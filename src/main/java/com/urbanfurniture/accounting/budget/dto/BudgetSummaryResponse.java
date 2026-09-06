package com.urbanfurniture.accounting.budget.dto;

import java.math.BigDecimal;

public record BudgetSummaryResponse(
        Long budgetId,
        BigDecimal plannedAmount,
        BigDecimal actualAmount,
        BigDecimal remainingAmount,
        BigDecimal utilizationPercentage
) {
}
