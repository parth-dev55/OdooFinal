package com.urbanfurniture.accounting.budget.dto;

import com.urbanfurniture.accounting.budget.enums.AnalyticAccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateAnalyticAccountRequest(
        @NotBlank @Size(max = 150) String name,
        @NotNull AnalyticAccountType type,
        Boolean active
) {
}
