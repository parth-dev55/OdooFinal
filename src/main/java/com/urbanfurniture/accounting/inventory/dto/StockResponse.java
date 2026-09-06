package com.urbanfurniture.accounting.inventory.dto;

import java.math.BigDecimal;

public record StockResponse(Long productId, BigDecimal currentStock) {
}
