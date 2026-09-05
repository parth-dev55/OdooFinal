package com.urbanfurniture.accounting.config;

import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    private final FirebaseAuthenticationFilter firebaseAuthenticationFilter;

    public SecurityConfig(FirebaseAuthenticationFilter firebaseAuthenticationFilter) {
        this.firebaseAuthenticationFilter = firebaseAuthenticationFilter;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
                .cors(cors -> {})
                .addFilterBefore(firebaseAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/health", "/api/health/db").permitAll()
                        .requestMatchers("/api/auth/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/purchases/bills/**", "/api/sales/invoices/**",
                                "/api/sales/payments").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/sales/payments").authenticated()
                        .requestMatchers("/api/users/**", "/api/accounts/**", "/api/journals/**",
                                "/api/journal-entries/**", "/api/reports/**", "/api/dashboard/**",
                                "/api/ledger/**", "/api/contacts/**", "/api/products/**", "/api/budgets/**",
                                "/api/inventory/**", "/api/purchases/orders/**", "/api/sales/orders/**",
                                "/api/tax-configurations/**")
                        .hasAnyRole("ADMIN", "ACCOUNTANT")
                        .anyRequest().hasAnyRole("ADMIN", "ACCOUNTANT"))
                .build();
    }
}
