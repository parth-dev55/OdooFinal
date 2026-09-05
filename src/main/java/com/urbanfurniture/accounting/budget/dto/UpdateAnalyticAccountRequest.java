package com.urbanfurniture.accounting.budget.dto;

import com.urbanfurniture.accounting.budget.enums.AnalyticAccountType;
import jakarta.validation.constraints.Size;

public record UpdateAnalyticAccountRequest(
        @Size(max = 150) String name,
        AnalyticAccountType type,
        Boolean active
) {
}
