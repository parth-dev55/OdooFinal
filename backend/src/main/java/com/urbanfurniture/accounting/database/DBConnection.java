package com.urbanfurniture.accounting.database;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Provides explicit JDBC connections for administrative and diagnostic work.
 *
 * JPA remains the application's primary persistence mechanism. This class is
 * intentionally limited to direct JDBC operations that need DriverManager.
 */
@Component
public class DBConnection {

    private static final Logger log = LoggerFactory.getLogger(DBConnection.class);

    private final String url;
    private final String username;
    private final String password;

    public DBConnection(
            @Value("${spring.datasource.url}") String url,
            @Value("${spring.datasource.username}") String username,
            @Value("${spring.datasource.password}") String password) {
        this.url = url;
        this.username = username;
        this.password = password;
    }

    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, username, password);
    }

    public boolean testConnection() {
        try (Connection connection = getConnection()) {
            return connection.isValid(5);
        } catch (SQLException exception) {
            log.warn("DriverManager database connection test failed: {}", exception.getMessage());
            return false;
        }
    }
}
