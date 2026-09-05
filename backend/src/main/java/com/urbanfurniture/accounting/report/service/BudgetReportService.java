package com.urbanfurniture.accounting.report.service;

import com.urbanfurniture.accounting.budget.entity.Budget;
import com.urbanfurniture.accounting.budget.repository.BudgetRepository;
import com.urbanfurniture.accounting.budget.service.BudgetCalculation;
import com.urbanfurniture.accounting.budget.service.BudgetActualService;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.report.dto.BudgetReportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class BudgetReportService {
    private final BudgetRepository budgets;
    private final BudgetActualService budgetActuals;

    @Transactional(readOnly = true)
    public BudgetReportResponse generate(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        if (startDate == null || endDate == null || endDate.isBefore(startDate)) {
            throw new AccountingValidationException("Report end date cannot be before start date");
        }
        var lines = budgets.findAll().stream()
                .filter(budget -> !budget.getEndDate().isBefore(startDate)
                        && !budget.getStartDate().isAfter(endDate))
                .map(budget -> line(budget, startDate, endDate))
                .toList();
        var planned = lines.stream().map(BudgetReportResponse.BudgetLine::plannedAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        var actual = lines.stream().map(BudgetReportResponse.BudgetLine::actualAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        return new BudgetReportResponse(startDate, endDate, planned, actual, planned.subtract(actual),
                BudgetCalculation.variance(planned, actual),
                BudgetCalculation.variancePercentage(planned, actual), lines);
    }

    private BudgetReportResponse.BudgetLine line(Budget budget, java.time.LocalDate startDate,
                                                  java.time.LocalDate endDate) {
        java.time.LocalDate actualStart = budget.getStartDate().isAfter(startDate)
                ? budget.getStartDate() : startDate;
        java.time.LocalDate actualEnd = budget.getEndDate().isBefore(endDate)
                ? budget.getEndDate() : endDate;
        BigDecimal actual = budgetActuals.actualFor(budget.getAnalyticAccount().getId(), actualStart, actualEnd,
                budget.getActualAmount());
        BigDecimal variance = BudgetCalculation.variance(budget.getPlannedAmount(), actual);
        return new BudgetReportResponse.BudgetLine(budget.getId(), budget.getName(),
                budget.getAnalyticAccount().getCode(), budget.getStartDate(), budget.getEndDate(),
                budget.getPlannedAmount(), actual,
                variance, variance, BudgetCalculation.variancePercentage(
                        budget.getPlannedAmount(), actual), budget.getStatus().name());
    }
}
