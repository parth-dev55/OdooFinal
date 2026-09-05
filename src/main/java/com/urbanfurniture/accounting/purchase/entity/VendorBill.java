package com.urbanfurniture.accounting.purchase.entity;

import com.urbanfurniture.accounting.contact.entity.Contact;
import com.urbanfurniture.accounting.payment.enums.SettlementStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "vendor_bills")
@Getter @Setter @NoArgsConstructor
public class VendorBill {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Contact vendor;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_order_id", nullable = false, unique = true)
    private PurchaseOrder purchaseOrder;
    @Column(nullable = false, unique = true, length = 100)
    private String billNumber;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal totalAmount;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal outstandingAmount;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private SettlementStatus status = SettlementStatus.OPEN;
}
