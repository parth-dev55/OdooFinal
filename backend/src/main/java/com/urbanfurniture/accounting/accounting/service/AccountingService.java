package com.urbanfurniture.accounting.accounting.service;

import com.urbanfurniture.accounting.accounting.dto.CreateJournalEntryRequest;
import com.urbanfurniture.accounting.accounting.dto.JournalEntryLineRequest;
import com.urbanfurniture.accounting.accounting.dto.JournalEntryLineResponse;
import com.urbanfurniture.accounting.accounting.dto.JournalEntryResponse;
import com.urbanfurniture.accounting.accounting.dto.UpdateJournalEntryRequest;
import com.urbanfurniture.accounting.accounting.entity.Account;
import com.urbanfurniture.accounting.accounting.entity.Journal;
import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import com.urbanfurniture.accounting.accounting.entity.JournalEntryLine;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.accounting.repository.AccountRepository;
import com.urbanfurniture.accounting.accounting.repository.JournalEntryRepository;
import com.urbanfurniture.accounting.accounting.repository.JournalRepository;
import com.urbanfurniture.accounting.common.exception.DuplicateResourceException;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import com.urbanfurniture.accounting.budget.entity.AnalyticAccount;
import com.urbanfurniture.accounting.budget.repository.AnalyticAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class AccountingService {
    private final JournalRepository journalRepository;
    private final AccountRepository accountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final AnalyticAccountRepository analyticAccountRepository;

    @Autowired
    public AccountingService(JournalRepository journalRepository, AccountRepository accountRepository,
                             JournalEntryRepository journalEntryRepository,
                             AnalyticAccountRepository analyticAccountRepository) {
        this.journalRepository = journalRepository;
        this.accountRepository = accountRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.analyticAccountRepository = analyticAccountRepository;
    }

    public AccountingService(JournalRepository journalRepository, AccountRepository accountRepository,
                             JournalEntryRepository journalEntryRepository) {
        this(journalRepository, accountRepository, journalEntryRepository, null);
    }

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
        JournalEntryStatus entryStatus = status == null ? JournalEntryStatus.DRAFT : status;
        String normalizedReference = normalize(reference);
        if (entryStatus == JournalEntryStatus.POSTED && normalizedReference != null
                && journalEntryRepository.existsByReferenceAndStatus(normalizedReference, JournalEntryStatus.POSTED)) {
            throw new DuplicateResourceException("A posted journal entry already exists for reference " + normalizedReference);
        }

        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;
        JournalEntry entry = new JournalEntry();
        entry.setJournal(journal);
        entry.setEntryDate(entryDate);
        entry.setReference(normalizedReference);
        entry.setDescription(normalize(description));
        entry.setStatus(entryStatus);

        for (JournalEntryLineRequest request : lineRequests) {
            Account account = findActiveAccount(request.accountId());
            totalDebit = totalDebit.add(request.debit());
            totalCredit = totalCredit.add(request.credit());
            JournalEntryLine line = new JournalEntryLine();
            line.setAccount(account);
            line.setAnalyticAccount(resolveAnalyticAccount(request.analyticAccountId()));
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

    @Transactional
    public JournalEntryResponse updateDraft(Long id, UpdateJournalEntryRequest request) {
        JournalEntry entry = findEntry(id);
        ensureDraft(entry);
        Journal journal = findActiveJournal(request.journalId());
        validateLines(request.lines());
        String reference = normalize(request.reference());
        replaceEntry(entry, journal, request.entryDate(), reference, request.description(), request.lines());
        return toResponse(journalEntryRepository.save(entry));
    }

    @Transactional
    public JournalEntryResponse post(Long id) {
        JournalEntry entry = findEntry(id);
        ensureDraft(entry);
        if (journalEntryRepository.existsByReferenceAndStatus(entry.getReference(), JournalEntryStatus.POSTED)) {
            throw new DuplicateResourceException("A posted journal entry already exists for reference "
                    + entry.getReference());
        }
        entry.setStatus(JournalEntryStatus.POSTED);
        return toResponse(journalEntryRepository.save(entry));
    }

    @Transactional
    public JournalEntryResponse reverse(Long id) {
        JournalEntry original = findEntry(id);
        if (original.getStatus() != JournalEntryStatus.POSTED) {
            throw new AccountingValidationException("Only posted journal entries can be reversed");
        }
        List<JournalEntryLineRequest> reversalLines = original.getLines().stream()
                .map(line -> new JournalEntryLineRequest(line.getAccount().getId(),
                        line.getCredit(), line.getDebit(), "Reversal of entry " + original.getId(),
                        line.getAnalyticAccount() == null ? null : line.getAnalyticAccount().getId()))
                .toList();
        JournalEntryResponse reversal = createJournalEntry(original.getJournal().getId(),
                original.getEntryDate(), "REVERSAL-" + original.getId(),
                "Reversal of journal entry " + original.getId(), JournalEntryStatus.POSTED, reversalLines);
        original.setStatus(JournalEntryStatus.REVERSED);
        journalEntryRepository.save(original);
        return reversal;
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

    private JournalEntry findEntry(Long id) {
        return journalEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Journal entry " + id + " was not found"));
    }

    private void ensureDraft(JournalEntry entry) {
        if (entry.getStatus() != JournalEntryStatus.DRAFT) {
            throw new AccountingValidationException("Only draft journal entries can be edited or posted");
        }
    }

    private void replaceEntry(JournalEntry entry, Journal journal, LocalDate date, String reference,
                              String description, List<JournalEntryLineRequest> requests) {
        entry.setJournal(journal);
        entry.setEntryDate(date);
        entry.setReference(reference);
        entry.setDescription(normalize(description));
        entry.getLines().clear();
        for (JournalEntryLineRequest request : requests) {
            Account account = findActiveAccount(request.accountId());
            JournalEntryLine line = new JournalEntryLine();
            line.setAccount(account);
            line.setAnalyticAccount(resolveAnalyticAccount(request.analyticAccountId()));
            line.setDebit(request.debit());
            line.setCredit(request.credit());
            line.setDescription(normalize(request.description()));
            entry.addLine(line);
        }
        BigDecimal debit = entry.getLines().stream().map(JournalEntryLine::getDebit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal credit = entry.getLines().stream().map(JournalEntryLine::getCredit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (debit.compareTo(credit) != 0) {
            throw new AccountingValidationException("Total debit must equal total credit");
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

    private AnalyticAccount resolveAnalyticAccount(Long id) {
        if (id == null) return null;
        if (analyticAccountRepository == null) {
            throw new AccountingValidationException("Analytic account support is not configured");
        }
        AnalyticAccount account = analyticAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Analytic account " + id + " was not found"));
        if (!account.isActive()) throw new AccountingValidationException("Analytic account " + id + " is inactive");
        return account;
    }

    private String normalize(String value) { return value == null ? null : value.trim(); }

    private JournalEntryResponse toResponse(JournalEntry entry) {
        List<JournalEntryLineResponse> lines = entry.getLines().stream().map(line -> new JournalEntryLineResponse(
                line.getId(), line.getAccount().getId(), line.getAccount().getCode(), line.getAccount().getName(),
                line.getDebit(), line.getCredit(), line.getDescription(),
                line.getAnalyticAccount() == null ? null : line.getAnalyticAccount().getId(),
                line.getAnalyticAccount() == null ? null : line.getAnalyticAccount().getCode())).toList();
        return new JournalEntryResponse(entry.getId(), entry.getJournal().getId(), entry.getJournal().getName(),
                entry.getEntryDate(), entry.getReference(), entry.getDescription(), entry.getStatus(), entry.getCreatedAt(), lines);
    }
}
