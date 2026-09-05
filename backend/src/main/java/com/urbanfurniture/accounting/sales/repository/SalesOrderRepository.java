package com.urbanfurniture.accounting.sales.repository;

import com.urbanfurniture.accounting.sales.entity.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> { }
