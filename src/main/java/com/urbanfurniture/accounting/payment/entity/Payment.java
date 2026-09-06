package com.urbanfurniture.accounting.payment.entity;

import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import com.urbanfurniture.accounting.payment.enums.PaymentMethod;
import com.urbanfurniture.accounting.payment.enums.PaymentStatus;
import com.urbanfurniture.accounting.payment.enums.PaymentType;
import com.urbanfurniture.accounting.purchase.entity.VendorBill;
import com.urbanfurniture.accounting.sales.entity.CustomerInvoice;
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

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private LocalDate paymentDate;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10)
    private PaymentMethod paymentMethod;
    @Column(length = 100)
    private String reference;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private PaymentType paymentType;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_bill_id", foreignKey = @ForeignKey(name = "fk_payment_vendor_bill"))
    private VendorBill vendorBill;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_invoice_id", foreignKey = @ForeignKey(name = "fk_payment_customer_invoice"))
    private CustomerInvoice customerInvoice;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "journal_entry_id", nullable = false, foreignKey = @ForeignKey(name = "fk_payment_journal_entry"))
    private JournalEntry journalEntry;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10)
    private PaymentStatus status = PaymentStatus.POSTED;
}
