package com.urbanfurniture.accounting.inventory.dto;

import com.urbanfurniture.accounting.inventory.enums.MovementType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateStockMovementRequest(
        @NotNull Long productId,
        @NotNull MovementType movementType,
        @NotNull @DecimalMin(value = "0.0", inclusive = false)
        @Digits(integer = 16, fraction = 3) BigDecimal quantity,
        @NotBlank @Size(max = 50) String referenceType,
        @NotBlank @Size(max = 100) String referenceId,
        @NotNull LocalDateTime movementDate
) {
}
