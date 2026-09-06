package com.urbanfurniture.accounting.budget.dto;

import com.urbanfurniture.accounting.budget.entity.Budget;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BudgetResponse(
        Long id,
        String name,
        LocalDate periodStart,
        LocalDate periodEnd,
        BigDecimal plannedAmount,
        String responsiblePerson,
        AnalyticAccountResponse analyticAccount,
        boolean active
) {

    public static BudgetResponse from(Budget budget) {
        return new BudgetResponse(
                budget.getId(),
                budget.getName(),
                budget.getPeriodStart(),
                budget.getPeriodEnd(),
                budget.getPlannedAmount(),
                budget.getResponsiblePerson(),
                AnalyticAccountResponse.from(budget.getAnalyticAccount()),
                budget.isActive());
    }
}
