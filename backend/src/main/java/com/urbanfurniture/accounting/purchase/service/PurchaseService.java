package com.urbanfurniture.accounting.purchase.service;

import com.urbanfurniture.accounting.accounting.entity.Journal;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.enums.JournalType;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.accounting.repository.JournalRepository;
import com.urbanfurniture.accounting.accounting.service.AccountingService;
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
import com.urbanfurniture.accounting.purchase.dto.CreatePurchaseOrderRequest;
import com.urbanfurniture.accounting.purchase.dto.CreateVendorBillRequest;
import com.urbanfurniture.accounting.purchase.dto.PurchaseOrderItemRequest;
import com.urbanfurniture.accounting.purchase.dto.PurchaseResponse;
import com.urbanfurniture.accounting.purchase.entity.PurchaseOrder;
import com.urbanfurniture.accounting.purchase.entity.PurchaseOrderItem;
import com.urbanfurniture.accounting.purchase.entity.VendorBill;
import com.urbanfurniture.accounting.purchase.entity.VendorBillItem;
import com.urbanfurniture.accounting.purchase.enums.PurchaseOrderStatus;
import com.urbanfurniture.accounting.purchase.repository.PurchaseOrderRepository;
import com.urbanfurniture.accounting.purchase.repository.VendorBillRepository;
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

@Service
@RequiredArgsConstructor
public class PurchaseService {
    private final PurchaseOrderRepository purchaseOrders;
    private final VendorBillRepository vendorBills;
    private final ContactRepository contacts;
    private final ProductRepository products;
    private final UserRepository users;
    private final InventoryService inventory;
    private final JournalRepository journals;
    private final AccountingService accounting;
    private final ContactOwnershipService ownership;
    private final TaxCalculationService taxCalculation;
    private final PurchasePostingService purchasePosting;

