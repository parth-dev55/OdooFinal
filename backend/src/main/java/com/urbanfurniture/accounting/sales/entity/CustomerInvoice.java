package com.urbanfurniture.accounting.sales.entity;

import com.urbanfurniture.accounting.payment.enums.SettlementStatus;
import com.urbanfurniture.accounting.contact.entity.Contact;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer_invoices")
@Getter @Setter @NoArgsConstructor
public class CustomerInvoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 100)
    private String invoiceNumber;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_order_id", foreignKey = @ForeignKey(name = "fk_customer_invoice_so"))
    private SalesOrder salesOrder;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false, foreignKey = @ForeignKey(name = "fk_customer_invoice_customer"))
    private Contact customer;
    @Column(nullable = false)
    private LocalDate invoiceDate;
    @Column(nullable = false)
    private LocalDate dueDate;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal totalAmount;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal outstandingAmount;
    @Enumerated(EnumType.STRING) @Column(name = "payment_status", nullable = false, length = 20)
    private InvoicePaymentStatus paymentStatus = InvoicePaymentStatus.UNPAID;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private SettlementStatus status = SettlementStatus.OPEN;
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @OneToMany(mappedBy = "customerInvoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CustomerInvoiceItem> items = new ArrayList<>();

    public void addItem(CustomerInvoiceItem item) {
        item.setCustomerInvoice(this);
        items.add(item);
    }
}
