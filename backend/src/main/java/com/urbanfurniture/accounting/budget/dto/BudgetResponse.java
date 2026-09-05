package com.urbanfurniture.accounting.budget.dto;

import com.urbanfurniture.accounting.budget.enums.BudgetStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record BudgetResponse(
        Long id,
        String name,
        Long analyticAccountId,
        String analyticAccountCode,
        String analyticAccountName,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal plannedAmount,
        BigDecimal actualAmount,
        BigDecimal remainingAmount,
        BigDecimal variance,
        BigDecimal variancePercentage,
        BudgetStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
