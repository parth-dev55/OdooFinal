package com.urbanfurniture.accounting.console.menu;

import com.urbanfurniture.accounting.console.ConsoleMenu;
import com.urbanfurniture.accounting.report.service.BalanceSheetReportService;
import com.urbanfurniture.accounting.report.service.BudgetReportService;
import com.urbanfurniture.accounting.report.service.ProfitAndLossReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class ReportsMenu implements ConsoleMenu {
    private final BalanceSheetReportService balanceSheet;
    private final ProfitAndLossReportService profitAndLoss;
    private final BudgetReportService budget;

    public String getMenuName() { return "reports"; }

    public void execute() {
        LocalDate end = LocalDate.now();
        LocalDate start = end.withDayOfYear(1);
        System.out.println("Balance-sheet net: " + balanceSheet.generate(start, end).netBalance());
        System.out.println("Profit/loss result: " + profitAndLoss.generate(start, end).netResult());
        System.out.println("Budget remaining: " + budget.generate(start, end).remainingAmount());
    }
}
