package com.urbanfurniture.accounting.sales.repository;

import com.urbanfurniture.accounting.sales.entity.CustomerInvoice;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.math.BigDecimal;

public interface CustomerInvoiceRepository extends JpaRepository<CustomerInvoice, Long> {
    @Query("select coalesce(sum(invoice.totalAmount), 0) from CustomerInvoice invoice")
    BigDecimal sumTotalAmount();

    @Query("select coalesce(sum(invoice.outstandingAmount), 0) from CustomerInvoice invoice")
    BigDecimal sumOutstandingAmount();

    java.util.Optional<CustomerInvoice> findBySalesOrderId(Long salesOrderId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select invoice from CustomerInvoice invoice where invoice.id = :id")
    Optional<CustomerInvoice> findByIdForUpdate(@Param("id") Long id);
}
