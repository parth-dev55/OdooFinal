package com.urbanfurniture.accounting.accounting.dto;

import com.urbanfurniture.accounting.accounting.enums.JournalType;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Positive;

public record UpdateJournalRequest(
        @Size(max = 100) String name,
        JournalType type,
        @Positive Long defaultDebitAccountId,
        @Positive Long defaultCreditAccountId,
        Boolean active
) {
}
