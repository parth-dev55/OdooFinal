package com.urbanfurniture.accounting.config;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Component
public class FirebaseAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(FirebaseAuthFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        boolean hasAuthorizationHeader = authHeader != null && !authHeader.isBlank();
        log.info("Authorization header present: {}", hasAuthorizationHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();

            if (!token.isEmpty()) {
                if (FirebaseApp.getApps().isEmpty()) {
                    log.warn("FirebaseApp is not initialized; cannot verify Firebase ID token.");
                } else {
                    try {
                        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                        String uid = decodedToken.getUid();
                        String email = decodedToken.getEmail();

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        uid,
                                        token,
                                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                                );

                        Map<String, Object> details = new HashMap<>();
                        details.put("email", email != null ? email : "");
                        details.put("name", decodedToken.getName());
                        details.put("claims", decodedToken.getClaims());
                        authentication.setDetails(details);

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.info("Firebase token verification: SUCCESS; Firebase UID: {}; SecurityContext authenticated: {}",
                                uid, SecurityContextHolder.getContext().getAuthentication() != null);
                    } catch (Exception e) {
                        log.warn("Firebase token verification failed; request remains unauthenticated: {}",
                                e.getMessage());
                        SecurityContextHolder.clearContext();
                        request.setAttribute("firebase_auth_error", e.getMessage());
                    }
                }
            } else {
                log.debug("Bearer authorization header contained an empty token");
            }
        } else if (hasAuthorizationHeader) {
            log.debug("Authorization header was present but was not a Bearer token");
        }

        filterChain.doFilter(request, response);
    }
}
