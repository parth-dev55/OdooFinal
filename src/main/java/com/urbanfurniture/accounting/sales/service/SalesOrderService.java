package com.urbanfurniture.accounting.sales.service;

import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import com.urbanfurniture.accounting.contact.entity.Contact;
import com.urbanfurniture.accounting.contact.enums.ContactType;
import com.urbanfurniture.accounting.contact.repository.ContactRepository;
import com.urbanfurniture.accounting.inventory.dto.CreateStockMovementRequest;
import com.urbanfurniture.accounting.inventory.enums.MovementType;
import com.urbanfurniture.accounting.inventory.service.InventoryService;
import com.urbanfurniture.accounting.product.entity.Product;
import com.urbanfurniture.accounting.product.repository.ProductRepository;
import com.urbanfurniture.accounting.sales.dto.CreateSalesOrderItemRequest;
import com.urbanfurniture.accounting.sales.dto.CreateSalesOrderRequest;
import com.urbanfurniture.accounting.sales.dto.SalesOrderResponse;
import com.urbanfurniture.accounting.sales.entity.CustomerInvoice;
import com.urbanfurniture.accounting.sales.entity.SalesOrder;
import com.urbanfurniture.accounting.sales.entity.SalesOrderItem;
import com.urbanfurniture.accounting.sales.enums.SalesOrderStatus;
import com.urbanfurniture.accounting.sales.repository.CustomerInvoiceRepository;
import com.urbanfurniture.accounting.sales.repository.SalesOrderRepository;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;
    private final CustomerInvoiceRepository customerInvoiceRepository;
    private final ContactRepository contactRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    @Transactional
    public SalesOrderResponse create(CreateSalesOrderRequest request) {
        Contact customer = findCustomer(request.customerId());
        SalesOrder order = new SalesOrder();
        order.setCustomer(customer);
        order.setOrderDate(request.orderDate());
        order.setStatus(SalesOrderStatus.DRAFT);

        Set<Long> productIds = new HashSet<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;
        for (CreateSalesOrderItemRequest itemRequest : request.items()) {
            if (!productIds.add(itemRequest.productId())) {
                throw new AccountingValidationException("A product may appear only once in a sales order");
            }
            Product product = findActiveProduct(itemRequest.productId());
            BigDecimal itemSubtotal = itemRequest.quantity().multiply(itemRequest.unitPrice())
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal taxAmount = itemSubtotal.multiply(itemRequest.tax())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            SalesOrderItem item = new SalesOrderItem();
            item.setProduct(product);
            item.setQuantity(itemRequest.quantity());
            item.setUnitPrice(itemRequest.unitPrice());
            item.setTax(itemRequest.tax());
            item.setSubtotal(itemSubtotal);
            item.setTotal(itemSubtotal.add(taxAmount));
            order.addItem(item);
            subtotal = subtotal.add(itemSubtotal);
            total = total.add(item.getTotal());
        }
        order.setSubtotal(subtotal);
        order.setTotal(total);
        return toResponse(salesOrderRepository.save(order));
    }

    @Transactional
    public SalesOrderResponse confirm(Long id) {
        SalesOrder order = findOrder(id);
        if (order.getStatus() != SalesOrderStatus.DRAFT) {
            throw new AccountingValidationException("Only draft sales orders can be confirmed");
        }
        for (SalesOrderItem item : order.getItems()) {
            findActiveProduct(item.getProduct().getId());
            inventoryService.ensureAvailable(item.getProduct().getId(), item.getQuantity());
        }
        for (SalesOrderItem item : order.getItems()) {
            inventoryService.createMovement(new CreateStockMovementRequest(
                    item.getProduct().getId(), MovementType.SALE, item.getQuantity(),
                    "SALES_ORDER", order.getId().toString(), order.getOrderDate().atStartOfDay()));
        }

        order.setStatus(SalesOrderStatus.CONFIRMED);
        salesOrderRepository.save(order);
        CustomerInvoice invoice = new CustomerInvoice();
        invoice.setInvoiceNumber("INV-SO-" + order.getId());
        invoice.setCustomer(order.getCustomer());
        invoice.setSalesOrder(order);
        invoice.setTotalAmount(order.getTotal());
        invoice.setOutstandingAmount(order.getTotal());
        CustomerInvoice savedInvoice = customerInvoiceRepository.save(invoice);
        order.setStatus(SalesOrderStatus.INVOICED);
        return SalesOrderResponse.from(salesOrderRepository.save(order), savedInvoice.getId());
    }

    @Transactional(readOnly = true)
    public List<SalesOrderResponse> findAll() {
        return salesOrderRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public SalesOrderResponse findById(Long id) {
        return toResponse(findOrder(id));
    }

    private SalesOrderResponse toResponse(SalesOrder order) {
        return customerInvoiceRepository.findBySalesOrderId(order.getId())
                .map(invoice -> SalesOrderResponse.from(order, invoice.getId()))
                .orElseGet(() -> SalesOrderResponse.from(order, null));
    }

    private SalesOrder findOrder(Long id) {
        return salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales order " + id + " was not found"));
    }

    private Contact findCustomer(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer contact " + id + " was not found"));
        if (!contact.isActive() || (contact.getType() != ContactType.CUSTOMER
                && contact.getType() != ContactType.BOTH)) {
            throw new AccountingValidationException("Contact " + id + " is not an active customer");
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
