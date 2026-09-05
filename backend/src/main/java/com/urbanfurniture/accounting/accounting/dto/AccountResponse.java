package com.urbanfurniture.accounting.accounting.dto;

import com.urbanfurniture.accounting.accounting.enums.AccountType;

public record AccountResponse(Long id, String code, String name, AccountType type, boolean active) {
}
