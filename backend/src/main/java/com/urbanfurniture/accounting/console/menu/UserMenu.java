package com.urbanfurniture.accounting.console.menu;

import com.urbanfurniture.accounting.console.ConsoleMenu;
import com.urbanfurniture.accounting.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserMenu implements ConsoleMenu {
    private final UserService service;

    public String getMenuName() { return "users"; }

    public void execute() {
        System.out.println("Users: " + service.findAll().size());
    }
}
