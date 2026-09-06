package com.urbanfurniture.accounting.purchase.dto;

import com.urbanfurniture.accounting.purchase.entity.PurchaseOrder;
import com.urbanfurniture.accounting.purchase.enums.PurchaseOrderStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PurchaseOrderResponse(
        Long id,
        Long vendorId,
        LocalDate orderDate,
        List<PurchaseOrderItemResponse> items,
        BigDecimal total,
        PurchaseOrderStatus status,
        Long vendorBillId
) {
    public static PurchaseOrderResponse from(PurchaseOrder order, Long vendorBillId) {
        return new PurchaseOrderResponse(order.getId(), order.getVendor().getId(), order.getOrderDate(),
                order.getItems().stream().map(PurchaseOrderItemResponse::from).toList(),
                order.getTotal(), order.getStatus(), vendorBillId);
    }
}
