 package com.urbanfurniture.accounting.product.entity;

import com.urbanfurniture.accounting.product.enums.ProductType;
import com.urbanfurniture.accounting.tax.entity.TaxConfiguration;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ProductType type;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal salesPrice;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal purchasePrice;

    @Column(nullable = false, length = 100)
    private String category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_tax_id", foreignKey = @ForeignKey(name = "fk_product_sales_tax"))
    private TaxConfiguration salesTax;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_tax_id", foreignKey = @ForeignKey(name = "fk_product_purchase_tax"))
    private TaxConfiguration purchaseTax;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getSalesTaxId() {
        return salesTax == null ? null : salesTax.getId();
    }

    public Long getPurchaseTaxId() {
        return purchaseTax == null ? null : purchaseTax.getId();
    }
}
