package com.urbanfurniture.accounting.config;

import com.urbanfurniture.accounting.user.entity.User;
import com.urbanfurniture.accounting.user.enums.Role;
import com.urbanfurniture.accounting.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeedConfig {

    @Bean
    CommandLineRunner seedAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed-admin.enabled:true}") boolean enabled,
            @Value("${app.seed-admin.email:admin@urbanfurniture.com}") String email,
            @Value("${app.seed-admin.password:admin123}") String password) {
        return args -> {
            if (!enabled || userRepository.findByEmailIgnoreCase(email).isPresent()) {
                return;
            }

            User admin = new User();
            admin.setName("Administrator");
            admin.setEmail(email.trim().toLowerCase());
            admin.setPassword(passwordEncoder.encode(password));
            admin.setRole(Role.ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
        };
    }
}
