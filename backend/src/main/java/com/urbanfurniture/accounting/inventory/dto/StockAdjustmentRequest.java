package com.urbanfurniture.accounting.inventory.dto;

import com.urbanfurniture.accounting.inventory.enums.StockMovementType;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record StockAdjustmentRequest(
        @NotNull Long productId,
        @NotNull StockMovementType movementType,
        @NotNull @Digits(integer = 17, fraction = 2) BigDecimal quantity,
        @Digits(integer = 17, fraction = 2) BigDecimal unitCost,
        LocalDateTime movementDate,
        @Size(max = 100) String reference,
        @Size(max = 100) String source,
        @Size(max = 100) String destination,
        @Size(max = 500) String notes,
        @Size(max = 50) String relatedTransactionType,
        Long relatedTransactionId
) {
    public StockAdjustmentRequest(Long productId, StockMovementType movementType, BigDecimal quantity,
                                  LocalDateTime movementDate, String reference, String source,
                                  String destination, String notes) {
        this(productId, movementType, quantity, null, movementDate, reference, source, destination, notes, null, null);
    }

    public StockAdjustmentRequest(Long productId, StockMovementType movementType, BigDecimal quantity,
                                  LocalDateTime movementDate, String reference, String source,
                                  String destination, String notes, String relatedTransactionType,
                                  Long relatedTransactionId) {
        this(productId, movementType, quantity, null, movementDate, reference, source, destination,
                notes, relatedTransactionType, relatedTransactionId);
    }
}
