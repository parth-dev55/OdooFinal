package com.urbanfurniture.accounting.sales.service;

import com.urbanfurniture.accounting.accounting.dto.JournalEntryLineRequest;
import com.urbanfurniture.accounting.accounting.dto.JournalEntryResponse;
import com.urbanfurniture.accounting.accounting.entity.Account;
import com.urbanfurniture.accounting.accounting.entity.Journal;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.accounting.service.AccountingService;
import com.urbanfurniture.accounting.sales.entity.CustomerInvoice;
import com.urbanfurniture.accounting.sales.entity.CustomerInvoiceItem;
import com.urbanfurniture.accounting.tax.entity.TaxConfiguration;
import com.urbanfurniture.accounting.tax.enums.TaxType;
import com.urbanfurniture.accounting.tax.service.TaxConfigurationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SalesPostingService {
    private final AccountingService accounting;
    private final TaxConfigurationService taxConfigurations;

    public JournalEntryResponse post(CustomerInvoice invoice, Journal journal) {
        Account receivable = requireAccount(journal.getDefaultDebitAccount(), "receivable");
        Account revenue = requireAccount(journal.getDefaultCreditAccount(), "revenue");
        BigDecimal taxTotal = invoice.getItems().stream().map(CustomerInvoiceItem::getTaxAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal subtotal = invoice.getTotalAmount().subtract(taxTotal);
        List<JournalEntryLineRequest> lines = new ArrayList<>();
        lines.add(new JournalEntryLineRequest(receivable.getId(), invoice.getTotalAmount(),
                BigDecimal.ZERO, "Customer invoice receivable"));
        lines.add(new JournalEntryLineRequest(revenue.getId(), BigDecimal.ZERO, subtotal,
                "Customer invoice revenue"));
        addTaxLines(invoice, lines);
        return accounting.createJournalEntry(journal.getId(), invoice.getInvoiceDate(),
                invoice.getInvoiceNumber(), "Customer invoice " + invoice.getInvoiceNumber(),
                JournalEntryStatus.POSTED, lines);
    }

    private void addTaxLines(CustomerInvoice invoice, List<JournalEntryLineRequest> lines) {
        Map<Long, TaxPosting> postings = new LinkedHashMap<>();
        for (CustomerInvoiceItem item : invoice.getItems()) {
            if (item.getTaxAmount() == null || item.getTaxAmount().signum() == 0) continue;
            TaxConfiguration tax = taxConfigurations.resolveActive(
                    item.getProduct().getSalesTaxId(), TaxType.SALES_TAX);
            Account account = taxConfigurations.requireTaxAccount(tax);
            postings.compute(account.getId(), (id, existing) -> existing == null
                    ? new TaxPosting(account, item.getTaxAmount())
                    : new TaxPosting(account, existing.amount().add(item.getTaxAmount())));
        }
        postings.values().forEach(tax -> lines.add(new JournalEntryLineRequest(
                tax.account().getId(), BigDecimal.ZERO, tax.amount(), "Sales tax payable")));
    }

    private Account requireAccount(Account account, String purpose) {
        if (account == null) {
            throw new AccountingValidationException("Sales journal must have a default " + purpose + " account");
        }
        if (!account.isActive()) {
            throw new AccountingValidationException("Sales journal account " + account.getId() + " is inactive");
        }
        return account;
    }

    private record TaxPosting(Account account, BigDecimal amount) {
    }
}
