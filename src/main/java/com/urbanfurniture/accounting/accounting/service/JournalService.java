package com.urbanfurniture.accounting.accounting.service;

import com.urbanfurniture.accounting.accounting.dto.JournalRequest;
import com.urbanfurniture.accounting.accounting.dto.JournalResponse;
import com.urbanfurniture.accounting.accounting.entity.Journal;
import com.urbanfurniture.accounting.accounting.repository.JournalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JournalService {
    private final JournalRepository journalRepository;

    @Transactional
    public JournalResponse create(JournalRequest request) {
        Journal journal = new Journal();
        journal.setName(request.name().trim());
        return JournalResponse.from(journalRepository.save(journal));
    }

    @Transactional(readOnly = true)
    public List<JournalResponse> findAll() {
        return journalRepository.findAll().stream().map(JournalResponse::from).toList();
    }
}
