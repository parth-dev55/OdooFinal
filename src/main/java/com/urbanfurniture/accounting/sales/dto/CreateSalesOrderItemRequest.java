package com.urbanfurniture.accounting.sales.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CreateSalesOrderItemRequest(
        @NotNull @Positive Long productId,
        @NotNull @DecimalMin(value = "0.0", inclusive = false)
        @Digits(integer = 16, fraction = 3) BigDecimal quantity,
        @NotNull @DecimalMin(value = "0.0")
        @Digits(integer = 17, fraction = 2) BigDecimal unitPrice,
        @NotNull @DecimalMin(value = "0.0")
        @Digits(integer = 5, fraction = 2) BigDecimal tax
) {
}
