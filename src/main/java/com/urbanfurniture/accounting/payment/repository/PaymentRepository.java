package com.urbanfurniture.accounting.payment.repository;

import com.urbanfurniture.accounting.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByVendorBillIdOrderByPaymentDateDescIdDesc(Long vendorBillId);
    List<Payment> findByCustomerInvoiceIdOrderByPaymentDateDescIdDesc(Long customerInvoiceId);
    List<Payment> findAllByOrderByPaymentDateDescIdDesc();
}
