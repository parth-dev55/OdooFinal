package com.urbanfurniture.accounting.accounting.dto;

import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record JournalEntryResponse(Long id, Long journalId, String journalName, LocalDate entryDate,
                                   String reference, String description, JournalEntryStatus status,
                                   LocalDateTime createdAt, List<JournalEntryLineResponse> lines) {
}
