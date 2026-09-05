package com.urbanfurniture.accounting.dashboard.service;

import com.urbanfurniture.accounting.dashboard.dto.DashboardSummaryResponse;
import com.urbanfurniture.accounting.inventory.enums.MovementType;
import com.urbanfurniture.accounting.inventory.repository.StockMovementRepository;
import com.urbanfurniture.accounting.product.repository.ProductRepository;
import com.urbanfurniture.accounting.purchase.repository.VendorBillRepository;
import com.urbanfurniture.accounting.report.dto.BudgetReportResponse;
import com.urbanfurniture.accounting.report.dto.ProfitLossResponse;
import com.urbanfurniture.accounting.report.service.FinancialReportService;
import com.urbanfurniture.accounting.sales.repository.CustomerInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final BigDecimal LOW_STOCK_THRESHOLD = BigDecimal.valueOf(5);

    private final FinancialReportService financialReportService;
    private final CustomerInvoiceRepository customerInvoiceRepository;
    private final VendorBillRepository vendorBillRepository;
    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse summary() {
        ProfitLossResponse profitLoss = financialReportService.profitLoss(null, null);
        BudgetReportResponse budgetReport = financialReportService.budget(null, null);

        BigDecimal planned = budgetReport.budgets().stream()
                .map(item -> item.plannedAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal actual = budgetReport.budgets().stream()
                .map(item -> item.actualAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal budgetUtilization = planned.signum() == 0
                ? BigDecimal.ZERO
                : actual.multiply(BigDecimal.valueOf(100)).divide(planned, 2, RoundingMode.HALF_UP);

        long lowStockProducts = stockMovementRepository
                .findCurrentStockByProduct(MovementType.PURCHASE_RECEIPT).stream()
                .filter(row -> ((BigDecimal) row[1]).compareTo(LOW_STOCK_THRESHOLD) <= 0)
                .count();

        return new DashboardSummaryResponse(
                money(customerInvoiceRepository.sumTotalAmount()),
                money(vendorBillRepository.sumTotalAmount()),
                profitLoss.income(),
                profitLoss.expenses(),
                profitLoss.netProfit(),
                money(customerInvoiceRepository.sumOutstandingAmount()),
                money(vendorBillRepository.sumOutstandingAmount()),
                productRepository.countByActiveTrue(),
                lowStockProducts,
                money(budgetUtilization));
    }

    private BigDecimal money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
