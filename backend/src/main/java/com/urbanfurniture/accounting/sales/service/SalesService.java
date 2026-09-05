package com.urbanfurniture.accounting.sales.service;

import com.urbanfurniture.accounting.accounting.dto.JournalEntryLineRequest;
import com.urbanfurniture.accounting.accounting.dto.JournalEntryResponse;
import com.urbanfurniture.accounting.accounting.entity.Journal;
import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.enums.JournalType;
import com.urbanfurniture.accounting.accounting.repository.JournalEntryRepository;
import com.urbanfurniture.accounting.accounting.repository.JournalRepository;
import com.urbanfurniture.accounting.accounting.service.AccountingService;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.config.ContactOwnershipService;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import com.urbanfurniture.accounting.contact.entity.Contact;
import com.urbanfurniture.accounting.contact.enums.ContactType;
import com.urbanfurniture.accounting.contact.repository.ContactRepository;
import com.urbanfurniture.accounting.inventory.dto.StockAdjustmentRequest;
import com.urbanfurniture.accounting.inventory.enums.StockMovementType;
import com.urbanfurniture.accounting.inventory.service.InventoryService;
import com.urbanfurniture.accounting.payment.enums.SettlementStatus;
import com.urbanfurniture.accounting.product.entity.Product;
import com.urbanfurniture.accounting.product.repository.ProductRepository;
import com.urbanfurniture.accounting.sales.dto.*;
import com.urbanfurniture.accounting.sales.entity.*;
import com.urbanfurniture.accounting.sales.repository.CustomerInvoiceRepository;
import com.urbanfurniture.accounting.payment.entity.Payment;
import com.urbanfurniture.accounting.payment.repository.PaymentRepository;
import com.urbanfurniture.accounting.sales.repository.SalesOrderRepository;
import com.urbanfurniture.accounting.tax.enums.TaxType;
import com.urbanfurniture.accounting.tax.service.TaxCalculationService;
import com.urbanfurniture.accounting.user.entity.User;
import com.urbanfurniture.accounting.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class SalesService {
    private final SalesOrderRepository orders;
    private final CustomerInvoiceRepository invoices;
    private final PaymentRepository payments;
    private final ContactRepository contacts;
    private final ProductRepository products;
    private final UserRepository users;
    private final JournalEntryRepository journalEntries;
    private final InventoryService inventory;
    private final JournalRepository journals;
    private final AccountingService accounting;
    private final ContactOwnershipService ownership;
    private final TaxCalculationService taxCalculation;
    private final SalesPostingService salesPosting;

    @Transactional
    public SalesResponses.Order createOrder(CreateSalesOrderRequest request) {
        SalesOrder order = new SalesOrder();
        order.setOrderNumber("SO-" + UUID.randomUUID());
        order.setCustomer(customer(request.customerId())); order.setCreatedBy(user(request.createdById()));
        order.setOrderDate(request.orderDate()); order.setStatus(SalesOrderStatus.DRAFT);
        order.setCreatedAt(LocalDateTime.now());
        replaceLines(order, request.items());
        return orderResponse(orders.save(order));
    }
    @Transactional(readOnly = true) public List<SalesResponses.Order> findOrders() { return orders.findAll().stream().map(this::orderResponse).toList(); }
    @Transactional(readOnly = true) public SalesResponses.Order findOrder(Long id) { return orderResponse(order(id)); }
    @Transactional public SalesResponses.Order confirm(Long id) { SalesOrder o=order(id); editable(o); o.setStatus(SalesOrderStatus.CONFIRMED); return orderResponse(orders.save(o)); }
    @Transactional public SalesResponses.Order cancel(Long id) { SalesOrder o=order(id); if (o.getStatus()==SalesOrderStatus.INVOICED||o.getStatus()==SalesOrderStatus.COMPLETED) throw new IllegalArgumentException("An invoiced or completed order cannot be cancelled"); o.setStatus(SalesOrderStatus.CANCELLED); return orderResponse(orders.save(o)); }

    @Transactional
    public SalesResponses.Invoice createInvoice(Long orderId, CreateInvoiceRequest request) {
        SalesOrder o=order(orderId);
        if (o.getStatus()==SalesOrderStatus.CANCELLED) throw new IllegalArgumentException("A cancelled order cannot be invoiced");
        if (o.getStatus()!=SalesOrderStatus.CONFIRMED) throw new IllegalArgumentException("Only confirmed orders can be invoiced");
        if (invoices.existsBySalesOrderId(orderId)) throw new IllegalArgumentException("An invoice already exists for this sales order");
        if (request.dueDate().isBefore(request.invoiceDate())) throw new IllegalArgumentException("Due date cannot be before invoice date");
        CustomerInvoice invoice=new CustomerInvoice(); invoice.setInvoiceNumber("INV-"+UUID.randomUUID()); invoice.setSalesOrder(o); invoice.setCustomer(o.getCustomer()); invoice.setInvoiceDate(request.invoiceDate()); invoice.setDueDate(request.dueDate()); invoice.setStatus(SettlementStatus.OPEN); invoice.setPaymentStatus(InvoicePaymentStatus.UNPAID);
        invoice.setCreatedAt(LocalDateTime.now());
        BigDecimal total=BigDecimal.ZERO;
        for (SalesOrderItem line:o.getItems()) {
            CustomerInvoiceItem item=new CustomerInvoiceItem(); item.setProduct(line.getProduct()); item.setQuantity(line.getQuantity()); item.setUnitPrice(line.getUnitPrice()); item.setTaxAmount(line.getTaxAmount()); item.setLineTotal(line.getLineTotal()); invoice.addItem(item); total=total.add(item.getLineTotal());
        }
        invoice.setTotalAmount(total); invoice.setOutstandingAmount(total); o.setStatus(SalesOrderStatus.INVOICED); orders.save(o);
        CustomerInvoice savedInvoice = invoices.save(invoice);
        for (CustomerInvoiceItem line : savedInvoice.getItems()) {
            inventory.recordMovement(new StockAdjustmentRequest(
                    line.getProduct().getId(), StockMovementType.SALE, line.getQuantity(),
                    savedInvoice.getInvoiceDate().atStartOfDay(), savedInvoice.getInvoiceNumber(),
                    "Sales order", null, "Sales invoice stock issue",
                    "CUSTOMER_INVOICE", savedInvoice.getId()));
        }
        Journal journal = salesJournal(request.journalId());
        salesPosting.post(invoice, journal);
        return invoiceResponse(savedInvoice);
    }
    @Transactional(readOnly = true) public List<SalesResponses.Invoice> findInvoices() { return findInvoices(null); }
    @Transactional(readOnly = true) public List<SalesResponses.Invoice> findInvoices(Authentication authentication) {
        return invoices.findAll().stream()
                .filter(invoice -> ownership.owns(authentication, invoice.getCustomer()))
                .map(this::invoiceResponse).toList();
    }
    @Transactional(readOnly = true) public SalesResponses.Invoice findInvoice(Long id) { return findInvoice(id, null); }
    @Transactional(readOnly = true) public SalesResponses.Invoice findInvoice(Long id, Authentication authentication) {
        CustomerInvoice invoice = invoice(id);
        ownership.requireOwner(authentication, invoice.getCustomer());
        return invoiceResponse(invoice);
    }

    @Transactional
    public SalesResponses.Payment recordPayment(CreateCustomerPaymentRequest request) {
        return recordPayment(request, null);
    }

    @Transactional
    public SalesResponses.Payment recordPayment(CreateCustomerPaymentRequest request, Authentication authentication) {
        CustomerInvoice invoice=invoices.findByIdForUpdate(request.invoiceId()).orElseThrow(()->new ResourceNotFoundException("Invoice "+request.invoiceId()+" was not found"));
        ownership.requireOwner(authentication, invoice.getCustomer());
        if (request.amount() == null || request.amount().signum() <= 0) throw new AccountingValidationException("Payment amount must be positive");
        if (request.amount().compareTo(invoice.getOutstandingAmount())>0) throw new AccountingValidationException("Payment amount cannot exceed the invoice balance");
        if (invoice.getStatus()==SettlementStatus.PAID) throw new AccountingValidationException("Invoice is already paid");
        User createdBy = user(request.createdById());
        Journal journal = paymentJournal(request.journalId(), request.paymentMethod());
        if (journal.getDefaultDebitAccount() == null || journal.getDefaultCreditAccount() == null) {
            throw new AccountingValidationException("Payment journal must have default debit and credit accounts");
        }
        String paymentNumber = "PAY-" + UUID.randomUUID();
        JournalEntryResponse posting = accounting.createJournalEntry(journal.getId(), request.paymentDate(),
                paymentNumber, "Customer invoice payment " + paymentNumber, JournalEntryStatus.POSTED,
                List.of(new JournalEntryLineRequest(journal.getDefaultDebitAccount().getId(),
                                request.amount(), BigDecimal.ZERO, "Customer payment received"),
                        new JournalEntryLineRequest(journal.getDefaultCreditAccount().getId(),
                                BigDecimal.ZERO, request.amount(), "Customer receivable settlement")));
        JournalEntry entry=journalEntries.findById(posting.id()).orElseThrow(()->new IllegalStateException("Journal entry was not saved"));
        Payment payment=new Payment(); payment.setPaymentNumber(paymentNumber); payment.setParty(invoice.getCustomer()); payment.setPartyType(com.urbanfurniture.accounting.sales.entity.SalesPartyType.CUSTOMER); payment.setCustomerInvoice(invoice); payment.setPaymentDate(request.paymentDate()); payment.setAmount(request.amount()); payment.setPaymentMethod(request.paymentMethod()); payment.setReference(trim(request.reference())); payment.setCreatedBy(createdBy); payment.setPaymentType(com.urbanfurniture.accounting.payment.enums.PaymentType.CUSTOMER_RECEIPT); payment.setJournalEntry(entry);
        BigDecimal balance=invoice.getOutstandingAmount().subtract(request.amount()); invoice.setOutstandingAmount(balance); invoice.setPaymentStatus(balance.signum()==0?InvoicePaymentStatus.PAID:InvoicePaymentStatus.PARTIALLY_PAID); invoice.setStatus(balance.signum()==0?SettlementStatus.PAID:SettlementStatus.PARTIALLY_PAID); invoices.save(invoice);
        return paymentResponse(payments.save(payment));
    }
    @Transactional(readOnly = true) public List<SalesResponses.Payment> findPayments(Long invoiceId) { return findPayments(invoiceId, null); }
    @Transactional(readOnly = true) public List<SalesResponses.Payment> findPayments(Long invoiceId, Authentication authentication) {
        return (invoiceId==null?payments.findAll():payments.findByCustomerInvoice_IdOrderByPaymentDateDescIdDesc(invoiceId)).stream()
                .filter(payment -> ownership.owns(authentication, payment.getParty()))
                .map(this::paymentResponse).toList();
    }

    private void replaceLines(SalesOrder order, List<SalesLineRequest> lines) {
        BigDecimal total = BigDecimal.ZERO;
        for (SalesLineRequest request : lines) {
            Product product = product(request.productId());
            TaxCalculationService.TaxCalculation calculation = taxCalculation.calculate(
                    product, TaxType.SALES_TAX, request.quantity(), request.unitPrice());
            SalesOrderItem item = new SalesOrderItem();
            item.setProduct(product);
            item.setQuantity(request.quantity());
            item.setUnitPrice(request.unitPrice());
            item.setTaxAmount(calculation.taxAmount());
            item.setLineTotal(calculation.total());
            order.addItem(item);
            total = total.add(calculation.total());
        }
        order.setTotalAmount(total);
    }
    private Contact customer(Long id){ Contact c=contacts.findById(id).orElseThrow(()->new ResourceNotFoundException("Customer "+id+" was not found")); if(!c.isActive()||(c.getType()!=ContactType.CUSTOMER&&c.getType()!=ContactType.BOTH))throw new IllegalArgumentException("An active customer contact is required"); return c; }
    private Product product(Long id){ Product p=products.findById(id).orElseThrow(()->new ResourceNotFoundException("Product "+id+" was not found")); if(!p.isActive())throw new IllegalArgumentException("Product "+id+" is inactive"); return p; }
    private User user(Long id){ User u=users.findById(id).orElseThrow(()->new ResourceNotFoundException("User "+id+" was not found")); if(!u.isActive())throw new IllegalArgumentException("User "+id+" is inactive"); return u; }
    private SalesOrder order(Long id){return orders.findById(id).orElseThrow(()->new ResourceNotFoundException("Sales order "+id+" was not found"));}
    private CustomerInvoice invoice(Long id){return invoices.findById(id).orElseThrow(()->new ResourceNotFoundException("Invoice "+id+" was not found"));}
    private Journal salesJournal(Long journalId) {
        Journal journal = journalId == null
                ? journals.findFirstByTypeAndActiveTrueOrderByIdAsc(JournalType.SALES)
                .orElseThrow(() -> new AccountingValidationException(
                        "An active sales journal must be configured before posting customer invoices"))
                : journals.findById(journalId)
                .orElseThrow(() -> new ResourceNotFoundException("Journal " + journalId + " was not found"));
        if (!journal.isActive()) {
            throw new AccountingValidationException("Journal " + journal.getId() + " is inactive");
        }
        if (journal.getType() != null && journal.getType() != JournalType.SALES) {
            throw new AccountingValidationException("Journal " + journal.getId() + " is not a sales journal");
        }
        return journal;
    }
    private Journal paymentJournal(Long journalId, com.urbanfurniture.accounting.payment.enums.PaymentMethod method) {
        JournalType type = method == com.urbanfurniture.accounting.payment.enums.PaymentMethod.CASH
                ? JournalType.CASH : JournalType.BANK;
        Journal journal = journalId == null
                ? journals.findFirstByTypeAndActiveTrueOrderByIdAsc(type)
                .orElseThrow(() -> new AccountingValidationException(
                        "An active " + type.name().toLowerCase() + " journal must be configured before recording payments"))
                : journals.findById(journalId)
                .orElseThrow(() -> new ResourceNotFoundException("Journal " + journalId + " was not found"));
        if (!journal.isActive()) {
            throw new AccountingValidationException("Journal " + journal.getId() + " is inactive");
        }
        if (journal.getType() != null && journal.getType() != type) {
            throw new AccountingValidationException("Journal " + journal.getId() + " is not a " + type.name().toLowerCase() + " journal");
        }
        return journal;
    }
    private void editable(SalesOrder o){if(o.getStatus()!=SalesOrderStatus.DRAFT)throw new IllegalArgumentException("Only draft orders can be changed");}
    private String trim(String v){return v==null?null:v.trim();}
    private SalesResponses.Line line(Product p,BigDecimal q,BigDecimal price,BigDecimal tax,BigDecimal total){return new SalesResponses.Line(p.getId(),p.getName(),q,price,tax,total);}
    private SalesResponses.Order orderResponse(SalesOrder o){return new SalesResponses.Order(o.getId(),o.getOrderNumber(),o.getCustomer().getId(),o.getOrderDate(),o.getStatus(),o.getTotalAmount(),o.getCreatedBy().getId(),o.getItems().stream().map(i->line(i.getProduct(),i.getQuantity(),i.getUnitPrice(),i.getTaxAmount(),i.getLineTotal())).toList());}
    private SalesResponses.Invoice invoiceResponse(CustomerInvoice i){return new SalesResponses.Invoice(i.getId(),i.getInvoiceNumber(),i.getSalesOrder()==null?null:i.getSalesOrder().getId(),i.getCustomer().getId(),i.getInvoiceDate(),i.getDueDate(),i.getTotalAmount(),i.getOutstandingAmount(),i.getPaymentStatus(),i.getStatus(),i.getItems().stream().map(x->line(x.getProduct(),x.getQuantity(),x.getUnitPrice(),x.getTaxAmount(),x.getLineTotal())).toList());}
    private SalesResponses.Payment paymentResponse(Payment p){return new SalesResponses.Payment(p.getId(),p.getPaymentNumber(),p.getCustomerInvoice().getId(),p.getParty().getId(),p.getPaymentDate(),p.getPaymentMethod(),p.getAmount(),p.getReference(),p.getJournalEntry().getId());}
}
