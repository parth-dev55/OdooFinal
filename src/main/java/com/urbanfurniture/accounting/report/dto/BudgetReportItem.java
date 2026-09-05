package com.urbanfurniture.accounting.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BudgetReportItem(
        Long budgetId,
        String name,
        Long analyticAccountId,
        LocalDate periodStart,
        LocalDate periodEnd,
        BigDecimal plannedAmount,
        BigDecimal actualAmount,
        BigDecimal remainingAmount,
        BigDecimal utilizationPercentage
) {
}
