package com.urbanfurniture.accounting.report.service;

import com.urbanfurniture.accounting.budget.dto.BudgetSummaryResponse;
import com.urbanfurniture.accounting.budget.entity.Budget;
import com.urbanfurniture.accounting.budget.repository.BudgetRepository;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BudgetReportService {

    private final BudgetRepository budgetRepository;

    @Transactional(readOnly = true)
    public BudgetSummaryResponse summarize(Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget " + budgetId + " was not found"));

        // Journal lines have no analytic-account link yet, so actuals are explicitly zero.
        java.math.BigDecimal actualAmount = java.math.BigDecimal.ZERO.setScale(2);
        java.math.BigDecimal remainingAmount = budget.getPlannedAmount().subtract(actualAmount);
        java.math.BigDecimal utilization = actualAmount.signum() == 0
                ? java.math.BigDecimal.ZERO.setScale(2)
                : actualAmount.multiply(java.math.BigDecimal.valueOf(100))
                .divide(budget.getPlannedAmount(), 2, java.math.RoundingMode.HALF_UP);
        return new BudgetSummaryResponse(budget.getId(), budget.getPlannedAmount(), actualAmount,
                remainingAmount, utilization);
    }
}
