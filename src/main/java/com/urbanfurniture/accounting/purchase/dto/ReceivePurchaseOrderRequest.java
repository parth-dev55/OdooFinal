package com.urbanfurniture.accounting.purchase.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record ReceivePurchaseOrderRequest(
        @NotEmpty List<@Valid ReceivePurchaseOrderItemRequest> items
) {
}
