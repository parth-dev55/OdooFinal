package com.urbanfurniture.accounting.console.menu;

import com.urbanfurniture.accounting.console.ConsoleMenu;
import com.urbanfurniture.accounting.contact.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ContactMenu implements ConsoleMenu {
    private final ContactService service;

    public String getMenuName() { return "contacts"; }

    public void execute() {
        System.out.println("Contacts: " + service.findAll().size());
    }
}
