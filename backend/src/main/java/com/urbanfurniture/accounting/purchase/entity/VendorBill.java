package com.urbanfurniture.accounting.purchase.entity;

import com.urbanfurniture.accounting.contact.entity.Contact;
import com.urbanfurniture.accounting.payment.enums.SettlementStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vendor_bills")
@Getter @Setter @NoArgsConstructor
public class VendorBill {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 100)
    private String billNumber;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_id", nullable = false, foreignKey = @ForeignKey(name = "fk_vendor_bills_vendor"))
    private Contact vendor;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_order_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_vendor_bills_purchase_order"))
    private PurchaseOrder purchaseOrder;
    @Column(nullable = false)
    private LocalDate billDate;
    @Column(nullable = false)
    private LocalDate dueDate;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal totalAmount;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal outstandingAmount;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private SettlementStatus status = SettlementStatus.OPEN;
    @OneToMany(mappedBy = "vendorBill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VendorBillItem> items = new ArrayList<>();

    public void addItem(VendorBillItem item) {
        item.setVendorBill(this);
        items.add(item);
    }
}
