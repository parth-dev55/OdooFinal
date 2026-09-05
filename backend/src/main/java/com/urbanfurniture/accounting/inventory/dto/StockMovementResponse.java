package com.urbanfurniture.accounting.inventory.dto;

import com.urbanfurniture.accounting.inventory.enums.StockMovementType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record StockMovementResponse(
        Long id,
        Long productId,
        String productName,
        StockMovementType movementType,
        BigDecimal quantity,
        BigDecimal unitCost,
        BigDecimal totalCost,
        LocalDateTime movementDate,
        String reference,
        String source,
        String destination,
        String notes,
        String relatedTransactionType,
        Long relatedTransactionId
) {
}
