package com.urbanfurniture.accounting.report;

import com.urbanfurniture.accounting.accounting.entity.Account;
import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import com.urbanfurniture.accounting.accounting.entity.JournalEntryLine;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.repository.JournalEntryRepository;
import com.urbanfurniture.accounting.budget.repository.BudgetRepository;
import com.urbanfurniture.accounting.report.service.FinancialReportService;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class FinancialReportServiceTest {

    @Test
    void calculatesProfitLossAndBalanceSheetFromPostedLinesOnly() {
        JournalEntryRepository entries = mock(JournalEntryRepository.class);
        BudgetRepository budgets = mock(BudgetRepository.class);
        FinancialReportService service = new FinancialReportService(entries, budgets);

        JournalEntry posted = entry(JournalEntryStatus.POSTED, LocalDate.of(2026, 1, 10),
                line("4100", "Sales", "0", "1000"),
                line("5100", "Cost", "400", "0"),
                line("1100", "Cash", "600", "0"));
        JournalEntry draft = entry(JournalEntryStatus.DRAFT, LocalDate.of(2026, 1, 10),
                line("4100", "Draft income", "0", "500"));
        when(entries.findByStatusAndEntryDateBetween(any(), any(), any())).thenReturn(List.of(posted));

        var profitLoss = service.profitLoss(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31));
        var balance = service.balanceSheet(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31));

        assertEquals(new BigDecimal("1000.00"), profitLoss.income());
        assertEquals(new BigDecimal("400.00"), profitLoss.expenses());
        assertEquals(new BigDecimal("600.00"), profitLoss.netProfit());
        assertEquals(new BigDecimal("600.00"), balance.assets());
        assertEquals(new BigDecimal("0.00"), balance.liabilities());
        assertEquals(new BigDecimal("0.00"), balance.capital());
    }

    private JournalEntry entry(JournalEntryStatus status, LocalDate date, JournalEntryLine... lines) {
        JournalEntry entry = new JournalEntry();
        entry.setStatus(status);
        entry.setEntryDate(date);
        for (JournalEntryLine line : lines) entry.addLine(line);
        return entry;
    }

    private JournalEntryLine line(String code, String name, String debit, String credit) {
        Account account = new Account();
        account.setCode(code);
        account.setName(name);
        JournalEntryLine line = new JournalEntryLine();
        line.setAccount(account);
        line.setDebit(new BigDecimal(debit));
        line.setCredit(new BigDecimal(credit));
        return line;
    }
}
