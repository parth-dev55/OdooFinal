package com.urbanfurniture.accounting.accounting.service;

import com.urbanfurniture.accounting.accounting.dto.CreateJournalRequest;
import com.urbanfurniture.accounting.accounting.dto.JournalResponse;
import com.urbanfurniture.accounting.accounting.dto.UpdateJournalRequest;
import com.urbanfurniture.accounting.accounting.entity.Account;
import com.urbanfurniture.accounting.accounting.entity.Journal;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.accounting.repository.AccountRepository;
import com.urbanfurniture.accounting.accounting.repository.JournalRepository;
import com.urbanfurniture.accounting.common.exception.DuplicateResourceException;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JournalService {

    private final JournalRepository journalRepository;
    private final AccountRepository accountRepository;

    @Transactional
    public JournalResponse create(CreateJournalRequest request) {
        String name = requiredText(request.name(), "Journal name");
        if (journalRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Journal name is already in use");
        }

        Journal journal = new Journal();
        journal.setName(name);
        journal.setType(request.type());
        journal.setDefaultDebitAccount(resolveAccount(request.defaultDebitAccountId()));
        journal.setDefaultCreditAccount(resolveAccount(request.defaultCreditAccountId()));
        journal.setActive(request.active() == null || request.active());
        return toResponse(journalRepository.save(journal));
    }

    @Transactional(readOnly = true)
    public List<JournalResponse> findAll() {
        return journalRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public JournalResponse findById(Long id) {
        return toResponse(findJournal(id));
    }

    @Transactional
    public JournalResponse update(Long id, UpdateJournalRequest request) {
        Journal journal = findJournal(id);

        if (request.name() != null) {
            String name = requiredText(request.name(), "Journal name");
            if (!name.equalsIgnoreCase(journal.getName())
                    && journalRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
                throw new DuplicateResourceException("Journal name is already in use");
            }
            journal.setName(name);
        }
        if (request.type() != null) {
            journal.setType(request.type());
        }
        if (request.defaultDebitAccountId() != null) {
            journal.setDefaultDebitAccount(resolveAccount(request.defaultDebitAccountId()));
        }
        if (request.defaultCreditAccountId() != null) {
            journal.setDefaultCreditAccount(resolveAccount(request.defaultCreditAccountId()));
        }
        if (request.active() != null) {
            journal.setActive(request.active());
        }
        return toResponse(journalRepository.save(journal));
    }

    @Transactional
    public JournalResponse archive(Long id) {
        Journal journal = findJournal(id);
        journal.setActive(false);
        return toResponse(journalRepository.save(journal));
    }

    private Journal findJournal(Long id) {
        return journalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Journal " + id + " was not found"));
    }

    private Account resolveAccount(Long id) {
        if (id == null) {
            return null;
        }
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account " + id + " was not found"));
        if (!account.isActive()) {
            throw new AccountingValidationException("Account " + id + " is inactive");
        }
        return account;
    }

    private String requiredText(String value, String field) {
        if (value == null || value.trim().isEmpty()) {
            throw new AccountingValidationException(field + " is required");
        }
        return value.trim();
    }

    private JournalResponse toResponse(Journal journal) {
        Account debit = journal.getDefaultDebitAccount();
        Account credit = journal.getDefaultCreditAccount();
        return new JournalResponse(journal.getId(), journal.getName(), journal.getType(),
                debit == null ? null : debit.getId(),
                debit == null ? null : debit.getCode(),
                credit == null ? null : credit.getId(),
                credit == null ? null : credit.getCode(),
                journal.isActive());
    }
}
