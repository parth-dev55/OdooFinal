package com.urbanfurniture.accounting.accounting.service;

import com.urbanfurniture.accounting.accounting.dto.DocumentPostingResponse;
import com.urbanfurniture.accounting.accounting.dto.JournalEntryLineRequest;
import com.urbanfurniture.accounting.accounting.dto.PostDocumentRequest;
import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.accounting.repository.JournalEntryRepository;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
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
public class DocumentPostingService {
    private final VendorBillRepository vendorBillRepository;
    private final CustomerInvoiceRepository customerInvoiceRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final AccountingService accountingService;

    @Transactional
    public DocumentPostingResponse postVendorBill(Long id, PostDocumentRequest request) {
        VendorBill bill = vendorBillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor bill " + id + " was not found"));
        if (bill.getJournalEntry() != null) {
            return new DocumentPostingResponse(id, bill.getJournalEntry().getId(), bill.getTotalAmount());
        }
        JournalEntry entry = createPosting(request, bill.getPurchaseOrder().getOrderDate(),
                "Vendor bill " + bill.getBillNumber(), bill.getTotalAmount());
        bill.setJournalEntry(entry);
        vendorBillRepository.save(bill);
        return new DocumentPostingResponse(id, entry.getId(), bill.getTotalAmount());
    }

    @Transactional
    public DocumentPostingResponse postCustomerInvoice(Long id, PostDocumentRequest request) {
        CustomerInvoice invoice = customerInvoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer invoice " + id + " was not found"));
        if (invoice.getJournalEntry() != null) {
            return new DocumentPostingResponse(id, invoice.getJournalEntry().getId(), invoice.getTotalAmount());
        }
        JournalEntry entry = createPosting(request, invoice.getSalesOrder().getOrderDate(),
                "Customer invoice " + invoice.getInvoiceNumber(), invoice.getTotalAmount());
        invoice.setJournalEntry(entry);
        customerInvoiceRepository.save(invoice);
        return new DocumentPostingResponse(id, entry.getId(), invoice.getTotalAmount());
    }

    private JournalEntry createPosting(PostDocumentRequest request, java.time.LocalDate date,
                                       String description, BigDecimal amount) {
        if (request.debitAccountId().equals(request.creditAccountId())) {
            throw new AccountingValidationException("Debit and credit accounts must be different");
        }
        var response = accountingService.createJournalEntry(request.journalId(), date, null, description,
                JournalEntryStatus.POSTED,
                List.of(new JournalEntryLineRequest(request.debitAccountId(), amount, BigDecimal.ZERO, description),
                        new JournalEntryLineRequest(request.creditAccountId(), BigDecimal.ZERO, amount, description)));
        return journalEntryRepository.findById(response.id())
                .orElseThrow(() -> new IllegalStateException("Posted journal entry was not saved"));
    }
}
