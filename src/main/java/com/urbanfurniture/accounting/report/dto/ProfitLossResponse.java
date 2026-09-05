package com.urbanfurniture.accounting.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProfitLossResponse(
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal income,
        BigDecimal expenses,
        BigDecimal netProfit
) {
}
