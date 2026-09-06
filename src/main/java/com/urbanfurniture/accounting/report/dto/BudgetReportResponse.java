package com.urbanfurniture.accounting.report.dto;

import java.time.LocalDate;
import java.util.List;

public record BudgetReportResponse(
        LocalDate startDate,
        LocalDate endDate,
        List<BudgetReportItem> budgets
) {
}
