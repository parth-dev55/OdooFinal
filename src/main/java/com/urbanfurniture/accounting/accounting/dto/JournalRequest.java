package com.urbanfurniture.accounting.accounting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record JournalRequest(@NotBlank @Size(max = 100) String name) {
}
