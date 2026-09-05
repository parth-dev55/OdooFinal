package com.urbanfurniture.accounting.accounting.repository;

import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    boolean existsByReferenceAndStatus(String reference, JournalEntryStatus status);

    List<JournalEntry> findByStatusAndEntryDateBetween(
            JournalEntryStatus status, LocalDate startDate, LocalDate endDate);

    List<JournalEntry> findByStatusAndEntryDateLessThanEqual(
            JournalEntryStatus status, LocalDate asOfDate);
}
