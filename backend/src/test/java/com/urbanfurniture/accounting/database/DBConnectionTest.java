package com.urbanfurniture.accounting.database;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.sql.Connection;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class DBConnectionTest {

    @Autowired
    private DBConnection dbConnection;

    @Test
    void opensAndClosesDriverManagerConnection() throws Exception {
        try (Connection connection = dbConnection.getConnection()) {
            assertTrue(connection.isValid(5));
        }
        assertTrue(dbConnection.testConnection());
    }
}
