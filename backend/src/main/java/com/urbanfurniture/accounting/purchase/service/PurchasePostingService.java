package com.urbanfurniture.accounting.purchase.service;

import com.urbanfurniture.accounting.accounting.dto.JournalEntryLineRequest;
import com.urbanfurniture.accounting.accounting.dto.JournalEntryResponse;
import com.urbanfurniture.accounting.accounting.entity.Account;
import com.urbanfurniture.accounting.accounting.entity.Journal;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.accounting.service.AccountingService;
import com.urbanfurniture.accounting.purchase.entity.VendorBill;
import com.urbanfurniture.accounting.purchase.entity.VendorBillItem;
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
public class PurchasePostingService {
    private final AccountingService accounting;
    private final TaxConfigurationService taxConfigurations;

    public JournalEntryResponse post(VendorBill bill, Journal journal) {
        Account purchase = requireAccount(journal.getDefaultDebitAccount(), "purchase");
        Account payable = requireAccount(journal.getDefaultCreditAccount(), "payable");
        BigDecimal taxTotal = bill.getItems().stream().map(VendorBillItem::getTaxAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal subtotal = bill.getTotalAmount().subtract(taxTotal);
        List<JournalEntryLineRequest> lines = new ArrayList<>();
        lines.add(new JournalEntryLineRequest(purchase.getId(), subtotal, BigDecimal.ZERO,
                "Vendor bill purchase"));
        addTaxLines(bill, lines);
        lines.add(new JournalEntryLineRequest(payable.getId(), BigDecimal.ZERO, bill.getTotalAmount(),
                "Vendor bill payable"));
        return accounting.createJournalEntry(journal.getId(), bill.getBillDate(),
                bill.getBillNumber(), "Vendor bill " + bill.getBillNumber(),
                JournalEntryStatus.POSTED, lines);
    }

    private void addTaxLines(VendorBill bill, List<JournalEntryLineRequest> lines) {
        Map<Long, TaxPosting> postings = new LinkedHashMap<>();
        for (VendorBillItem item : bill.getItems()) {
            if (item.getTaxAmount() == null || item.getTaxAmount().signum() == 0) continue;
            TaxConfiguration tax = taxConfigurations.resolveActive(
                    item.getProduct().getPurchaseTaxId(), TaxType.PURCHASE_TAX);
            Account account = taxConfigurations.requireTaxAccount(tax);
            postings.compute(account.getId(), (id, existing) -> existing == null
                    ? new TaxPosting(account, item.getTaxAmount())
                    : new TaxPosting(account, existing.amount().add(item.getTaxAmount())));
        }
        postings.values().forEach(tax -> lines.add(new JournalEntryLineRequest(
                tax.account().getId(), tax.amount(), BigDecimal.ZERO, "Purchase input tax")));
    }

    private Account requireAccount(Account account, String purpose) {
        if (account == null) {
            throw new AccountingValidationException("Purchase journal must have a default " + purpose + " account");
        }
        if (!account.isActive()) {
            throw new AccountingValidationException("Purchase journal account " + account.getId() + " is inactive");
        }
        return account;
    }

    private record TaxPosting(Account account, BigDecimal amount) {
    }
}
