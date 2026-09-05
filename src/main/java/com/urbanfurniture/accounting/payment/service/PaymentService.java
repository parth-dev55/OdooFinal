package com.urbanfurniture.accounting.payment.service;

import com.urbanfurniture.accounting.accounting.dto.JournalEntryLineRequest;
import com.urbanfurniture.accounting.accounting.dto.JournalEntryResponse;
import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.accounting.repository.JournalEntryRepository;
import com.urbanfurniture.accounting.accounting.service.AccountingService;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import com.urbanfurniture.accounting.payment.dto.PaymentResponse;
import com.urbanfurniture.accounting.payment.dto.RegisterPaymentRequest;
import com.urbanfurniture.accounting.payment.entity.Payment;
import com.urbanfurniture.accounting.payment.enums.PaymentStatus;
import com.urbanfurniture.accounting.payment.enums.PaymentType;
import com.urbanfurniture.accounting.payment.enums.SettlementStatus;
import com.urbanfurniture.accounting.payment.repository.PaymentRepository;
import com.urbanfurniture.accounting.purchase.entity.VendorBill;
import com.urbanfurniture.accounting.purchase.repository.VendorBillRepository;
import com.urbanfurniture.accounting.sales.entity.CustomerInvoice;
import com.urbanfurniture.accounting.sales.repository.CustomerInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final VendorBillRepository vendorBillRepository;
    private final CustomerInvoiceRepository customerInvoiceRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final AccountingService accountingService;

    @Transactional
    public PaymentResponse registerVendorBillPayment(Long vendorBillId, RegisterPaymentRequest request) {
        validateRequest(request);
        VendorBill bill = vendorBillRepository.findByIdForUpdate(vendorBillId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor bill " + vendorBillId + " was not found"));
        ensureWithinOutstanding(request.amount(), bill.getOutstandingAmount(), "vendor bill");

        // Debit Accounts Payable / Creditor, credit Cash or Bank.
        JournalEntry journalEntry = createPosting(request, PaymentType.VENDOR_PAYMENT,
                request.counterpartyAccountId(), request.cashOrBankAccountId(), false);
        applySettlement(bill.getOutstandingAmount(), request.amount(), bill::setOutstandingAmount, bill::setStatus);
        vendorBillRepository.save(bill);
        return toResponse(savePayment(request, PaymentType.VENDOR_PAYMENT, bill, null, journalEntry));
    }

    @Transactional
    public PaymentResponse registerCustomerInvoicePayment(Long customerInvoiceId, RegisterPaymentRequest request) {
        validateRequest(request);
        CustomerInvoice invoice = customerInvoiceRepository.findByIdForUpdate(customerInvoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer invoice " + customerInvoiceId + " was not found"));
        ensureWithinOutstanding(request.amount(), invoice.getOutstandingAmount(), "customer invoice");

        // Debit Cash or Bank, credit Accounts Receivable / Debtor.
        JournalEntry journalEntry = createPosting(request, PaymentType.CUSTOMER_RECEIPT,
                request.cashOrBankAccountId(), request.counterpartyAccountId(), true);
        applySettlement(invoice.getOutstandingAmount(), request.amount(), invoice::setOutstandingAmount, invoice::setStatus);
        customerInvoiceRepository.save(invoice);
        return toResponse(savePayment(request, PaymentType.CUSTOMER_RECEIPT, null, invoice, journalEntry));
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> findHistory(Long vendorBillId, Long customerInvoiceId) {
        if (vendorBillId != null && customerInvoiceId != null)
            throw new AccountingValidationException("Specify either vendorBillId or customerInvoiceId, not both");
        List<Payment> payments = vendorBillId != null ? paymentRepository.findByVendorBillIdOrderByPaymentDateDescIdDesc(vendorBillId)
                : customerInvoiceId != null ? paymentRepository.findByCustomerInvoiceIdOrderByPaymentDateDescIdDesc(customerInvoiceId)
                : paymentRepository.findAllByOrderByPaymentDateDescIdDesc();
        return payments.stream().map(this::toResponse).toList();
    }

    private JournalEntry createPosting(RegisterPaymentRequest request, PaymentType type, Long debitAccountId,
                                       Long creditAccountId, boolean customerReceipt) {
        String reference = request.reference() == null ? null : request.reference().trim();
        String description = customerReceipt ? "Customer invoice payment" : "Vendor bill payment";
        JournalEntryResponse response = accountingService.createJournalEntry(request.journalId(), request.paymentDate(),
                reference, description, JournalEntryStatus.POSTED,
                List.of(new JournalEntryLineRequest(debitAccountId, request.amount(), BigDecimal.ZERO, description),
                        new JournalEntryLineRequest(creditAccountId, BigDecimal.ZERO, request.amount(), description)));
        return journalEntryRepository.findById(response.id())
                .orElseThrow(() -> new IllegalStateException("Journal entry was not saved"));
    }

    private Payment savePayment(RegisterPaymentRequest request, PaymentType type, VendorBill bill,
                                CustomerInvoice invoice, JournalEntry journalEntry) {
        Payment payment = new Payment();
        payment.setPaymentDate(request.paymentDate());
        payment.setAmount(request.amount());
        payment.setPaymentMethod(request.paymentMethod());
        payment.setReference(request.reference() == null ? null : request.reference().trim());
        payment.setPaymentType(type);
        payment.setVendorBill(bill);
        payment.setCustomerInvoice(invoice);
        payment.setJournalEntry(journalEntry);
        payment.setStatus(PaymentStatus.POSTED);
        return paymentRepository.save(payment);
    }

    private void validateRequest(RegisterPaymentRequest request) {
        if (request == null || request.amount() == null || request.amount().signum() <= 0)
            throw new AccountingValidationException("Payment amount must be positive");
    }

    private void ensureWithinOutstanding(BigDecimal amount, BigDecimal outstanding, String documentType) {
        if (outstanding == null || outstanding.signum() <= 0)
            throw new AccountingValidationException("The " + documentType + " has no outstanding amount");
        if (amount.compareTo(outstanding) > 0)
            throw new AccountingValidationException("Payment amount cannot exceed the outstanding amount");
    }

    private void applySettlement(BigDecimal outstanding, BigDecimal amount,
                                 java.util.function.Consumer<BigDecimal> outstandingSetter,
                                 java.util.function.Consumer<SettlementStatus> statusSetter) {
        BigDecimal remaining = outstanding.subtract(amount);
        outstandingSetter.accept(remaining);
        statusSetter.accept(remaining.signum() == 0 ? SettlementStatus.PAID : SettlementStatus.PARTIALLY_PAID);
    }

    private PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(payment.getId(), payment.getPaymentDate(), payment.getAmount(), payment.getPaymentMethod(),
                payment.getReference(), payment.getPaymentType(), payment.getVendorBill() == null ? null : payment.getVendorBill().getId(),
                payment.getCustomerInvoice() == null ? null : payment.getCustomerInvoice().getId(),
                payment.getJournalEntry().getId(), payment.getStatus());
    }
}
