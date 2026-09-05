package com.urbanfurniture.accounting.purchase.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ReceivePurchaseOrderItemRequest(
        @NotNull @Positive Long itemId,
        @NotNull @DecimalMin(value = "0.0", inclusive = false)
        @Digits(integer = 16, fraction = 3) BigDecimal quantity
) {
}
