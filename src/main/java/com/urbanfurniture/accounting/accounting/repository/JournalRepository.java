package com.urbanfurniture.accounting.accounting.repository;

import com.urbanfurniture.accounting.accounting.entity.Journal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JournalRepository extends JpaRepository<Journal, Long> {
}
