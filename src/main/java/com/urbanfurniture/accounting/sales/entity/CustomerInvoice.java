package com.urbanfurniture.accounting.sales.entity;

import com.urbanfurniture.accounting.payment.enums.SettlementStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "customer_invoices")
@Getter @Setter @NoArgsConstructor
public class CustomerInvoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 100)
    private String invoiceNumber;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal totalAmount;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal outstandingAmount;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private SettlementStatus status = SettlementStatus.OPEN;
}
