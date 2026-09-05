package com.urbanfurniture.accounting.accounting.dto;

import com.urbanfurniture.accounting.accounting.entity.Journal;

public record JournalResponse(Long id, String name, boolean active) {
    public static JournalResponse from(Journal journal) {
        return new JournalResponse(journal.getId(), journal.getName(), journal.isActive());
    }
}
