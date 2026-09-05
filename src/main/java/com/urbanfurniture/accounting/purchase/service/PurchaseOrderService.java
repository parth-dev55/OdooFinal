package com.urbanfurniture.accounting.purchase.service;

import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import com.urbanfurniture.accounting.contact.entity.Contact;
import com.urbanfurniture.accounting.contact.enums.ContactType;
import com.urbanfurniture.accounting.contact.repository.ContactRepository;
import com.urbanfurniture.accounting.inventory.dto.CreateStockMovementRequest;
import com.urbanfurniture.accounting.inventory.enums.MovementType;
import com.urbanfurniture.accounting.inventory.service.InventoryService;
import com.urbanfurniture.accounting.product.entity.Product;
import com.urbanfurniture.accounting.product.repository.ProductRepository;
import com.urbanfurniture.accounting.purchase.dto.CreatePurchaseOrderItemRequest;
import com.urbanfurniture.accounting.purchase.dto.CreatePurchaseOrderRequest;
import com.urbanfurniture.accounting.purchase.dto.PurchaseOrderResponse;
import com.urbanfurniture.accounting.purchase.dto.ReceivePurchaseOrderRequest;
import com.urbanfurniture.accounting.purchase.entity.PurchaseOrder;
import com.urbanfurniture.accounting.purchase.entity.PurchaseOrderItem;
import com.urbanfurniture.accounting.purchase.entity.VendorBill;
import com.urbanfurniture.accounting.purchase.enums.PurchaseOrderStatus;
import com.urbanfurniture.accounting.purchase.repository.PurchaseOrderRepository;
import com.urbanfurniture.accounting.purchase.repository.VendorBillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final VendorBillRepository vendorBillRepository;
    private final ContactRepository contactRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    @Transactional
    public PurchaseOrderResponse create(CreatePurchaseOrderRequest request) {
        Contact vendor = findVendor(request.vendorId());
        PurchaseOrder order = new PurchaseOrder();
        order.setVendor(vendor);
        order.setOrderDate(request.orderDate());
        order.setStatus(PurchaseOrderStatus.DRAFT);

        Set<Long> productIds = new HashSet<>();
        BigDecimal total = BigDecimal.ZERO;
        for (CreatePurchaseOrderItemRequest itemRequest : request.items()) {
            if (!productIds.add(itemRequest.productId())) {
                throw new AccountingValidationException("A product may appear only once in a purchase order");
            }
            Product product = findActiveProduct(itemRequest.productId());
            BigDecimal lineTotal = itemRequest.quantity().multiply(itemRequest.unitPrice())
                    .setScale(2, RoundingMode.HALF_UP);
            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setProduct(product);
            item.setQuantity(itemRequest.quantity());
            item.setUnitPrice(itemRequest.unitPrice());
            item.setReceivedQuantity(BigDecimal.ZERO);
            item.setTotal(lineTotal);
            order.addItem(item);
            total = total.add(lineTotal);
        }
        order.setTotal(total);
        return toResponse(purchaseOrderRepository.save(order));
    }

    @Transactional
    public PurchaseOrderResponse confirm(Long id) {
        PurchaseOrder order = findOrder(id);
        if (order.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new AccountingValidationException("Only draft purchase orders can be confirmed");
        }
        order.setStatus(PurchaseOrderStatus.CONFIRMED);
        return toResponse(purchaseOrderRepository.save(order));
    }

    @Transactional
    public PurchaseOrderResponse receive(Long id, ReceivePurchaseOrderRequest request) {
        PurchaseOrder order = findOrder(id);
        if (order.getStatus() != PurchaseOrderStatus.CONFIRMED
                && order.getStatus() != PurchaseOrderStatus.RECEIVED) {
            throw new AccountingValidationException("Only confirmed purchase orders can receive goods");
        }

        for (var received : request.items()) {
            PurchaseOrderItem item = order.getItems().stream()
                    .filter(candidate -> candidate.getId().equals(received.itemId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Purchase order item " + received.itemId() + " was not found"));
            BigDecimal remaining = item.getQuantity().subtract(item.getReceivedQuantity());
            if (received.quantity().compareTo(remaining) > 0) {
                throw new AccountingValidationException("Received quantity cannot exceed ordered quantity");
            }
            BigDecimal newReceived = item.getReceivedQuantity().add(received.quantity());
            inventoryService.createMovement(new CreateStockMovementRequest(
                    item.getProduct().getId(), MovementType.PURCHASE_RECEIPT, received.quantity(),
                    "GOODS_RECEIPT", order.getId() + ":" + item.getId() + ":" + newReceived,
                    order.getOrderDate().atStartOfDay()));
            item.setReceivedQuantity(newReceived);
        }

        boolean fullyReceived = order.getItems().stream()
                .allMatch(item -> item.getReceivedQuantity().compareTo(item.getQuantity()) == 0);
        order.setStatus(fullyReceived ? PurchaseOrderStatus.BILLED : PurchaseOrderStatus.RECEIVED);
        purchaseOrderRepository.save(order);
        if (fullyReceived && vendorBillRepository.findByPurchaseOrderId(order.getId()).isEmpty()) {
            VendorBill bill = new VendorBill();
            bill.setBillNumber("BILL-PO-" + order.getId());
            bill.setVendor(order.getVendor());
            bill.setPurchaseOrder(order);
            bill.setTotalAmount(order.getTotal());
            bill.setOutstandingAmount(order.getTotal());
            vendorBillRepository.save(bill);
        }
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> findAll() {
        return purchaseOrderRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PurchaseOrderResponse findById(Long id) {
        return toResponse(findOrder(id));
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder order) {
        return vendorBillRepository.findByPurchaseOrderId(order.getId())
                .map(bill -> PurchaseOrderResponse.from(order, bill.getId()))
                .orElseGet(() -> PurchaseOrderResponse.from(order, null));
    }

    private PurchaseOrder findOrder(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order " + id + " was not found"));
    }

    private Contact findVendor(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor contact " + id + " was not found"));
        if (!contact.isActive() || (contact.getType() != ContactType.VENDOR
                && contact.getType() != ContactType.BOTH)) {
            throw new AccountingValidationException("Contact " + id + " is not an active vendor");
        }
        return contact;
    }

    private Product findActiveProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + id + " was not found"));
        if (!product.isActive()) {
            throw new AccountingValidationException("Product " + id + " is inactive");
        }
        return product;
    }
}
