package com.urbanfurniture.accounting.payment.entity;

import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import com.urbanfurniture.accounting.payment.enums.PaymentMethod;
import com.urbanfurniture.accounting.payment.enums.PaymentStatus;
import com.urbanfurniture.accounting.payment.enums.PaymentType;
import com.urbanfurniture.accounting.purchase.entity.VendorBill;
import com.urbanfurniture.accounting.sales.entity.CustomerInvoice;
import com.urbanfurniture.accounting.sales.entity.SalesPartyType;
import com.urbanfurniture.accounting.contact.entity.Contact;
import com.urbanfurniture.accounting.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "payment_reference", nullable = false, unique = true, length = 50)
    private String paymentNumber;
    @Column(nullable = false)
    private LocalDate paymentDate;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10)
    private PaymentMethod paymentMethod;
    @Column(length = 100)
    private String reference;
    @Enumerated(EnumType.STRING) @Column(name = "payment_type", nullable = false, length = 20)
    private PaymentType paymentType;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_bill_id", foreignKey = @ForeignKey(name = "fk_payment_vendor_bill"))
    private VendorBill vendorBill;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_invoice_id", foreignKey = @ForeignKey(name = "fk_payment_customer_invoice"))
    private CustomerInvoice customerInvoice;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "party_id", foreignKey = @ForeignKey(name = "fk_payment_party"))
    private Contact party;
    @Enumerated(EnumType.STRING) @Column(name = "party_type", length = 10)
    private SalesPartyType partyType;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", foreignKey = @ForeignKey(name = "fk_payment_user"))
    private User createdBy;
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "journal_entry_id", nullable = false, foreignKey = @ForeignKey(name = "fk_payment_journal_entry"))
    private JournalEntry journalEntry;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10)
    private PaymentStatus status = PaymentStatus.POSTED;

    @jakarta.persistence.PrePersist
    void onCreate() {
        if (paymentNumber == null || paymentNumber.isBlank()) {
            paymentNumber = "PAY-" + java.util.UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
