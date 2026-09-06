package com.urbanfurniture.accounting.sales.dto;

import com.urbanfurniture.accounting.sales.entity.SalesOrder;
import com.urbanfurniture.accounting.sales.enums.SalesOrderStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record SalesOrderResponse(
        Long id,
        Long customerId,
        LocalDate orderDate,
        List<SalesOrderItemResponse> items,
        BigDecimal subtotal,
        BigDecimal total,
        SalesOrderStatus status,
        Long customerInvoiceId
) {

    public static SalesOrderResponse from(SalesOrder order, Long customerInvoiceId) {
        return new SalesOrderResponse(order.getId(), order.getCustomer().getId(), order.getOrderDate(),
                order.getItems().stream().map(SalesOrderItemResponse::from).toList(),
                order.getSubtotal(), order.getTotal(), order.getStatus(), customerInvoiceId);
    }
}
