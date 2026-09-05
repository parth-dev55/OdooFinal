package com.urbanfurniture.accounting.report.controller;

import com.urbanfurniture.accounting.report.dto.BalanceSheetResponse;
import com.urbanfurniture.accounting.report.dto.BudgetReportResponse;
import com.urbanfurniture.accounting.report.dto.ProfitLossResponse;
import com.urbanfurniture.accounting.report.service.FinancialReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class FinancialReportController {

    private final FinancialReportService financialReportService;

    @GetMapping("/profit-loss")
    public ProfitLossResponse profitLoss(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return financialReportService.profitLoss(startDate, endDate);
    }

    @GetMapping("/balance-sheet")
    public BalanceSheetResponse balanceSheet(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return financialReportService.balanceSheet(startDate, endDate);
    }

    @GetMapping("/budget")
    public BudgetReportResponse budget(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return financialReportService.budget(startDate, endDate);
    }
}
