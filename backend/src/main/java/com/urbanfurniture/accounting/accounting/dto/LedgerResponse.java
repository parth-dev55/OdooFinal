package com.urbanfurniture.accounting.accounting.dto;

import com.urbanfurniture.accounting.accounting.enums.AccountType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record LedgerResponse(
        Long accountId,
        String accountCode,
        String accountName,
        AccountType accountType,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal totalDebit,
        BigDecimal totalCredit,
        BigDecimal balance,
        List<Entry> entries
) {
    public record Entry(
            Long journalEntryId,
            LocalDate entryDate,
            String journalName,
            String reference,
            String description,
            BigDecimal debit,
            BigDecimal credit,
            String lineDescription
    ) {
    }
}
