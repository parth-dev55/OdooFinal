package com.urbanfurniture.accounting.report.service;

import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import com.urbanfurniture.accounting.accounting.enums.AccountType;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.repository.JournalEntryRepository;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.report.dto.AccountBalanceResponse;
import com.urbanfurniture.accounting.report.dto.BalanceSheetResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
@Service
@RequiredArgsConstructor
public class BalanceSheetReportService {
    private final JournalEntryRepository journalEntries;

    @Transactional(readOnly = true)
    public BalanceSheetResponse generate(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        validateDates(startDate, endDate);
        var entries = journalEntries.findByStatusAndEntryDateLessThanEqual(
                JournalEntryStatus.POSTED, endDate);
        var accounts = entries.stream()
                .flatMap(entry -> entry.getLines().stream())
                .collect(java.util.stream.Collectors.groupingBy(
                        line -> line.getAccount().getId(),
                        java.util.LinkedHashMap::new,
                        java.util.stream.Collectors.toList()))
                .values().stream()
                .map(lines -> {
                    var account = lines.get(0).getAccount();
                    var debit = lines.stream().map(line -> line.getDebit()).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                    var credit = lines.stream().map(line -> line.getCredit()).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                    return new AccountBalanceResponse(account.getId(), account.getCode(), account.getName(),
                            account.getType(), debit, credit, debit.subtract(credit));
                }).toList();
        var debit = accounts.stream().map(AccountBalanceResponse::debit).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        var credit = accounts.stream().map(AccountBalanceResponse::credit).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        BigDecimal assets = categoryBalance(accounts, AccountType.ASSET, false);
        BigDecimal liabilities = categoryBalance(accounts, AccountType.LIABILITY, true);
        BigDecimal capital = categoryBalance(accounts, AccountType.CAPITAL, true);
        BigDecimal income = categoryBalance(accounts, AccountType.INCOME, true);
        BigDecimal expenses = categoryBalance(accounts, AccountType.EXPENSE, false);
        BigDecimal currentPeriodProfit = income.subtract(expenses);
        boolean balanced = assets.compareTo(liabilities.add(capital).add(currentPeriodProfit)) == 0;
        return new BalanceSheetResponse(startDate, endDate, debit, credit, debit.subtract(credit), accounts,
                assets, liabilities, capital, currentPeriodProfit, balanced);
    }

    private BigDecimal categoryBalance(java.util.List<AccountBalanceResponse> accounts,
                                       AccountType type, boolean creditNormal) {
        return accounts.stream()
                .filter(account -> account.accountType() == type)
                .map(account -> creditNormal
                        ? account.credit().subtract(account.debit())
                        : account.debit().subtract(account.credit()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void validateDates(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        if (startDate == null || endDate == null || endDate.isBefore(startDate)) {
            throw new AccountingValidationException("Report end date cannot be before start date");
        }
    }
}
