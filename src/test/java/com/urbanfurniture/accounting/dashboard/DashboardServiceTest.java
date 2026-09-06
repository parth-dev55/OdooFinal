package com.urbanfurniture.accounting.dashboard;

import com.urbanfurniture.accounting.dashboard.service.DashboardService;
import com.urbanfurniture.accounting.inventory.repository.StockMovementRepository;
import com.urbanfurniture.accounting.product.repository.ProductRepository;
import com.urbanfurniture.accounting.purchase.repository.VendorBillRepository;
import com.urbanfurniture.accounting.report.dto.BudgetReportResponse;
import com.urbanfurniture.accounting.report.dto.ProfitLossResponse;
import com.urbanfurniture.accounting.report.service.FinancialReportService;
import com.urbanfurniture.accounting.sales.repository.CustomerInvoiceRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DashboardServiceTest {

    @Test
    void composesSummaryFromExistingReportsAndAggregates() {
        FinancialReportService reports = mock(FinancialReportService.class);
        CustomerInvoiceRepository invoices = mock(CustomerInvoiceRepository.class);
        VendorBillRepository bills = mock(VendorBillRepository.class);
        ProductRepository products = mock(ProductRepository.class);
        StockMovementRepository movements = mock(StockMovementRepository.class);

        when(reports.profitLoss(null, null)).thenReturn(new ProfitLossResponse(
                LocalDate.of(1900, 1, 1), LocalDate.of(2999, 12, 31),
                new BigDecimal("1000.00"), new BigDecimal("400.00"), new BigDecimal("600.00")));
        when(reports.budget(null, null)).thenReturn(new BudgetReportResponse(
                LocalDate.of(1900, 1, 1), LocalDate.of(2999, 12, 31), List.of()));
        when(invoices.sumTotalAmount()).thenReturn(new BigDecimal("1200"));
        when(invoices.sumOutstandingAmount()).thenReturn(new BigDecimal("300"));
        when(bills.sumTotalAmount()).thenReturn(new BigDecimal("700"));
        when(bills.sumOutstandingAmount()).thenReturn(new BigDecimal("250"));
        when(products.countByActiveTrue()).thenReturn(10L);
        when(movements.findCurrentStockByProduct(anyMovementType())).thenReturn(List.of(
                new Object[]{1L, new BigDecimal("3")},
                new Object[]{2L, new BigDecimal("8")}));

        var summary = new DashboardService(reports, invoices, bills, products, movements).summary();

        assertEquals(new BigDecimal("1200.00"), summary.totalSales());
        assertEquals(new BigDecimal("600.00"), summary.netProfit());
        assertEquals(10, summary.totalProducts());
        assertEquals(1, summary.lowStockProducts());
    }

    private com.urbanfurniture.accounting.inventory.enums.MovementType anyMovementType() {
        return com.urbanfurniture.accounting.inventory.enums.MovementType.PURCHASE_RECEIPT;
    }
}
