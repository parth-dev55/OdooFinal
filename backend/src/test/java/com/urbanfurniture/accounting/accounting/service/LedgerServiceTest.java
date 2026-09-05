package com.urbanfurniture.accounting.accounting.service;

import com.urbanfurniture.accounting.accounting.dto.LedgerResponse;
import com.urbanfurniture.accounting.accounting.entity.Account;
import com.urbanfurniture.accounting.accounting.entity.Journal;
import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import com.urbanfurniture.accounting.accounting.entity.JournalEntryLine;
import com.urbanfurniture.accounting.accounting.enums.AccountType;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.accounting.repository.AccountRepository;
import com.urbanfurniture.accounting.accounting.repository.JournalEntryRepository;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class LedgerServiceTest {

    private static final LocalDate START = LocalDate.of(2026, 1, 1);
    private static final LocalDate END = LocalDate.of(2026, 1, 31);

    @Test
    void aggregatesPostedLinesForRequestedAccount() {
        Account account = account(1L, "1000", "Cash", AccountType.ASSET);
        Account other = account(2L, "4000", "Revenue", AccountType.INCOME);
        JournalEntry entry = entry("INV-1", line(account, "100.00", "0.00"),
                line(other, "0.00", "100.00"));

        AccountRepository accounts = mock(AccountRepository.class);
        JournalEntryRepository journalEntries = mock(JournalEntryRepository.class);
        when(accounts.findById(1L)).thenReturn(Optional.of(account));
        when(journalEntries.findByStatusAndEntryDateBetween(
                JournalEntryStatus.POSTED, START, END)).thenReturn(List.of(entry));

        LedgerResponse response = new LedgerService(accounts, journalEntries)
                .findAccountLedger(1L, START, END);

        assertEquals(new BigDecimal("100.00"), response.totalDebit());
        assertEquals(new BigDecimal("0.00"), response.totalCredit());
        assertEquals(new BigDecimal("100.00"), response.balance());
        assertEquals(1, response.entries().size());
        assertEquals("INV-1", response.entries().get(0).reference());
    }

    @Test
    void excludesDraftEntriesBecauseOnlyPostedEntriesAreQueried() {
        Account account = account(1L, "1000", "Cash", AccountType.ASSET);
        AccountRepository accounts = mock(AccountRepository.class);
        JournalEntryRepository journalEntries = mock(JournalEntryRepository.class);
        when(accounts.findById(1L)).thenReturn(Optional.of(account));
        when(journalEntries.findByStatusAndEntryDateBetween(
                JournalEntryStatus.POSTED, START, END)).thenReturn(List.of());

        LedgerResponse response = new LedgerService(accounts, journalEntries)
                .findAccountLedger(1L, START, END);

        assertEquals(List.of(), response.entries());
        assertEquals(BigDecimal.ZERO, response.balance());
    }

    @Test
    void rejectsInvalidDateRange() {
        AccountRepository accounts = mock(AccountRepository.class);
        JournalEntryRepository journalEntries = mock(JournalEntryRepository.class);

        assertThrows(AccountingValidationException.class, () ->
                new LedgerService(accounts, journalEntries)
                        .findAccountLedger(1L, END, START));
    }

    @Test
    void rejectsMissingAccount() {
        AccountRepository accounts = mock(AccountRepository.class);
        JournalEntryRepository journalEntries = mock(JournalEntryRepository.class);
        when(accounts.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                new LedgerService(accounts, journalEntries)
                        .findAccountLedger(99L, START, END));
    }

    private JournalEntry entry(String reference, JournalEntryLine... lines) {
        Journal journal = new Journal();
        journal.setId(1L);
        journal.setName("General");
        JournalEntry entry = new JournalEntry();
        entry.setId(10L);
        entry.setJournal(journal);
        entry.setEntryDate(START);
        entry.setReference(reference);
        entry.setDescription("Test entry");
        entry.setStatus(JournalEntryStatus.POSTED);
        for (JournalEntryLine line : lines) {
            entry.addLine(line);
        }
        return entry;
    }

    private JournalEntryLine line(Account account, String debit, String credit) {
        JournalEntryLine line = new JournalEntryLine();
        line.setAccount(account);
        line.setDebit(new BigDecimal(debit));
        line.setCredit(new BigDecimal(credit));
        line.setDescription("Test line");
        return line;
    }

    private Account account(Long id, String code, String name, AccountType type) {
        Account account = new Account();
        account.setId(id);
        account.setCode(code);
        account.setName(name);
        account.setType(type);
        return account;
    }
}
