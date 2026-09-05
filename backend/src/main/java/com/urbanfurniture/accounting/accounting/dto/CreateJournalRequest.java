package com.urbanfurniture.accounting.accounting.dto;

import com.urbanfurniture.accounting.accounting.enums.JournalType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateJournalRequest(
        @NotBlank @Size(max = 100) String name,
        @NotNull JournalType type,
        @Positive Long defaultDebitAccountId,
        @Positive Long defaultCreditAccountId,
        Boolean active
) {
}
