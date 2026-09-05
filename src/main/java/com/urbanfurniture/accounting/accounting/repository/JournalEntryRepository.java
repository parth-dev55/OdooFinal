package com.urbanfurniture.accounting.accounting.repository;

import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import java.time.LocalDate;
import java.util.List;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    List<JournalEntry> findByStatusAndEntryDateBetween(
            JournalEntryStatus status, LocalDate startDate, LocalDate endDate);
}
