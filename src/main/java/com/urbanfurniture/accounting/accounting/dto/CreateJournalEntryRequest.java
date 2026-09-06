package com.urbanfurniture.accounting.accounting.dto;

import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record CreateJournalEntryRequest(
        @NotNull @Positive Long journalId, @NotNull LocalDate entryDate,
        @Size(max = 100) String reference, @Size(max = 1000) String description,
        JournalEntryStatus status, @NotNull @Size(min = 2) List<@Valid JournalEntryLineRequest> lines
) {
}
