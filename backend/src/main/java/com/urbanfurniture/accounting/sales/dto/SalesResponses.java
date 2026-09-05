package com.urbanfurniture.accounting.sales.dto;

import com.urbanfurniture.accounting.payment.enums.PaymentMethod;
import com.urbanfurniture.accounting.payment.enums.SettlementStatus;
import com.urbanfurniture.accounting.sales.entity.InvoicePaymentStatus;
import com.urbanfurniture.accounting.sales.entity.SalesOrderStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class SalesResponses {
    private SalesResponses() { }
    public record Line(Long productId, String productName, BigDecimal quantity, BigDecimal unitPrice, BigDecimal taxAmount, BigDecimal lineTotal) { }
    public record Order(Long id, String orderNumber, Long customerId, LocalDate orderDate, SalesOrderStatus status, BigDecimal totalAmount, Long createdById, List<Line> items) { }
    public record Invoice(Long id, String invoiceNumber, Long salesOrderId, Long customerId, LocalDate invoiceDate, LocalDate dueDate, BigDecimal totalAmount, BigDecimal outstandingAmount, InvoicePaymentStatus paymentStatus, SettlementStatus status, List<Line> items) { }
    public record Payment(Long id, String paymentNumber, Long invoiceId, Long customerId, LocalDate paymentDate, PaymentMethod paymentMethod, BigDecimal amount, String reference, Long journalEntryId) { }
}
