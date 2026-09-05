package com.urbanfurniture.accounting.sales.entity;

import com.urbanfurniture.accounting.product.entity.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

@Entity
@Table(name = "customer_invoice_items")
@Getter
@Setter
@NoArgsConstructor
public class CustomerInvoiceItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_invoice_id", nullable = false, foreignKey = @ForeignKey(name = "fk_invoice_items_invoice"))
    private CustomerInvoice customerInvoice;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_invoice_items_product"))
    private Product product;
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal quantity;
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice;
    @Column(name = "tax", nullable = false, precision = 15, scale = 2)
    private BigDecimal taxAmount;
    @Column(name = "line_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal lineTotal;
}
