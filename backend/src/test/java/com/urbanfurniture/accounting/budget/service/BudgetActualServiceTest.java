package com.urbanfurniture.accounting.budget.service;

import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import com.urbanfurniture.accounting.accounting.entity.JournalEntryLine;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.repository.JournalEntryRepository;
import com.urbanfurniture.accounting.budget.entity.AnalyticAccount;
import com.urbanfurniture.accounting.budget.entity.Budget;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BudgetActualServiceTest {
    @Mock
    private JournalEntryRepository journalEntries;

    @Test
    void derivesPostedAnalyticActualsAndExcludesReversedEntries() {
        LocalDate start = LocalDate.of(2026, 1, 1);
        LocalDate end = LocalDate.of(2026, 1, 31);
        AnalyticAccount analytic = analytic(7L);
        JournalEntry posted = entry(JournalEntryStatus.POSTED, line(analytic, "125.00", "0"));
        when(journalEntries.findByStatusAndEntryDateBetween(JournalEntryStatus.POSTED, start, end))
                .thenReturn(List.of(posted));

        Budget budget = new Budget();
        budget.setAnalyticAccount(analytic);
        budget.setStartDate(start);
        budget.setEndDate(end);
        budget.setActualAmount(new BigDecimal("999.00"));

        assertEquals(new BigDecimal("125.00"), new BudgetActualService(journalEntries).actualFor(budget));
    }

    @Test
    void fallsBackToLegacyActualWhenNoAnalyticPostingsExist() {
        LocalDate start = LocalDate.of(2026, 1, 1);
        LocalDate end = LocalDate.of(2026, 1, 31);
        AnalyticAccount analytic = analytic(7L);
        when(journalEntries.findByStatusAndEntryDateBetween(JournalEntryStatus.POSTED, start, end))
                .thenReturn(List.of());

        Budget budget = new Budget();
        budget.setAnalyticAccount(analytic);
        budget.setStartDate(start);
        budget.setEndDate(end);
        budget.setActualAmount(new BigDecimal("40.00"));

        assertEquals(new BigDecimal("40.00"), new BudgetActualService(journalEntries).actualFor(budget));
    }

    private AnalyticAccount analytic(Long id) {
        AnalyticAccount account = new AnalyticAccount();
        account.setId(id);
        account.setCode("OPS");
        return account;
    }

    private JournalEntry entry(JournalEntryStatus status, JournalEntryLine line) {
        JournalEntry entry = new JournalEntry();
        entry.setStatus(status);
        entry.setEntryDate(LocalDate.of(2026, 1, 15));
        entry.addLine(line);
        return entry;
    }

    private JournalEntryLine line(AnalyticAccount analytic, String debit, String credit) {
        JournalEntryLine line = new JournalEntryLine();
        line.setAnalyticAccount(analytic);
        line.setDebit(new BigDecimal(debit));
        line.setCredit(new BigDecimal(credit));
        return line;
    }
}
