package com.urbanfurniture.accounting.report.service;

import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import com.urbanfurniture.accounting.accounting.entity.JournalEntryLine;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.repository.JournalEntryRepository;
import com.urbanfurniture.accounting.budget.entity.Budget;
import com.urbanfurniture.accounting.budget.repository.BudgetRepository;
import com.urbanfurniture.accounting.report.dto.BalanceSheetResponse;
import com.urbanfurniture.accounting.report.dto.BudgetReportItem;
import com.urbanfurniture.accounting.report.dto.BudgetReportResponse;
import com.urbanfurniture.accounting.report.dto.ProfitLossResponse;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FinancialReportService {

    private static final LocalDate DEFAULT_START = LocalDate.of(1900, 1, 1);
    private static final LocalDate DEFAULT_END = LocalDate.of(2999, 12, 31);

    private final JournalEntryRepository journalEntryRepository;
    private final BudgetRepository budgetRepository;

    @Transactional(readOnly = true)
    public ProfitLossResponse profitLoss(LocalDate startDate, LocalDate endDate) {
        DateRange range = dateRange(startDate, endDate);
        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expenses = BigDecimal.ZERO;
        for (JournalEntry entry : postedEntries(range)) {
            for (JournalEntryLine line : entry.getLines()) {
                if (isIncome(line)) income = income.add(line.getCredit().subtract(line.getDebit()));
                if (isExpense(line)) expenses = expenses.add(line.getDebit().subtract(line.getCredit()));
            }
        }
        return new ProfitLossResponse(range.start(), range.end(), money(income), money(expenses),
                money(income.subtract(expenses)));
    }

    @Transactional(readOnly = true)
    public BalanceSheetResponse balanceSheet(LocalDate startDate, LocalDate endDate) {
        DateRange range = dateRange(startDate, endDate);
        BigDecimal assets = BigDecimal.ZERO;
        BigDecimal liabilities = BigDecimal.ZERO;
        BigDecimal capital = BigDecimal.ZERO;
        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expenses = BigDecimal.ZERO;
        for (JournalEntry entry : postedEntries(range)) {
            for (JournalEntryLine line : entry.getLines()) {
                String code = line.getAccount().getCode();
                BigDecimal debit = line.getDebit();
                BigDecimal credit = line.getCredit();
                if (startsWith(code, '1')) assets = assets.add(debit.subtract(credit));
                if (startsWith(code, '2')) liabilities = liabilities.add(credit.subtract(debit));
                if (startsWith(code, '3')) capital = capital.add(credit.subtract(debit));
                if (isIncome(line)) income = income.add(credit.subtract(debit));
                if (isExpense(line)) expenses = expenses.add(debit.subtract(credit));
            }
        }
        capital = capital.add(income.subtract(expenses));
        return new BalanceSheetResponse(range.start(), range.end(), money(assets), money(liabilities), money(capital));
    }

    @Transactional(readOnly = true)
    public BudgetReportResponse budget(LocalDate startDate, LocalDate endDate) {
        DateRange range = dateRange(startDate, endDate);
        List<BudgetReportItem> budgets = budgetRepository.findAll().stream()
                .filter(budget -> !budget.getPeriodEnd().isBefore(range.start())
                        && !budget.getPeriodStart().isAfter(range.end()))
                .map(this::budgetItem)
                .toList();
        return new BudgetReportResponse(range.start(), range.end(), budgets);
    }

    private BudgetReportItem budgetItem(Budget budget) {
        // Journal lines are not yet linked to analytic accounts; no mapped actuals exist.
        BigDecimal actual = money(BigDecimal.ZERO);
        BigDecimal remaining = money(budget.getPlannedAmount().subtract(actual));
        BigDecimal utilization = budget.getPlannedAmount().signum() == 0
                ? money(BigDecimal.ZERO)
                : money(actual.multiply(BigDecimal.valueOf(100))
                .divide(budget.getPlannedAmount(), 2, RoundingMode.HALF_UP));
        return new BudgetReportItem(budget.getId(), budget.getName(), budget.getAnalyticAccount().getId(),
                budget.getPeriodStart(), budget.getPeriodEnd(), money(budget.getPlannedAmount()),
                actual, remaining, utilization);
    }

    private List<JournalEntry> postedEntries(DateRange range) {
        return journalEntryRepository.findByStatusAndEntryDateBetween(
                JournalEntryStatus.POSTED, range.start(), range.end());
    }

    private boolean isIncome(JournalEntryLine line) {
        return startsWith(line.getAccount().getCode(), '4');
    }

    private boolean isExpense(JournalEntryLine line) {
        String code = line.getAccount().getCode();
        return !code.isEmpty() && code.charAt(0) >= '5' && code.charAt(0) <= '9';
    }

    private boolean startsWith(String code, char prefix) {
        return code != null && !code.isEmpty() && code.charAt(0) == prefix;
    }

    private DateRange dateRange(LocalDate startDate, LocalDate endDate) {
        LocalDate start = startDate == null ? DEFAULT_START : startDate;
        LocalDate end = endDate == null ? DEFAULT_END : endDate;
        if (start.isAfter(end)) {
            throw new AccountingValidationException("Report start date must be on or before end date");
        }
        return new DateRange(start, end);
    }

    private BigDecimal money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private record DateRange(LocalDate start, LocalDate end) {
    }
}
