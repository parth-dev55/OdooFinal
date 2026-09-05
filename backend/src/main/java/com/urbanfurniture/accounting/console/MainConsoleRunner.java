package com.urbanfurniture.accounting.console;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Scanner;

@Component
@Order(2)
public class MainConsoleRunner implements ApplicationRunner {
    private final MenuFactory menuFactory;
    private final boolean enabled;

    public MainConsoleRunner(MenuFactory menuFactory,
                             @Value("${app.console.enabled:false}") boolean enabled) {
        this.menuFactory = menuFactory;
        this.enabled = enabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }
        try (Scanner scanner = new Scanner(System.in)) {
            while (true) {
                printMenu();
                if (!scanner.hasNextLine()) {
                    return;
                }
                String option = scanner.nextLine().trim();
                if ("0".equals(option)) {
                    return;
                }
                String menuName = menuNameFor(option);
                if (menuName == null) {
                    System.out.println("Invalid option");
                    continue;
                }
                try {
                    menuFactory.getMenu(menuName).execute();
                } catch (RuntimeException exception) {
                    System.out.println("Menu error: " + exception.getMessage());
                }
            }
        }
    }

    private void printMenu() {
        System.out.println();
        System.out.println("=================================");
        System.out.println(" URBAN FURNITURE ERP TEST MENU");
        System.out.println("=================================");
        int option = 1;
        for (String menuName : menuFactory.getMenuNames()) {
            System.out.printf("%d. %s%n", option++, capitalize(menuName));
        }
        System.out.println("0. Exit");
        System.out.print("Select option: ");
    }

    private String menuNameFor(String option) {
        try {
            int index = Integer.parseInt(option) - 1;
            List<String> names = menuFactory.getMenuNames();
            return index >= 0 && index < names.size() ? names.get(index) : null;
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private String capitalize(String value) {
        return value.substring(0, 1).toUpperCase() + value.substring(1);
    }
}
