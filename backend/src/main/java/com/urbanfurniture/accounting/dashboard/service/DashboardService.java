package com.urbanfurniture.accounting.dashboard.service;

import com.urbanfurniture.accounting.contact.repository.ContactRepository;
import com.urbanfurniture.accounting.dashboard.dto.DashboardSummaryResponse;
import com.urbanfurniture.accounting.inventory.repository.StockMovementRepository;
import com.urbanfurniture.accounting.payment.enums.SettlementStatus;
import com.urbanfurniture.accounting.product.repository.ProductRepository;
import com.urbanfurniture.accounting.purchase.repository.PurchaseOrderRepository;
import com.urbanfurniture.accounting.purchase.repository.VendorBillRepository;
import com.urbanfurniture.accounting.sales.repository.CustomerInvoiceRepository;
import com.urbanfurniture.accounting.sales.repository.SalesOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository products;
    private final ContactRepository contacts;
    private final SalesOrderRepository salesOrders;
    private final PurchaseOrderRepository purchaseOrders;
    private final CustomerInvoiceRepository customerInvoices;
    private final VendorBillRepository vendorBills;
    private final StockMovementRepository stockMovements;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse summary() {
        return new DashboardSummaryResponse(
                products.findAll().stream().filter(product -> product.isActive()).count(),
                contacts.findAll().stream().filter(contact -> contact.isActive()).count(),
                salesOrders.count(),
                purchaseOrders.count(),
                customerInvoices.findAll().stream()
                        .filter(invoice -> invoice.getStatus() != SettlementStatus.PAID)
                        .count(),
                customerInvoices.findAll().stream()
                        .map(invoice -> invoice.getOutstandingAmount() == null
                                ? BigDecimal.ZERO : invoice.getOutstandingAmount())
                        .reduce(BigDecimal.ZERO, BigDecimal::add),
                vendorBills.findAll().stream()
                        .filter(bill -> bill.getStatus() != SettlementStatus.PAID)
                        .count(),
                vendorBills.findAll().stream()
                        .map(bill -> bill.getOutstandingAmount() == null
                                ? BigDecimal.ZERO : bill.getOutstandingAmount())
                        .reduce(BigDecimal.ZERO, BigDecimal::add),
                stockMovements.findAll().stream()
                        .map(movement -> movement.getQuantity() == null
                                ? BigDecimal.ZERO : movement.getQuantity())
                        .reduce(BigDecimal.ZERO, BigDecimal::add));
    }
}
