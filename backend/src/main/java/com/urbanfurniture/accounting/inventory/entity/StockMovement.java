package com.urbanfurniture.accounting.inventory.entity;

import com.urbanfurniture.accounting.inventory.enums.StockMovementType;
import com.urbanfurniture.accounting.product.entity.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements", indexes = {
        @Index(name = "idx_stock_movements_product_date", columnList = "product_id, movement_date"),
        @Index(name = "idx_stock_movements_related_transaction",
                columnList = "product_id, movement_type, related_transaction_type, related_transaction_id")
})
@Getter
@Setter
@NoArgsConstructor
public class StockMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_stock_movements_product"))
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StockMovementType movementType;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal quantity;

    @Column(precision = 19, scale = 2)
    private BigDecimal unitCost;

    @Column(precision = 19, scale = 2)
    private BigDecimal totalCost;

    @Column(nullable = false)
    private LocalDateTime movementDate;

    @Column(length = 100)
    private String reference;

    @Column(length = 100)
    private String source;

    @Column(length = 100)
    private String destination;

    @Column(length = 500)
    private String notes;

    @Column(length = 50)
    private String relatedTransactionType;

    @Column
    private Long relatedTransactionId;
}
