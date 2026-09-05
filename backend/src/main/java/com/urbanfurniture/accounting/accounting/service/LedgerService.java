package com.urbanfurniture.accounting.accounting.service;

import com.urbanfurniture.accounting.accounting.dto.LedgerResponse;
import com.urbanfurniture.accounting.accounting.entity.Account;
import com.urbanfurniture.accounting.accounting.entity.JournalEntryLine;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.repository.AccountRepository;
import com.urbanfurniture.accounting.accounting.repository.JournalEntryRepository;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LedgerService {

    private final AccountRepository accounts;
    private final JournalEntryRepository journalEntries;

    @Transactional(readOnly = true)
    public LedgerResponse findAccountLedger(Long accountId, LocalDate startDate, LocalDate endDate) {
        validateDates(startDate, endDate);
        Account account = accounts.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account " + accountId + " was not found"));

        List<LedgerResponse.Entry> entries = journalEntries
                .findByStatusAndEntryDateBetween(JournalEntryStatus.POSTED, startDate, endDate)
                .stream()
                .flatMap(entry -> entry.getLines().stream()
                        .filter(line -> line.getAccount().getId().equals(accountId))
                        .map(line -> entry(line, entry.getId(), entry.getEntryDate(),
                                entry.getJournal().getName(), entry.getReference(), entry.getDescription())))
                .toList();
        BigDecimal debit = entries.stream().map(LedgerResponse.Entry::debit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal credit = entries.stream().map(LedgerResponse.Entry::credit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new LedgerResponse(account.getId(), account.getCode(), account.getName(), account.getType(),
                startDate, endDate, debit, credit, debit.subtract(credit), entries);
    }

    private LedgerResponse.Entry entry(JournalEntryLine line, Long journalEntryId, LocalDate entryDate,
                                       String journalName, String reference, String description) {
        return new LedgerResponse.Entry(journalEntryId, entryDate, journalName, reference, description,
                line.getDebit(), line.getCredit(), line.getDescription());
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null || endDate.isBefore(startDate)) {
            throw new AccountingValidationException("Ledger end date cannot be before start date");
        }
    }
}
