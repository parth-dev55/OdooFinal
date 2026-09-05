package com.urbanfurniture.accounting.accounting.dto;

import com.urbanfurniture.accounting.accounting.entity.Account;

public record AccountResponse(Long id, String code, String name, boolean active) {
    public static AccountResponse from(Account account) {
        return new AccountResponse(account.getId(), account.getCode(), account.getName(), account.isActive());
    }
}
