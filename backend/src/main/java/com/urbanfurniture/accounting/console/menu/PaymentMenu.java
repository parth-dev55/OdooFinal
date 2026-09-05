package com.urbanfurniture.accounting.console.menu;

import com.urbanfurniture.accounting.console.ConsoleMenu;
import com.urbanfurniture.accounting.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentMenu implements ConsoleMenu {
    private final PaymentService service;

    public String getMenuName() { return "payments"; }

    public void execute() {
        System.out.println("Payments: " + service.findHistory(null, null).size());
    }
}
