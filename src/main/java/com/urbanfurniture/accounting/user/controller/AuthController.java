package com.urbanfurniture.accounting.user.controller;

import com.urbanfurniture.accounting.user.dto.AuthMeResponse;
import com.urbanfurniture.accounting.user.dto.CreateProfileRequest;
import com.urbanfurniture.accounting.user.dto.LoginRequest;
import com.urbanfurniture.accounting.user.dto.LoginResponse;
import com.urbanfurniture.accounting.user.dto.RegisterRequest;
import com.urbanfurniture.accounting.user.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthMeResponse> me(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            log.warn("GET /api/auth/me reached without an authenticated principal");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(authService.getProfile(authentication.getName()));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/profile")
    public ResponseEntity<AuthMeResponse> createProfile(
            Authentication authentication,
            @Valid @RequestBody CreateProfileRequest request) {
        if (authentication == null || authentication.getPrincipal() == null) {
            log.warn("POST /api/auth/profile reached without an authenticated principal");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String identity = authentication.getName();
        return ResponseEntity.ok(authService.createOrLinkProfile(identity, request));
    }
}
