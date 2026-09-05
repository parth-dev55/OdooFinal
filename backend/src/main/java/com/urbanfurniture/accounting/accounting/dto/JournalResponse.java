package com.urbanfurniture.accounting.accounting.dto;

import com.urbanfurniture.accounting.accounting.enums.JournalType;

public record JournalResponse(
        Long id,
        String name,
        JournalType type,
        Long defaultDebitAccountId,
        String defaultDebitAccountCode,
        Long defaultCreditAccountId,
        String defaultCreditAccountCode,
        boolean active
) {
}
