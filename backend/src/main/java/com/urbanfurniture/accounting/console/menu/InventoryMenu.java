package com.urbanfurniture.accounting.console.menu;

import com.urbanfurniture.accounting.console.ConsoleMenu;
import com.urbanfurniture.accounting.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InventoryMenu implements ConsoleMenu {
    private final InventoryService service;

    public String getMenuName() { return "inventory"; }

    public void execute() {
        System.out.println("Stock movements: " + service.findMovements(null).size());
    }
}
