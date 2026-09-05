package com.urbanfurniture.accounting.accounting.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PostDocumentRequest(
        @NotNull @Positive Long journalId,
        @NotNull @Positive Long debitAccountId,
        @NotNull @Positive Long creditAccountId
) {
}
