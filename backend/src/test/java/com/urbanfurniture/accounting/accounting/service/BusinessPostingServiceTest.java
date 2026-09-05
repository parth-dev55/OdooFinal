package com.urbanfurniture.accounting.accounting.service;

import com.urbanfurniture.accounting.accounting.dto.JournalEntryLineRequest;
import com.urbanfurniture.accounting.accounting.entity.Account;
import com.urbanfurniture.accounting.accounting.entity.Journal;
import com.urbanfurniture.accounting.accounting.enums.AccountType;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.purchase.entity.VendorBill;
import com.urbanfurniture.accounting.purchase.entity.VendorBillItem;
import com.urbanfurniture.accounting.purchase.service.PurchasePostingService;
import com.urbanfurniture.accounting.product.entity.Product;
import com.urbanfurniture.accounting.sales.entity.CustomerInvoice;
import com.urbanfurniture.accounting.sales.entity.CustomerInvoiceItem;
import com.urbanfurniture.accounting.sales.service.SalesPostingService;
import com.urbanfurniture.accounting.tax.entity.TaxConfiguration;
import com.urbanfurniture.accounting.tax.enums.TaxType;
import com.urbanfurniture.accounting.tax.service.TaxConfigurationService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BusinessPostingServiceTest {

    @Test
    void salesPostingCreatesReceivableRevenueAndTaxLines() {
        Account receivable = account(1L, AccountType.ASSET);
        Account revenue = account(2L, AccountType.INCOME);
        Account taxAccount = account(3L, AccountType.LIABILITY);
        Journal journal = journal(receivable, revenue);
        Product product = new Product();
        TaxConfiguration tax = tax(10L, taxAccount, TaxType.SALES_TAX);
        product.setSalesTax(tax);
        CustomerInvoice invoice = new CustomerInvoice();
        invoice.setInvoiceNumber("INV-1");
        invoice.setInvoiceDate(LocalDate.of(2026, 1, 1));
        invoice.setTotalAmount(new BigDecimal("118.00"));
        CustomerInvoiceItem item = new CustomerInvoiceItem();
        item.setProduct(product);
        item.setTaxAmount(new BigDecimal("18.00"));
        invoice.addItem(item);

        AccountingService accounting = mock(AccountingService.class);
        TaxConfigurationService taxes = mock(TaxConfigurationService.class);
        when(taxes.resolveActive(10L, TaxType.SALES_TAX)).thenReturn(tax);
        when(taxes.requireTaxAccount(tax)).thenReturn(taxAccount);

        new SalesPostingService(accounting, taxes).post(invoice, journal);

        ArgumentCaptor<List<JournalEntryLineRequest>> captor = ArgumentCaptor.forClass(List.class);
        verify(accounting).createJournalEntry(any(), any(), any(), any(),
                org.mockito.ArgumentMatchers.eq(JournalEntryStatus.POSTED), captor.capture());
        List<JournalEntryLineRequest> lines = captor.getValue();
        assertEquals(3, lines.size());
        assertEquals(new BigDecimal("118.00"), lines.get(0).debit());
        assertEquals(new BigDecimal("100.00"), lines.get(1).credit());
        assertEquals(new BigDecimal("18.00"), lines.get(2).credit());
    }

    @Test
    void purchasePostingCreatesPurchaseTaxAndPayableLines() {
        Account purchase = account(1L, AccountType.EXPENSE);
        Account payable = account(2L, AccountType.LIABILITY);
        Account taxAccount = account(3L, AccountType.ASSET);
        Journal journal = journal(purchase, payable);
        Product product = new Product();
        TaxConfiguration tax = tax(10L, taxAccount, TaxType.PURCHASE_TAX);
        product.setPurchaseTax(tax);
        VendorBill bill = new VendorBill();
        bill.setBillNumber("BILL-1");
        bill.setBillDate(LocalDate.of(2026, 1, 1));
        bill.setTotalAmount(new BigDecimal("105.00"));
        VendorBillItem item = new VendorBillItem();
        item.setProduct(product);
        item.setTaxAmount(new BigDecimal("5.00"));
        bill.addItem(item);

        AccountingService accounting = mock(AccountingService.class);
        TaxConfigurationService taxes = mock(TaxConfigurationService.class);
        when(taxes.resolveActive(10L, TaxType.PURCHASE_TAX)).thenReturn(tax);
        when(taxes.requireTaxAccount(tax)).thenReturn(taxAccount);

        new PurchasePostingService(accounting, taxes).post(bill, journal);

        ArgumentCaptor<List<JournalEntryLineRequest>> captor = ArgumentCaptor.forClass(List.class);
        verify(accounting).createJournalEntry(any(), any(), any(), any(),
                org.mockito.ArgumentMatchers.eq(JournalEntryStatus.POSTED), captor.capture());
        List<JournalEntryLineRequest> lines = captor.getValue();
        assertEquals(3, lines.size());
        assertEquals(new BigDecimal("100.00"), lines.get(0).debit());
        assertEquals(new BigDecimal("5.00"), lines.get(1).debit());
        assertEquals(new BigDecimal("105.00"), lines.get(2).credit());
    }

    private Journal journal(Account debit, Account credit) {
        Journal journal = new Journal();
        journal.setId(1L);
        journal.setDefaultDebitAccount(debit);
        journal.setDefaultCreditAccount(credit);
        return journal;
    }

    private Account account(Long id, AccountType type) {
        Account account = new Account();
        account.setId(id);
        account.setCode(String.valueOf(id));
        account.setName(String.valueOf(id));
        account.setType(type);
        return account;
    }

    private TaxConfiguration tax(Long id, Account account, TaxType type) {
        TaxConfiguration tax = new TaxConfiguration();
        tax.setId(id);
        tax.setType(type);
        tax.setTaxAccount(account);
        tax.setActive(true);
        return tax;
    }
}
