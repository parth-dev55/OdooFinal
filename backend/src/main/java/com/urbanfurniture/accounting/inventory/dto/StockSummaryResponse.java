package com.urbanfurniture.accounting.inventory.dto;

import java.math.BigDecimal;

public record StockSummaryResponse(Long productId, String productName, BigDecimal quantity,
                                   BigDecimal inventoryValue, BigDecimal averageCost) {
}
