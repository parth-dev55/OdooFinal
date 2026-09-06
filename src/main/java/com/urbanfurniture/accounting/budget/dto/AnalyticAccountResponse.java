package com.urbanfurniture.accounting.budget.dto;

import com.urbanfurniture.accounting.budget.entity.AnalyticAccount;
import com.urbanfurniture.accounting.budget.enums.AnalyticAccountType;

public record AnalyticAccountResponse(Long id, String name, AnalyticAccountType type, boolean active) {

    public static AnalyticAccountResponse from(AnalyticAccount account) {
        return new AnalyticAccountResponse(account.getId(), account.getName(), account.getType(), account.isActive());
    }
}
