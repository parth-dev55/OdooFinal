package com.urbanfurniture.accounting.report.service;

import com.urbanfurniture.accounting.accounting.entity.Account;
import com.urbanfurniture.accounting.accounting.entity.Journal;
import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import com.urbanfurniture.accounting.accounting.entity.JournalEntryLine;
import com.urbanfurniture.accounting.accounting.enums.AccountType;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.repository.JournalEntryRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class FinancialReportClassificationTest {

    @Test
    void classifiesBalanceSheetAccountsAndEquation() {
        JournalEntryRepository repository = mock(JournalEntryRepository.class);
        when(repository.findByStatusAndEntryDateLessThanEqual(
                JournalEntryStatus.POSTED, LocalDate.of(2026, 12, 31)))
                .thenReturn(List.of(entry(
                        line(account(1L, "1000", AccountType.ASSET), "100", "0"),
                        line(account(2L, "2000", AccountType.LIABILITY), "0", "60"),
                        line(account(3L, "3000", AccountType.CAPITAL), "0", "40"))));

        var report = new BalanceSheetReportService(repository)
                .generate(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31));

        assertEquals(new BigDecimal("100"), report.assets());
        assertEquals(new BigDecimal("60"), report.liabilities());
        assertEquals(new BigDecimal("40"), report.capital());
        assertTrue(report.accountingEquationBalanced());
    }

    @Test
    void balanceSheetIncludesEntriesBeforeRequestedStartDate() {
        JournalEntryRepository repository = mock(JournalEntryRepository.class);
        when(repository.findByStatusAndEntryDateLessThanEqual(
                JournalEntryStatus.POSTED, LocalDate.of(2026, 12, 31)))
                .thenReturn(List.of(entryAt(LocalDate.of(2025, 12, 31),
                        line(account(1L, "1000", AccountType.ASSET), "100", "0"),
                        line(account(3L, "3000", AccountType.CAPITAL), "0", "100"))));

        var report = new BalanceSheetReportService(repository)
                .generate(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31));

        assertEquals(new BigDecimal("100"), report.assets());
        assertEquals(new BigDecimal("100"), report.capital());
    }

    @Test
    void calculatesProfitAndLossByAccountType() {
        JournalEntryRepository repository = mock(JournalEntryRepository.class);
        when(repository.findByStatusAndEntryDateBetween(
                JournalEntryStatus.POSTED, LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31)))
                .thenReturn(List.of(entry(
                        line(account(4L, "4000", AccountType.INCOME), "0", "200"),
                        line(account(5L, "5000", AccountType.EXPENSE), "120", "0"))));

        var report = new ProfitAndLossReportService(repository)
                .generate(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31));

        assertEquals(new BigDecimal("200"), report.income());
        assertEquals(new BigDecimal("120"), report.expenses());
        assertEquals(new BigDecimal("80"), report.netProfit());
        assertEquals(new BigDecimal("80"), report.netResult());
    }

    private JournalEntry entry(JournalEntryLine... lines) {
        return entryAt(LocalDate.of(2026, 1, 1), lines);
    }

    private JournalEntry entryAt(LocalDate date, JournalEntryLine... lines) {
        Journal journal = new Journal();
        journal.setId(1L);
        journal.setName("General");
        JournalEntry entry = new JournalEntry();
        entry.setJournal(journal);
        entry.setStatus(JournalEntryStatus.POSTED);
        entry.setEntryDate(date);
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
        return line;
    }

    private Account account(Long id, String code, AccountType type) {
        Account account = new Account();
        account.setId(id);
        account.setCode(code);
        account.setName(code);
        account.setType(type);
        return account;
    }
}
