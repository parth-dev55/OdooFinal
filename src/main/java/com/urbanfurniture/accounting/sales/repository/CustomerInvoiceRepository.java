package com.urbanfurniture.accounting.sales.repository;

import com.urbanfurniture.accounting.sales.entity.CustomerInvoice;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CustomerInvoiceRepository extends JpaRepository<CustomerInvoice, Long> {
    java.util.Optional<CustomerInvoice> findBySalesOrderId(Long salesOrderId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select invoice from CustomerInvoice invoice where invoice.id = :id")
    Optional<CustomerInvoice> findByIdForUpdate(@Param("id") Long id);
}
