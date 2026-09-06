package com.urbanfurniture.accounting.inventory.dto;

import com.urbanfurniture.accounting.inventory.entity.StockMovement;
import com.urbanfurniture.accounting.inventory.enums.MovementType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record StockMovementResponse(
        Long id,
        Long productId,
        MovementType movementType,
        BigDecimal quantity,
        String referenceType,
        String referenceId,
        LocalDateTime movementDate
) {

    public static StockMovementResponse from(StockMovement movement) {
        return new StockMovementResponse(
                movement.getId(),
                movement.getProduct().getId(),
                movement.getMovementType(),
                movement.getQuantity(),
                movement.getReferenceType(),
                movement.getReferenceId(),
                movement.getMovementDate());
    }
}
