package com.urbanfurniture.accounting.accounting.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record JournalEntryLineRequest(
        @NotNull @Positive Long accountId,
        @NotNull @DecimalMin("0.0") @Digits(integer = 17, fraction = 2) BigDecimal debit,
        @NotNull @DecimalMin("0.0") @Digits(integer = 17, fraction = 2) BigDecimal credit,
        @Size(max = 1000) String description
) {
}
