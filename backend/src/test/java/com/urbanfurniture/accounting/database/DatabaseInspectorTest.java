package com.urbanfurniture.accounting.database;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_CLASS)
class DatabaseInspectorTest {

    @Autowired
    private DatabaseInspector databaseInspector;

    @Test
    void inspectsHibernateTablesAndRelationships() throws Exception {
        List<String> tables = databaseInspector.listAllTables();

        assertTrue(databaseInspector.verifyTableExists("products"));
        assertTrue(databaseInspector.verifyTableExists("sales_orders"));
        assertTrue(databaseInspector.verifyTableExists("stock_movements"));
        assertTrue(databaseInspector.verifyTableExists("payments"));
        assertFalse(tables.isEmpty());
        assertTrue(databaseInspector.getTableColumns("products").stream()
                .anyMatch(column -> column.name().equalsIgnoreCase("id")));
        assertTrue(databaseInspector.getPrimaryKeys("products").stream()
                .anyMatch(column -> column.equalsIgnoreCase("id")));
        assertTrue(databaseInspector.getForeignKeys("sales_order_items").stream()
                .anyMatch(foreignKey -> foreignKey.referencedTable().equalsIgnoreCase("products")));
    }
}
