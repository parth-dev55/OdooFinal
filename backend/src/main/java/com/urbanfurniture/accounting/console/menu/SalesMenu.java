package com.urbanfurniture.accounting.console.menu;

import com.urbanfurniture.accounting.console.ConsoleMenu;
import com.urbanfurniture.accounting.sales.service.SalesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SalesMenu implements ConsoleMenu {
    private final SalesService service;

    public String getMenuName() { return "sales"; }

    public void execute() {
        System.out.println("Sales orders: " + service.findOrders().size());
        System.out.println("Sales invoices: " + service.findInvoices().size());
        System.out.println("Customer payments: " + service.findPayments(null).size());
    }
}
