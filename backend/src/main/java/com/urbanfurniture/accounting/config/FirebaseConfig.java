package com.urbanfurniture.accounting.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @Bean
    @ConditionalOnProperty(name = "app.firebase.enabled", havingValue = "true")
    FirebaseAuth firebaseAuth(
            @Value("${app.firebase.project-id}") String projectId,
            @Value("${app.firebase.service-account-json}") String serviceAccountJson) throws IOException {
        if (projectId.isBlank() || serviceAccountJson.isBlank()) {
            throw new IllegalStateException(
                    "Firebase authentication is enabled but Firebase project credentials are not configured");
        }

        FirebaseApp app = FirebaseApp.getApps().stream().findFirst().orElseGet(() -> {
            try {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(new ByteArrayInputStream(
                                serviceAccountJson.getBytes(StandardCharsets.UTF_8))))
                        .setProjectId(projectId)
                        .build();
                return FirebaseApp.initializeApp(options);
            } catch (IOException exception) {
                throw new IllegalStateException("Firebase credentials could not be initialized", exception);
            }
        });
        return FirebaseAuth.getInstance(app);
    }
}
