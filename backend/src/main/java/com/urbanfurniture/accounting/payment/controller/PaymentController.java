package com.urbanfurniture.accounting.payment.controller;

import com.urbanfurniture.accounting.payment.dto.PaymentResponse;
import com.urbanfurniture.accounting.payment.dto.RegisterPaymentRequest;
import com.urbanfurniture.accounting.payment.service.PaymentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping("/vendor-bills/{vendorBillId}")
    public ResponseEntity<PaymentResponse> registerVendorBillPayment(@PathVariable @Positive Long vendorBillId,
                                                                       @Valid @RequestBody RegisterPaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.registerVendorBillPayment(vendorBillId, request));
    }

    @PostMapping("/customer-invoices/{customerInvoiceId}")
    public ResponseEntity<PaymentResponse> registerCustomerInvoicePayment(@PathVariable @Positive Long customerInvoiceId,
                                                                            @Valid @RequestBody RegisterPaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.registerCustomerInvoicePayment(customerInvoiceId, request));
    }

    @GetMapping
    public List<PaymentResponse> findHistory(@RequestParam(required = false) Long vendorBillId,
                                             @RequestParam(required = false) Long customerInvoiceId) {
        return paymentService.findHistory(vendorBillId, customerInvoiceId);
    }
}
