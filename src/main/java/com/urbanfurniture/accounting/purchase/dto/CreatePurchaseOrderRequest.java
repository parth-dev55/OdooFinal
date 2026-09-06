package com.urbanfurniture.accounting.purchase.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.util.List;

public record CreatePurchaseOrderRequest(
        @NotNull @Positive Long vendorId,
        @NotNull LocalDate orderDate,
        @NotEmpty List<@Valid CreatePurchaseOrderItemRequest> items
) {
}
