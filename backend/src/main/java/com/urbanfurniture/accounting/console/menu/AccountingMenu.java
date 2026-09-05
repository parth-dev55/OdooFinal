package com.urbanfurniture.accounting.console.menu;

import com.urbanfurniture.accounting.accounting.service.AccountingService;
import com.urbanfurniture.accounting.console.ConsoleMenu;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AccountingMenu implements ConsoleMenu {
    private final AccountingService service;

    public String getMenuName() { return "accounting"; }

    public void execute() {
        System.out.println("Accounting journal entries: " + service.findAll().size());
    }
}
