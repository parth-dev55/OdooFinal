package com.urbanfurniture.accounting.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BalanceSheetResponse(
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal assets,
        BigDecimal liabilities,
        BigDecimal capital
) {
}
