 package com.urbanfurniture.accounting.auth.controller;

import com.urbanfurniture.accounting.auth.dto.CreateProfileRequest;
import com.urbanfurniture.accounting.auth.service.AuthService;
import com.urbanfurniture.accounting.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @GetMapping("/me")
    public UserResponse currentUser(Authentication authentication) {
        return authService.currentUser(authentication.getName());
    }

    @PostMapping("/profile")
    public UserResponse createProfile(
            Authentication authentication,
            @Valid @RequestBody CreateProfileRequest request) {
        return authService.createOrUpdateProfile(authentication.getName(), request.name(), request.email());
    }
}