    @Transactional
    public PurchaseResponse.Order createOrder(CreatePurchaseOrderRequest request) {
        PurchaseOrder order = new PurchaseOrder();
        order.setOrderNumber("PO-" + UUID.randomUUID());
        order.setVendor(vendor(request.vendorId()));
        order.setCreatedBy(user(request.createdById()));
        order.setOrderDate(request.orderDate());
        order.setStatus(PurchaseOrderStatus.DRAFT);
        order.setCreatedAt(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseOrderItemRequest lineRequest : request.items()) {
            Product product = product(lineRequest.productId());
            TaxCalculationService.TaxCalculation calculation = taxCalculation.calculate(
                    product, TaxType.PURCHASE_TAX, lineRequest.quantity(), lineRequest.unitPrice());
            PurchaseOrderItem line = new PurchaseOrderItem();
            line.setProduct(product);
            line.setQuantity(lineRequest.quantity());
            line.setUnitPrice(lineRequest.unitPrice());
            line.setTaxAmount(calculation.taxAmount());
            line.setLineTotal(calculation.total());
            order.addItem(line);
            total = total.add(calculation.total());
        }
        order.setTotalAmount(total);
        return orderResponse(purchaseOrders.save(order));
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse.Order> findOrders() {
        return purchaseOrders.findAll().stream().map(this::orderResponse).toList();
    }

    @Transactional(readOnly = true)
    public PurchaseResponse.Order findOrder(Long id) {
        return orderResponse(order(id));
    }

    @Transactional
    public PurchaseResponse.Order approve(Long id) {
        PurchaseOrder order = order(id);
        requireStatus(order, PurchaseOrderStatus.DRAFT, "Only draft purchase orders can be approved");
        order.setStatus(PurchaseOrderStatus.APPROVED);
        return orderResponse(purchaseOrders.save(order));
    }

    @Transactional
    public PurchaseResponse.Order cancel(Long id) {
        PurchaseOrder order = order(id);
        if (order.getStatus() == PurchaseOrderStatus.BILLED
                || order.getStatus() == PurchaseOrderStatus.RECEIVED) {
            throw new AccountingValidationException("A billed or received purchase order cannot be cancelled");
        }
        order.setStatus(PurchaseOrderStatus.CANCELLED);
        return orderResponse(purchaseOrders.save(order));
    }

    @Transactional
    public PurchaseResponse.Order receive(Long id) {
        PurchaseOrder order = order(id);
        if (order.getStatus() != PurchaseOrderStatus.APPROVED) {
            throw new AccountingValidationException("Only approved purchase orders can be received");
        }
        for (PurchaseOrderItem line : order.getItems()) {
            inventory.recordMovement(new StockAdjustmentRequest(
                    line.getProduct().getId(), StockMovementType.PURCHASE, line.getQuantity(),
                    line.getUnitPrice(),
                    order.getOrderDate().atStartOfDay(), order.getOrderNumber(),
                    order.getVendor().getName(), null, "Purchase order receipt",
                    "PURCHASE_ORDER", order.getId()));
        }
        order.setStatus(PurchaseOrderStatus.RECEIVED);
        return orderResponse(purchaseOrders.save(order));
    }

    @Transactional
    public PurchaseResponse.Bill createBill(CreateVendorBillRequest request) {
        if (request.dueDate().isBefore(request.billDate())) {
            throw new AccountingValidationException("Due date cannot be before bill date");
        }
        PurchaseOrder order = order(request.purchaseOrderId());
        if (order.getStatus() != PurchaseOrderStatus.APPROVED
                && order.getStatus() != PurchaseOrderStatus.RECEIVED) {
            throw new AccountingValidationException("Only approved or received purchase orders can be billed");
        }
        if (vendorBills.existsByPurchaseOrderId(order.getId())) {
            throw new AccountingValidationException("A vendor bill already exists for this purchase order");
        }

        VendorBill bill = new VendorBill();
        bill.setBillNumber("BILL-" + UUID.randomUUID());
        bill.setVendor(order.getVendor());
        bill.setPurchaseOrder(order);
        bill.setBillDate(request.billDate());
        bill.setDueDate(request.dueDate());
        bill.setTotalAmount(order.getTotalAmount());
        bill.setOutstandingAmount(order.getTotalAmount());
        bill.setStatus(SettlementStatus.OPEN);
        for (PurchaseOrderItem orderLine : order.getItems()) {
            VendorBillItem billLine = new VendorBillItem();
            billLine.setProduct(orderLine.getProduct());
            billLine.setQuantity(orderLine.getQuantity());
            billLine.setUnitPrice(orderLine.getUnitPrice());
            billLine.setTaxAmount(orderLine.getTaxAmount());
            billLine.setLineTotal(orderLine.getLineTotal());
            bill.addItem(billLine);
        }
        order.setStatus(PurchaseOrderStatus.BILLED);
        purchaseOrders.save(order);
        VendorBill savedBill = vendorBills.save(bill);
        Journal journal = purchaseJournal(request.journalId());
        purchasePosting.post(bill, journal);
        return billResponse(savedBill);
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse.Bill> findBills() {
        return findBills(null);
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse.Bill> findBills(Authentication authentication) {
        return vendorBills.findAll().stream()
                .filter(bill -> ownership.owns(authentication, bill.getVendor()))
                .map(this::billResponse).toList();
    }

    @Transactional(readOnly = true)
    public PurchaseResponse.Bill findBill(Long id) {
        return findBill(id, null);
    }

    @Transactional(readOnly = true)
    public PurchaseResponse.Bill findBill(Long id, Authentication authentication) {
        VendorBill bill = vendorBills.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor bill " + id + " was not found"));
        ownership.requireOwner(authentication, bill.getVendor());
        return billResponse(bill);
    }

    private Contact vendor(Long id) {
        Contact contact = contacts.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor " + id + " was not found"));
        if (!contact.isActive() || (contact.getType() != ContactType.VENDOR
                && contact.getType() != ContactType.BOTH)) {
            throw new AccountingValidationException("An active vendor contact is required");
        }
        return contact;
    }

    private Product product(Long id) {
        Product product = products.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + id + " was not found"));
        if (!product.isActive()) {
            throw new AccountingValidationException("Product " + id + " is inactive");
        }
        return product;
    }

    private User user(Long id) {
        User user = users.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User " + id + " was not found"));
        if (!user.isActive()) {
            throw new AccountingValidationException("User " + id + " is inactive");
        }
        return user;
    }

    private PurchaseOrder order(Long id) {
        return purchaseOrders.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order " + id + " was not found"));
    }

    private Journal purchaseJournal(Long journalId) {
        Journal journal = journalId == null
                ? journals.findFirstByTypeAndActiveTrueOrderByIdAsc(JournalType.PURCHASE)
                .orElseThrow(() -> new AccountingValidationException(
                        "An active purchase journal must be configured before posting vendor bills"))
                : journals.findById(journalId)
                .orElseThrow(() -> new ResourceNotFoundException("Journal " + journalId + " was not found"));
        if (!journal.isActive()) {
            throw new AccountingValidationException("Journal " + journal.getId() + " is inactive");
        }
        if (journal.getType() != null && journal.getType() != JournalType.PURCHASE) {
            throw new AccountingValidationException("Journal " + journal.getId() + " is not a purchase journal");
        }
        return journal;
    }

    private void requireStatus(PurchaseOrder order, PurchaseOrderStatus expected, String message) {
        if (order.getStatus() != expected) {
            throw new AccountingValidationException(message);
        }
    }

    private PurchaseResponse.Order orderResponse(PurchaseOrder order) {
        return new PurchaseResponse.Order(order.getId(), order.getOrderNumber(), order.getVendor().getId(),
                order.getOrderDate(), order.getStatus(), order.getTotalAmount(), order.getCreatedBy().getId(),
                order.getItems().stream().map(this::orderLineResponse).toList());
    }

    private PurchaseResponse.Bill billResponse(VendorBill bill) {
        return new PurchaseResponse.Bill(bill.getId(), bill.getBillNumber(), bill.getPurchaseOrder().getId(),
                bill.getVendor().getId(), bill.getBillDate(), bill.getDueDate(), bill.getTotalAmount(),
                bill.getOutstandingAmount(), bill.getStatus(),
                bill.getItems().stream().map(this::billLineResponse).toList());
    }

    private PurchaseResponse.Line orderLineResponse(PurchaseOrderItem line) {
        return new PurchaseResponse.Line(line.getProduct().getId(), line.getProduct().getName(),
                line.getQuantity(), line.getUnitPrice(), line.getTaxAmount(), line.getLineTotal());
    }

    private PurchaseResponse.Line billLineResponse(VendorBillItem line) {
        return new PurchaseResponse.Line(line.getProduct().getId(), line.getProduct().getName(),
                line.getQuantity(), line.getUnitPrice(), line.getTaxAmount(), line.getLineTotal());
    }
}
