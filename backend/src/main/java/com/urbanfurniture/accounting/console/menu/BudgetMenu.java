package com.urbanfurniture.accounting.console.menu;

import com.urbanfurniture.accounting.budget.service.BudgetService;
import com.urbanfurniture.accounting.console.ConsoleMenu;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BudgetMenu implements ConsoleMenu {
    private final BudgetService service;

    public String getMenuName() { return "budget"; }

    public void execute() {
        System.out.println("Budgets: " + service.findAll().size());
    }
}
