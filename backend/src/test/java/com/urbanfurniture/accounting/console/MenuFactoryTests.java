package com.urbanfurniture.accounting.console;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class MenuFactoryTests {

    @Autowired
    private MenuFactory menuFactory;

    @Test
    void discoversFunctionalModuleMenus() {
        assertTrue(menuFactory.getMenuNames().contains("accounting"));
        assertTrue(menuFactory.getMenuNames().contains("products"));
        assertTrue(menuFactory.getMenuNames().contains("sales"));
        assertTrue(menuFactory.getMenuNames().contains("purchase"));
        assertTrue(menuFactory.getMenuNames().contains("inventory"));
        assertTrue(menuFactory.getMenuNames().contains("budget"));
        assertEquals("products", menuFactory.getMenu(" PRODUCTS ").getMenuName());
    }

    @Test
    void rejectsUnknownMenu() {
        assertThrows(IllegalArgumentException.class, () -> menuFactory.getMenu("unknown"));
    }
}
