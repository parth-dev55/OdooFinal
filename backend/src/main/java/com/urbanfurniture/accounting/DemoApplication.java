package com.urbanfurniture.accounting;

import com.urbanfurniture.accounting.database.DBConnection;
import com.urbanfurniture.accounting.database.DatabaseInspector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.core.annotation.Order;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;

@SpringBootApplication
public class DemoApplication {

    private static final Logger log = LoggerFactory.getLogger(DemoApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @org.springframework.context.annotation.Bean
    @Order(1)
    ApplicationRunner verifyApplicationServices(
            ApplicationContext applicationContext,
            JdbcTemplate jdbcTemplate,
            DBConnection dbConnection,
            DatabaseInspector databaseInspector,
            @Value("${app.startup-checks.enabled:true}") boolean checksEnabled) {
        return args -> {
            if (!checksEnabled) {
                log.info("Startup service checks are disabled");
                return;
            }

            verifyDatabase(jdbcTemplate);
            verifyDriverManagerConnection(dbConnection);
            verifyHibernateTables(databaseInspector);

            String[] serviceNames = applicationContext.getBeansWithAnnotation(Service.class)
                    .keySet()
                    .stream()
                    .sorted()
                    .toArray(String[]::new);

            if (serviceNames.length == 0) {
                throw new IllegalStateException("No @Service beans were discovered");
            }

            log.info("Hibernate database connection: SUCCESS");
            log.info("JDBC DriverManager connection: SUCCESS");
            log.info("Discovered {} services: {}", serviceNames.length, Arrays.toString(serviceNames));
        };
    }

    private void verifyDatabase(JdbcTemplate jdbcTemplate) {
        Integer result;
        try {
            result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        } catch (org.springframework.dao.DataAccessException exception) {
            throw new IllegalStateException("Database connection check failed", exception);
        }
        if (!Integer.valueOf(1).equals(result)) {
            throw new IllegalStateException("Database health check returned an unexpected result");
        }
    }

    private void verifyDriverManagerConnection(DBConnection dbConnection) {
        try (Connection connection = dbConnection.getConnection()) {
            if (!connection.isValid(5)) {
                throw new IllegalStateException("DriverManager database connection is not valid");
            }
        } catch (SQLException exception) {
            throw new IllegalStateException(
                    "DriverManager database connection check failed. "
                            + "Check that MySQL is running and DB_URL, DB_USERNAME, and DB_PASSWORD are configured.",
                    exception);
        }
    }

    private void verifyHibernateTables(DatabaseInspector databaseInspector) {
        List<String> expectedTables = List.of(
                "accounts",
                "journals",
                "journal_entries",
                "journal_entry_lines",
                "contacts",
                "users",
                "products",
                "payments",
                "sales_orders",
                "sales_order_items",
                "customer_invoices",
                "customer_invoice_items",
                "purchase_orders",
                "purchase_order_items",
                "vendor_bills",
                "vendor_bill_items",
                "stock_movements",
                "analytic_accounts",
                "budgets");
        try {
            List<String> actualTables = databaseInspector.listAllTables();
            List<String> missingTables = expectedTables.stream()
                    .filter(expected -> actualTables.stream()
                            .noneMatch(actual -> actual.equalsIgnoreCase(expected)))
                    .toList();
            if (!missingTables.isEmpty()) {
                throw new IllegalStateException("Hibernate table verification failed. Missing tables: " + missingTables);
            }
            log.info("Hibernate table generation: SUCCESS");
            log.info("Total tables discovered: {}", actualTables.size());
        } catch (SQLException exception) {
            throw new IllegalStateException("Hibernate table inspection failed", exception);
        }
    }
}
