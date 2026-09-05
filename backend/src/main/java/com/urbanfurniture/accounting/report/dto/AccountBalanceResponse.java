package com.urbanfurniture.accounting.report.dto;

import com.urbanfurniture.accounting.accounting.enums.AccountType;
import java.math.BigDecimal;

public record AccountBalanceResponse(
        Long accountId,
        String accountCode,
        String accountName,
        AccountType accountType,
        BigDecimal debit,
        BigDecimal credit,
        BigDecimal balance
) {
}
