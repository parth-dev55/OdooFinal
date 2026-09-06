package com.urbanfurniture.accounting.purchase.dto;

import com.urbanfurniture.accounting.purchase.entity.PurchaseOrderItem;

import java.math.BigDecimal;

public record PurchaseOrderItemResponse(
        Long id,
        Long productId,
        BigDecimal quantity,
        BigDecimal receivedQuantity,
        BigDecimal unitPrice,
        BigDecimal total
) {
    public static PurchaseOrderItemResponse from(PurchaseOrderItem item) {
        return new PurchaseOrderItemResponse(item.getId(), item.getProduct().getId(), item.getQuantity(),
                item.getReceivedQuantity(), item.getUnitPrice(), item.getTotal());
    }
}
