package com.urbanfurniture.accounting.dashboard.dto;

import java.math.BigDecimal;

public record DashboardSummaryResponse(
        BigDecimal totalSales,
        BigDecimal totalPurchases,
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal netProfit,
        BigDecimal receivables,
        BigDecimal payables,
        long totalProducts,
        long lowStockProducts,
        BigDecimal budgetUtilization
) {
}
