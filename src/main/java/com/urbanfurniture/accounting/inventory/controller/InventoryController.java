package com.urbanfurniture.accounting.inventory.controller;

import com.urbanfurniture.accounting.inventory.dto.CreateStockMovementRequest;
import com.urbanfurniture.accounting.inventory.dto.StockMovementResponse;
import com.urbanfurniture.accounting.inventory.dto.StockResponse;
import com.urbanfurniture.accounting.inventory.service.InventoryService;
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
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/stock-movements")
    public ResponseEntity<StockMovementResponse> createMovement(
            @Valid @RequestBody CreateStockMovementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.createMovement(request));
    }

    @GetMapping("/products/{productId}/stock")
    public StockResponse getCurrentStock(@PathVariable @Positive Long productId) {
        return inventoryService.getCurrentStock(productId);
    }

    @GetMapping("/stock-movements")
    public List<StockMovementResponse> listMovements(@RequestParam @Positive Long productId) {
        return inventoryService.listMovements(productId);
    }
}
