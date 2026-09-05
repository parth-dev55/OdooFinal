package com.urbanfurniture.accounting.report.controller;

import com.urbanfurniture.accounting.report.dto.BalanceSheetResponse;
import com.urbanfurniture.accounting.report.dto.BudgetReportResponse;
import com.urbanfurniture.accounting.report.dto.ProfitAndLossResponse;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.report.service.BalanceSheetReportService;
import com.urbanfurniture.accounting.report.service.BudgetReportService;
import com.urbanfurniture.accounting.report.service.ProfitAndLossReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/reports")
public class ReportController {
    private final BalanceSheetReportService balanceSheet;
    private final ProfitAndLossReportService profitAndLoss;
    private final BudgetReportService budget;

    @GetMapping("/balance-sheet")
    public BalanceSheetResponse balanceSheet(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(required = false) LocalDate asOf) {
        DateRange dates = resolveDates(startDate, endDate, from, to, asOf);
        return balanceSheet.generate(dates.startDate(), dates.endDate());
    }

    @GetMapping("/profit-loss")
    public ProfitAndLossResponse profitAndLoss(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(required = false) LocalDate asOf) {
        DateRange dates = resolveDates(startDate, endDate, from, to, asOf);
        return profitAndLoss.generate(dates.startDate(), dates.endDate());
    }

    @GetMapping("/budget")
    public BudgetReportResponse budget(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(required = false) LocalDate asOf) {
        DateRange dates = resolveDates(startDate, endDate, from, to, asOf);
        return budget.generate(dates.startDate(), dates.endDate());
    }

    private DateRange resolveDates(LocalDate startDate, LocalDate endDate,
                                   LocalDate from, LocalDate to, LocalDate asOf) {
        LocalDate resolvedStart = startDate != null ? startDate : from;
        LocalDate resolvedEnd = endDate != null ? endDate : to;
        if (asOf != null) {
            if (resolvedStart == null) {
                resolvedStart = asOf;
            }
            if (resolvedEnd == null) {
                resolvedEnd = asOf;
            }
        }
        if (resolvedStart == null || resolvedEnd == null) {
            throw new AccountingValidationException(
                    "Report requires startDate/endDate, from/to, or asOf");
        }
        return new DateRange(resolvedStart, resolvedEnd);
    }

    private record DateRange(LocalDate startDate, LocalDate endDate) {
    }
}
