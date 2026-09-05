package com.urbanfurniture.accounting.inventory.controller;

import com.urbanfurniture.accounting.inventory.dto.StockAdjustmentRequest;
import com.urbanfurniture.accounting.inventory.dto.StockMovementResponse;
import com.urbanfurniture.accounting.inventory.dto.StockSummaryResponse;
import com.urbanfurniture.accounting.inventory.service.InventoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/inventory")
public class InventoryController {
    private final InventoryService inventoryService;

    @PostMapping("/movements")
    public ResponseEntity<StockMovementResponse> recordMovement(
            @Valid @RequestBody StockAdjustmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.recordMovement(request));
    }

    @GetMapping("/movements")
    public List<StockMovementResponse> findMovements(@RequestParam(required = false) @Positive Long productId) {
        return inventoryService.findMovements(productId);
    }

    @GetMapping("/products/{productId}/summary")
    public StockSummaryResponse findSummary(@PathVariable @Positive Long productId) {
        return inventoryService.findSummary(productId);
    }
}
