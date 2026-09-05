package com.urbanfurniture.accounting.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record BalanceSheetResponse(
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal totalDebits,
        BigDecimal totalCredits,
        BigDecimal netBalance,
        List<AccountBalanceResponse> accounts,
        BigDecimal assets,
        BigDecimal liabilities,
        BigDecimal capital,
        BigDecimal currentPeriodProfit,
        boolean accountingEquationBalanced
) {
}
