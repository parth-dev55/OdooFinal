package com.urbanfurniture.accounting.report.service;

import com.urbanfurniture.accounting.accounting.enums.AccountType;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.repository.JournalEntryRepository;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.report.dto.AccountBalanceResponse;
import com.urbanfurniture.accounting.report.dto.ProfitAndLossResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
@Service
@RequiredArgsConstructor
public class ProfitAndLossReportService {
    private final JournalEntryRepository journalEntries;

    @Transactional(readOnly = true)
    public ProfitAndLossResponse generate(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        if (startDate == null || endDate == null || endDate.isBefore(startDate)) {
            throw new AccountingValidationException("Report end date cannot be before start date");
        }
        var entries = journalEntries.findByStatusAndEntryDateBetween(
                JournalEntryStatus.POSTED, startDate, endDate);
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
        BigDecimal income = categoryBalance(accounts, AccountType.INCOME, true);
        BigDecimal expenses = categoryBalance(accounts, AccountType.EXPENSE, false);
        BigDecimal netProfit = income.subtract(expenses);
        return new ProfitAndLossResponse(startDate, endDate, debit, credit, netProfit, accounts,
                income, expenses, netProfit);
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
}
