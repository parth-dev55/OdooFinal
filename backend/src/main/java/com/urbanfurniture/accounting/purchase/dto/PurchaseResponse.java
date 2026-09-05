package com.urbanfurniture.accounting.purchase.dto;

import com.urbanfurniture.accounting.payment.enums.SettlementStatus;
import com.urbanfurniture.accounting.purchase.enums.PurchaseOrderStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class PurchaseResponse {
    private PurchaseResponse() {
    }

    public record Line(Long productId, String productName, BigDecimal quantity, BigDecimal unitPrice,
                       BigDecimal taxAmount, BigDecimal lineTotal) {
    }

    public record Order(Long id, String orderNumber, Long vendorId, LocalDate orderDate,
                        PurchaseOrderStatus status, BigDecimal totalAmount, Long createdById,
                        List<Line> items) {
    }

    public record Bill(Long id, String billNumber, Long purchaseOrderId, Long vendorId,
                       LocalDate billDate, LocalDate dueDate, BigDecimal totalAmount,
                       BigDecimal outstandingAmount, SettlementStatus status, List<Line> items) {
    }
}
