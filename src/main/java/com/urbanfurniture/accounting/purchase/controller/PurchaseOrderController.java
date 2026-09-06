package com.urbanfurniture.accounting.purchase.controller;

import com.urbanfurniture.accounting.purchase.dto.CreatePurchaseOrderRequest;
import com.urbanfurniture.accounting.purchase.dto.PurchaseOrderResponse;
import com.urbanfurniture.accounting.purchase.dto.ReceivePurchaseOrderRequest;
import com.urbanfurniture.accounting.purchase.service.PurchaseOrderService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping
    public ResponseEntity<PurchaseOrderResponse> create(@Valid @RequestBody CreatePurchaseOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(purchaseOrderService.create(request));
    }

    @PostMapping("/{id}/confirm")
    public PurchaseOrderResponse confirm(@PathVariable @Positive Long id) {
        return purchaseOrderService.confirm(id);
    }

    @PostMapping("/{id}/receive")
    public PurchaseOrderResponse receive(@PathVariable @Positive Long id,
                                         @Valid @RequestBody ReceivePurchaseOrderRequest request) {
        return purchaseOrderService.receive(id, request);
    }

    @GetMapping
    public List<PurchaseOrderResponse> findAll() {
        return purchaseOrderService.findAll();
    }

    @GetMapping("/{id}")
    public PurchaseOrderResponse findById(@PathVariable @Positive Long id) {
        return purchaseOrderService.findById(id);
    }
}
