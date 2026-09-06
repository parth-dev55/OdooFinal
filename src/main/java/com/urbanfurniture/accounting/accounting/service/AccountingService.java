package com.urbanfurniture.accounting.accounting.service;

import com.urbanfurniture.accounting.accounting.dto.CreateJournalEntryRequest;
import com.urbanfurniture.accounting.accounting.dto.JournalEntryLineRequest;
import com.urbanfurniture.accounting.accounting.dto.JournalEntryLineResponse;
import com.urbanfurniture.accounting.accounting.dto.JournalEntryResponse;
import com.urbanfurniture.accounting.accounting.entity.Account;
import com.urbanfurniture.accounting.accounting.entity.Journal;
import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import com.urbanfurniture.accounting.accounting.entity.JournalEntryLine;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.accounting.repository.AccountRepository;
import com.urbanfurniture.accounting.accounting.repository.JournalEntryRepository;
import com.urbanfurniture.accounting.accounting.repository.JournalRepository;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountingService {
    private final JournalRepository journalRepository;
    private final AccountRepository accountRepository;
    private final JournalEntryRepository journalEntryRepository;

    @Transactional
    public JournalEntryResponse create(CreateJournalEntryRequest request) {
        return createJournalEntry(request.journalId(), request.entryDate(), request.reference(), request.description(),
                request.status(), request.lines());
    }

    @Transactional
    public JournalEntryResponse createJournalEntry(Long journalId, LocalDate entryDate, String reference,
                                                    String description, JournalEntryStatus status,
                                                    List<JournalEntryLineRequest> lineRequests) {
        if (entryDate == null) throw new AccountingValidationException("Entry date is required");
        Journal journal = findActiveJournal(journalId);
        validateLines(lineRequests);

        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;
        JournalEntry entry = new JournalEntry();
        entry.setJournal(journal);
        entry.setEntryDate(entryDate);
        entry.setReference(normalize(reference));
        entry.setDescription(normalize(description));
        entry.setStatus(status == null ? JournalEntryStatus.DRAFT : status);

        for (JournalEntryLineRequest request : lineRequests) {
            Account account = findActiveAccount(request.accountId());
            totalDebit = totalDebit.add(request.debit());
            totalCredit = totalCredit.add(request.credit());
            JournalEntryLine line = new JournalEntryLine();
            line.setAccount(account);
            line.setDebit(request.debit());
            line.setCredit(request.credit());
            line.setDescription(normalize(request.description()));
            entry.addLine(line);
        }
        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new AccountingValidationException("Total debit must equal total credit");
        }
        return toResponse(journalEntryRepository.save(entry));
    }

    @Transactional(readOnly = true)
    public List<JournalEntryResponse> findAll() {
        return journalEntryRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public JournalEntryResponse findById(Long id) {
        return toResponse(journalEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Journal entry " + id + " was not found")));
    }

    private void validateLines(List<JournalEntryLineRequest> lines) {
        if (lines == null || lines.size() < 2) throw new AccountingValidationException("A journal entry must contain at least two lines");
        for (JournalEntryLineRequest line : lines) {
            if (line == null || line.accountId() == null || line.debit() == null || line.credit() == null)
                throw new AccountingValidationException("Each line must include an account, debit, and credit");
            if (line.debit().signum() < 0 || line.credit().signum() < 0)
                throw new AccountingValidationException("Debit and credit amounts cannot be negative");
            if (line.debit().signum() > 0 && line.credit().signum() > 0)
                throw new AccountingValidationException("A journal entry line cannot have both debit and credit amounts");
            if (line.debit().signum() == 0 && line.credit().signum() == 0)
                throw new AccountingValidationException("A journal entry line must have a debit or credit amount");
        }
    }

    private Journal findActiveJournal(Long id) {
        Journal journal = journalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Journal " + id + " was not found"));
        if (!journal.isActive()) throw new AccountingValidationException("Journal " + id + " is inactive");
        return journal;
    }

    private Account findActiveAccount(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account " + id + " was not found"));
        if (!account.isActive()) throw new AccountingValidationException("Account " + id + " is inactive");
        return account;
    }

    private String normalize(String value) { return value == null ? null : value.trim(); }

    private JournalEntryResponse toResponse(JournalEntry entry) {
        List<JournalEntryLineResponse> lines = entry.getLines().stream().map(line -> new JournalEntryLineResponse(
                line.getId(), line.getAccount().getId(), line.getAccount().getCode(), line.getAccount().getName(),
                line.getDebit(), line.getCredit(), line.getDescription())).toList();
        return new JournalEntryResponse(entry.getId(), entry.getJournal().getId(), entry.getJournal().getName(),
                entry.getEntryDate(), entry.getReference(), entry.getDescription(), entry.getStatus(), entry.getCreatedAt(), lines);
    }
}
