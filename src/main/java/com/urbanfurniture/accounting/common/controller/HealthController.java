package com.urbanfurniture.accounting.common.controller;

import com.urbanfurniture.accounting.common.response.HealthResponse;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Lightweight endpoint for checking whether the application is running. */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public HealthResponse health() {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return new HealthResponse("UP", "MySQL");
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "MySQL database connection failed", exception);
        }
    }
}
