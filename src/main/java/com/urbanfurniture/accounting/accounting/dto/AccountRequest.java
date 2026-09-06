package com.urbanfurniture.accounting.accounting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AccountRequest(
        @NotBlank @Size(max = 30) String code,
        @NotBlank @Size(max = 150) String name
) {
}
