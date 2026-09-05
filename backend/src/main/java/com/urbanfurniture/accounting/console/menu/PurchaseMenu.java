package com.urbanfurniture.accounting.console.menu;

import com.urbanfurniture.accounting.console.ConsoleMenu;
import com.urbanfurniture.accounting.purchase.service.PurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PurchaseMenu implements ConsoleMenu {
    private final PurchaseService service;

    public String getMenuName() { return "purchase"; }

    public void execute() {
        System.out.println("Purchase orders: " + service.findOrders().size());
        System.out.println("Vendor bills: " + service.findBills().size());
    }
}
