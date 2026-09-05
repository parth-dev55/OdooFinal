package com.urbanfurniture.accounting.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record BudgetReportResponse(
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal plannedAmount,
        BigDecimal actualAmount,
        BigDecimal remainingAmount,
        BigDecimal variance,
        BigDecimal variancePercentage,
        List<BudgetLine> budgets
) {
    public record BudgetLine(
            Long budgetId,
            String name,
            String analyticAccountCode,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal plannedAmount,
            BigDecimal actualAmount,
            BigDecimal remainingAmount,
            BigDecimal variance,
            BigDecimal variancePercentage,
            String status
    ) {
    }
}
