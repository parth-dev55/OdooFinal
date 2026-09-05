package com.urbanfurniture.accounting.purchase.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record CreateVendorBillRequest(
        @NotNull LocalDate billDate,
        @NotNull LocalDate dueDate,
        @NotNull @Positive Long purchaseOrderId,
        @Positive Long journalId
) {
}
