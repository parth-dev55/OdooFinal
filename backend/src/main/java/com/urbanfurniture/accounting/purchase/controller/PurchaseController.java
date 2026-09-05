package com.urbanfurniture.accounting.purchase.controller;

import com.urbanfurniture.accounting.purchase.dto.CreatePurchaseOrderRequest;
import com.urbanfurniture.accounting.purchase.dto.CreateVendorBillRequest;
import com.urbanfurniture.accounting.purchase.dto.PurchaseResponse;
import com.urbanfurniture.accounting.purchase.service.PurchaseService;
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
@RequiredArgsConstructor
@RequestMapping("/api/purchases")
public class PurchaseController {
    private final PurchaseService purchaseService;

    @PostMapping("/orders")
    public ResponseEntity<PurchaseResponse.Order> createOrder(
            @Valid @RequestBody CreatePurchaseOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(purchaseService.createOrder(request));
    }

    @GetMapping("/orders")
    public List<PurchaseResponse.Order> findOrders() {
        return purchaseService.findOrders();
    }

    @GetMapping("/orders/{id}")
    public PurchaseResponse.Order findOrder(@PathVariable @Positive Long id) {
        return purchaseService.findOrder(id);
    }

    @PostMapping("/orders/{id}/approve")
    public PurchaseResponse.Order approve(@PathVariable @Positive Long id) {
        return purchaseService.approve(id);
    }

    @PostMapping("/orders/{id}/cancel")
    public PurchaseResponse.Order cancel(@PathVariable @Positive Long id) {
        return purchaseService.cancel(id);
    }

    @PostMapping("/orders/{id}/receive")
    public PurchaseResponse.Order receive(@PathVariable @Positive Long id) {
        return purchaseService.receive(id);
    }

    @PostMapping("/bills")
    public ResponseEntity<PurchaseResponse.Bill> createBill(
            @Valid @RequestBody CreateVendorBillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(purchaseService.createBill(request));
    }

    @GetMapping("/bills")
    public List<PurchaseResponse.Bill> findBills(Authentication authentication) {
        return purchaseService.findBills(authentication);
    }

    @GetMapping("/bills/{id}")
    public PurchaseResponse.Bill findBill(@PathVariable @Positive Long id, Authentication authentication) {
        return purchaseService.findBill(id, authentication);
    }
}
