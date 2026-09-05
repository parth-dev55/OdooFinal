package com.urbanfurniture.accounting.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ProfitAndLossResponse(
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal totalDebits,
        BigDecimal totalCredits,
        BigDecimal netResult,
        List<AccountBalanceResponse> accounts,
        BigDecimal income,
        BigDecimal expenses,
        BigDecimal netProfit
) {
}
