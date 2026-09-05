package com.urbanfurniture.accounting.payment.dto;

import com.urbanfurniture.accounting.payment.enums.PaymentMethod;
import com.urbanfurniture.accounting.payment.enums.PaymentStatus;
import com.urbanfurniture.accounting.payment.enums.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentResponse(Long id, LocalDate paymentDate, BigDecimal amount, PaymentMethod paymentMethod,
                              String reference, PaymentType paymentType, Long vendorBillId,
                              Long customerInvoiceId, Long journalEntryId, PaymentStatus status) {
}
