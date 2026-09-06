package com.urbanfurniture.accounting.sales.controller;

import com.urbanfurniture.accounting.sales.dto.CreateSalesOrderRequest;
import com.urbanfurniture.accounting.sales.dto.SalesOrderResponse;
import com.urbanfurniture.accounting.sales.service.SalesOrderService;
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
@RequestMapping("/api/sales-orders")
@RequiredArgsConstructor
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    @PostMapping
    public ResponseEntity<SalesOrderResponse> create(@Valid @RequestBody CreateSalesOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(salesOrderService.create(request));
    }

    @PostMapping("/{id}/confirm")
    public SalesOrderResponse confirm(@PathVariable @Positive Long id) {
        return salesOrderService.confirm(id);
    }

    @GetMapping
    public List<SalesOrderResponse> findAll() {
        return salesOrderService.findAll();
    }

    @GetMapping("/{id}")
    public SalesOrderResponse findById(@PathVariable @Positive Long id) {
        return salesOrderService.findById(id);
    }
}
