package com.urbanfurniture.accounting.purchase.repository;

import com.urbanfurniture.accounting.purchase.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
}
