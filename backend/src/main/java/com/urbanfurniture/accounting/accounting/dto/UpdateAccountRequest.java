package com.urbanfurniture.accounting.accounting.dto;

import com.urbanfurniture.accounting.accounting.enums.AccountType;
import jakarta.validation.constraints.Size;

public record UpdateAccountRequest(
        @Size(max = 30) String code,
        @Size(max = 150) String name,
        AccountType type,
        Boolean active
) {
}
