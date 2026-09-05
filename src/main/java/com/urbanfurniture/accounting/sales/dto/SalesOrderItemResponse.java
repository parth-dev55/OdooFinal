package com.urbanfurniture.accounting.sales.dto;

import com.urbanfurniture.accounting.sales.entity.SalesOrderItem;

import java.math.BigDecimal;

public record SalesOrderItemResponse(
        Long id,
        Long productId,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal tax,
        BigDecimal subtotal,
        BigDecimal total
) {

    public static SalesOrderItemResponse from(SalesOrderItem item) {
        return new SalesOrderItemResponse(item.getId(), item.getProduct().getId(), item.getQuantity(),
                item.getUnitPrice(), item.getTax(), item.getSubtotal(), item.getTotal());
    }
}
