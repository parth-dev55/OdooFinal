package com.urbanfurniture.accounting.database;

import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseInspector {

    private final DBConnection dbConnection;

    public DatabaseInspector(DBConnection dbConnection) {
        this.dbConnection = dbConnection;
    }

    public List<String> listAllTables() throws SQLException {
        try (Connection connection = dbConnection.getConnection()) {
            DatabaseMetaData metadata = connection.getMetaData();
            List<String> tables = new ArrayList<>();
            try (ResultSet resultSet = metadata.getTables(
                    connection.getCatalog(), null, "%", new String[]{"TABLE"})) {
                while (resultSet.next()) {
                    tables.add(resultSet.getString("TABLE_NAME"));
                }
            }
            return tables.stream().sorted(String.CASE_INSENSITIVE_ORDER).toList();
        }
    }

    public List<ColumnInfo> getTableColumns(String tableName) throws SQLException {
        String actualTableName = resolveTableName(tableName);
        try (Connection connection = dbConnection.getConnection()) {
            DatabaseMetaData metadata = connection.getMetaData();
            List<ColumnInfo> columns = new ArrayList<>();
            try (ResultSet resultSet = metadata.getColumns(
                    connection.getCatalog(), null, actualTableName, "%")) {
                while (resultSet.next()) {
                    columns.add(new ColumnInfo(
                            resultSet.getString("COLUMN_NAME"),
                            resultSet.getString("TYPE_NAME"),
                            resultSet.getInt("COLUMN_SIZE"),
                            resultSet.getInt("DECIMAL_DIGITS"),
                            resultSet.getInt("NULLABLE") == DatabaseMetaData.columnNullable,
                            resultSet.getInt("ORDINAL_POSITION")));
                }
            }
            return columns.stream()
                    .sorted((left, right) -> Integer.compare(left.ordinalPosition(), right.ordinalPosition()))
                    .toList();
        }
    }

    public List<String> getPrimaryKeys(String tableName) throws SQLException {
        String actualTableName = resolveTableName(tableName);
        try (Connection connection = dbConnection.getConnection()) {
            DatabaseMetaData metadata = connection.getMetaData();
            List<String> keys = new ArrayList<>();
            try (ResultSet resultSet = metadata.getPrimaryKeys(
                    connection.getCatalog(), null, actualTableName)) {
                while (resultSet.next()) {
                    keys.add(resultSet.getString("COLUMN_NAME"));
                }
            }
            return keys;
        }
    }

    public List<ForeignKeyInfo> getForeignKeys(String tableName) throws SQLException {
        String actualTableName = resolveTableName(tableName);
        try (Connection connection = dbConnection.getConnection()) {
            DatabaseMetaData metadata = connection.getMetaData();
            List<ForeignKeyInfo> foreignKeys = new ArrayList<>();
            try (ResultSet resultSet = metadata.getImportedKeys(
                    connection.getCatalog(), null, actualTableName)) {
                while (resultSet.next()) {
                    foreignKeys.add(new ForeignKeyInfo(
                            resultSet.getString("FK_NAME"),
                            resultSet.getString("FKCOLUMN_NAME"),
                            resultSet.getString("PKTABLE_NAME"),
                            resultSet.getString("PKCOLUMN_NAME")));
                }
            }
            return foreignKeys;
        }
    }

    public boolean verifyTableExists(String tableName) throws SQLException {
        return listAllTables().stream()
                .anyMatch(existing -> existing.equalsIgnoreCase(tableName));
    }

    private String resolveTableName(String tableName) throws SQLException {
        if (tableName == null || tableName.isBlank()) {
            throw new IllegalArgumentException("Table name must not be blank");
        }
        return listAllTables().stream()
                .filter(existing -> existing.equalsIgnoreCase(tableName))
                .findFirst()
                .orElseThrow(() -> new SQLException("Table '" + tableName + "' was not found"));
    }

    public record ColumnInfo(
            String name,
            String typeName,
            int size,
            int decimalDigits,
            boolean nullable,
            int ordinalPosition) {
    }

    public record ForeignKeyInfo(
            String name,
            String columnName,
            String referencedTable,
            String referencedColumn) {
    }
}
