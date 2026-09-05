package com.urbanfurniture.accounting.accounting.repository;

import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
}
