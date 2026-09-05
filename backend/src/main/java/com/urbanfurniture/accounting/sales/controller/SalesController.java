package com.urbanfurniture.accounting.sales.controller;

import com.urbanfurniture.accounting.sales.dto.*;
import com.urbanfurniture.accounting.sales.service.SalesService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.util.List;

@RestController
@Validated
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SalesController {
    private final SalesService sales;
    @PostMapping("/orders") public ResponseEntity<SalesResponses.Order> createOrder(@Valid @RequestBody CreateSalesOrderRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(sales.createOrder(r));}
    @GetMapping("/orders") public List<SalesResponses.Order> orders(){return sales.findOrders();}
    @GetMapping("/orders/{id}") public SalesResponses.Order order(@PathVariable @Positive Long id){return sales.findOrder(id);}
    @PostMapping("/orders/{id}/confirm") public SalesResponses.Order confirm(@PathVariable @Positive Long id){return sales.confirm(id);}
    @PostMapping("/orders/{id}/cancel") public SalesResponses.Order cancel(@PathVariable @Positive Long id){return sales.cancel(id);}
    @PostMapping("/orders/{id}/invoice") public ResponseEntity<SalesResponses.Invoice> invoice(@PathVariable @Positive Long id,@Valid @RequestBody CreateInvoiceRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(sales.createInvoice(id,r));}
    @GetMapping("/invoices") public List<SalesResponses.Invoice> invoices(Authentication authentication){return sales.findInvoices(authentication);}
    @GetMapping("/invoices/{id}") public SalesResponses.Invoice invoice(@PathVariable @Positive Long id, Authentication authentication){return sales.findInvoice(id, authentication);}
    @PostMapping("/payments") public ResponseEntity<SalesResponses.Payment> payment(@Valid @RequestBody CreateCustomerPaymentRequest r, Authentication authentication){return ResponseEntity.status(HttpStatus.CREATED).body(sales.recordPayment(r, authentication));}
    @GetMapping("/payments") public List<SalesResponses.Payment> payments(@RequestParam(required=false) Long invoiceId, Authentication authentication){return sales.findPayments(invoiceId, authentication);}
}
