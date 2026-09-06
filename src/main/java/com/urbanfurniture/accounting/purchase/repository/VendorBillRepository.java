package com.urbanfurniture.accounting.purchase.repository;

import com.urbanfurniture.accounting.purchase.entity.VendorBill;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.math.BigDecimal;

public interface VendorBillRepository extends JpaRepository<VendorBill, Long> {
    @Query("select coalesce(sum(bill.totalAmount), 0) from VendorBill bill")
    BigDecimal sumTotalAmount();

    @Query("select coalesce(sum(bill.outstandingAmount), 0) from VendorBill bill")
    BigDecimal sumOutstandingAmount();

    Optional<VendorBill> findByPurchaseOrderId(Long purchaseOrderId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select bill from VendorBill bill where bill.id = :id")
    Optional<VendorBill> findByIdForUpdate(@Param("id") Long id);
}
