package com.urbanfurniture.accounting.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.api.client.http.javanet.NetHttpTransport;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.service-account.path:}")
    private String configuredPath;

    @Value("${firebase.project-id:odoo-4116c}")
    private String projectId;

    @PostConstruct
    public void initialize() {
        if (!FirebaseApp.getApps().isEmpty()) {
            log.info("FirebaseApp already initialized");
            return;
        }

        try {
            InputStream serviceAccountStream = resolveServiceAccountStream();
            if (serviceAccountStream == null) {
                log.warn("Firebase service account credentials not found. Firebase token verification will fail until credentials are provided.");
                return;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccountStream))
                    .setProjectId(projectId)
                    .setHttpTransport(new NetHttpTransport())
                    .build();

            FirebaseApp.initializeApp(options);
            log.info("Firebase Admin SDK initialized successfully");
        } catch (Exception e) {
            log.error("Failed to initialize Firebase Admin SDK: {}", e.getMessage());
        }
    }

    private InputStream resolveServiceAccountStream() {
        // 1. Check GOOGLE_APPLICATION_CREDENTIALS environment variable
        String envPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        if (envPath != null && !envPath.isBlank()) {
            File envFile = new File(envPath);
            if (envFile.exists() && envFile.isFile()) {
                try {
                    log.info("Loading Firebase credentials from GOOGLE_APPLICATION_CREDENTIALS");
                    return new FileInputStream(envFile);
                } catch (Exception e) {
                    log.warn("Could not read GOOGLE_APPLICATION_CREDENTIALS path: {}", e.getMessage());
                }
            }
        }

        // 2. Check explicitly configured application property
        if (configuredPath != null && !configuredPath.isBlank()) {
            File propFile = new File(configuredPath);
            if (propFile.exists() && propFile.isFile()) {
                try {
                    log.info("Loading Firebase credentials from configured path");
                    return new FileInputStream(propFile);
                } catch (Exception e) {
                    log.warn("Could not read configured Firebase path: {}", e.getMessage());
                }
            }
        }

        // 3. Check common local file locations in project root
        String[] candidateNames = {
                "firebase-service-account.json",
                "odoo-4116c-firebase-adminsdk-fbsvc-d1b7cd49e8.json"
        };

        for (String candidate : candidateNames) {
            File file = new File(candidate);
            if (file.exists() && file.isFile()) {
                try {
                    log.info("Loading Firebase credentials from local file: {}", candidate);
                    return new FileInputStream(file);
                } catch (Exception e) {
                    log.warn("Could not read file {}: {}", candidate, e.getMessage());
                }
            }
        }

        // Search for any *firebase-adminsdk*.json in current directory
        try {
            File currentDir = new File(".");
            File[] matching = currentDir.listFiles((dir, name) ->
                    name.toLowerCase().contains("firebase-adminsdk") && name.endsWith(".json"));
            if (matching != null && matching.length > 0) {
                log.info("Loading Firebase credentials from discovered file: {}", matching[0].getName());
                return new FileInputStream(matching[0]);
            }
        } catch (Exception ignored) {
        }

        // 4. Fallback to classpath resource
        InputStream resourceStream = getClass().getResourceAsStream("/firebase-service-account.json");
        if (resourceStream != null) {
            log.info("Loading Firebase credentials from classpath /firebase-service-account.json");
            return resourceStream;
        }

        return null;
    }
}
