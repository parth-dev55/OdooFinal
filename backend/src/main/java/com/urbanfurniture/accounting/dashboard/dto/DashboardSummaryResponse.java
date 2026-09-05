package com.urbanfurniture.accounting.dashboard.dto;

import java.math.BigDecimal;

public record DashboardSummaryResponse(
        long activeProducts,
        long activeContacts,
        long salesOrders,
        long purchaseOrders,
        long openCustomerInvoices,
        BigDecimal customerReceivables,
        long openVendorBills,
        BigDecimal vendorPayables,
        BigDecimal currentInventory) {
}
