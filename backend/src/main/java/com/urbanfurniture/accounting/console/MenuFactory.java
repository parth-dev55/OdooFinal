package com.urbanfurniture.accounting.console;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class MenuFactory {
    private final Map<String, ConsoleMenu> menus;

    public MenuFactory(List<ConsoleMenu> menuList) {
        this.menus = menuList.stream().collect(Collectors.toUnmodifiableMap(
                menu -> normalize(menu.getMenuName()),
                Function.identity(),
                (first, second) -> {
                    throw new IllegalStateException("Duplicate console menu name: " + first.getMenuName());
                }));
    }

    public ConsoleMenu getMenu(String menuName) {
        ConsoleMenu menu = menus.get(normalize(menuName));
        if (menu == null) {
            throw new IllegalArgumentException("Menu not found: " + menuName);
        }
        return menu;
    }

    public List<String> getMenuNames() {
        return menus.values().stream().map(ConsoleMenu::getMenuName).sorted().toList();
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Menu name is required");
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }
}
