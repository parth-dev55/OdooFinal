package com.urbanfurniture.accounting.budget.service;

import com.urbanfurniture.accounting.accounting.entity.JournalEntryLine;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.repository.JournalEntryRepository;
import com.urbanfurniture.accounting.budget.entity.Budget;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class BudgetActualService {
    private final JournalEntryRepository journalEntries;

    @Transactional(readOnly = true)
    public BigDecimal actualFor(Budget budget) {
        return actualFor(budget.getAnalyticAccount().getId(), budget.getStartDate(), budget.getEndDate(),
                budget.getActualAmount());
    }

    @Transactional(readOnly = true)
    public BigDecimal actualFor(Long analyticAccountId, LocalDate startDate, LocalDate endDate,
                                BigDecimal legacyActual) {
        BigDecimal derived = journalEntries.findByStatusAndEntryDateBetween(
                        JournalEntryStatus.POSTED, startDate, endDate).stream()
                .flatMap(entry -> entry.getLines().stream())
                .filter(line -> line.getAnalyticAccount() != null
                        && analyticAccountId.equals(line.getAnalyticAccount().getId()))
                .map(this::signedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return derived.signum() == 0 && !hasAnalyticLines(analyticAccountId, startDate, endDate)
                ? legacyActual : derived;
    }

    private boolean hasAnalyticLines(Long analyticAccountId, LocalDate startDate, LocalDate endDate) {
        return journalEntries.findByStatusAndEntryDateBetween(
                        JournalEntryStatus.POSTED, startDate, endDate).stream()
                .flatMap(entry -> entry.getLines().stream())
                .anyMatch(line -> line.getAnalyticAccount() != null
                        && analyticAccountId.equals(line.getAnalyticAccount().getId()));
    }

    private BigDecimal signedAmount(JournalEntryLine line) {
        return line.getDebit().subtract(line.getCredit());
    }
}
