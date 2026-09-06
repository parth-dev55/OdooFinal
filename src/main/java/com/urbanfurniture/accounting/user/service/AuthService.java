package com.urbanfurniture.accounting.user.service;

import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import com.urbanfurniture.accounting.common.exception.DuplicateResourceException;
import com.urbanfurniture.accounting.user.dto.AuthMeResponse;
import com.urbanfurniture.accounting.user.dto.CreateProfileRequest;
import com.urbanfurniture.accounting.user.entity.User;
import com.urbanfurniture.accounting.user.enums.Role;
import com.urbanfurniture.accounting.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.urbanfurniture.accounting.config.JwtService;
import com.urbanfurniture.accounting.user.dto.LoginRequest;
import com.urbanfurniture.accounting.user.dto.LoginResponse;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Locale;
import java.util.Optional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository) {
        this(userRepository, null, null, null);
    }

    @Autowired
    public AuthService(UserRepository userRepository,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public LoginResponse register(com.urbanfurniture.accounting.user.dto.RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.CUSTOMER);
        user.setActive(true);
        User saved = userRepository.save(user);

        UserDetails details = org.springframework.security.core.userdetails.User
                .withUsername(saved.getEmail())
                .password(saved.getPassword())
                .roles(saved.getRole().name())
                .build();
        String token = jwtService.generateToken(details, saved.getId(), saved.getRole().name());
        return new LoginResponse(token, "Bearer", toAuthResponse(saved));
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(Locale.ROOT), request.password()));
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid credentials"));
        UserDetails details = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
        String token = jwtService.generateToken(details, user.getId(), user.getRole().name());
        return new LoginResponse(token, "Bearer", toAuthResponse(user));
    }

    @Transactional(readOnly = true)
    public AuthMeResponse getProfile(String firebaseUid) {
        if (firebaseUid == null || firebaseUid.isBlank()) {
            throw new ResourceNotFoundException("Invalid authentication credentials");
        }

        Optional<User> userByUid = userRepository.findByFirebaseUid(firebaseUid);
        if (userByUid.isEmpty()) {
            userByUid = userRepository.findByEmailIgnoreCase(firebaseUid);
        }
        log.info("MySQL user found for Firebase UID {}: {}", firebaseUid, userByUid.isPresent());
        User user = userByUid
                .orElseThrow(() -> new ResourceNotFoundException("No application profile found for this user"));

        if (!user.isActive()) {
            throw new ResourceNotFoundException("User account is deactivated");
        }

        return toAuthResponse(user);
    }

    @Transactional
    public AuthMeResponse createOrLinkProfile(String firebaseUid, CreateProfileRequest request) {
        if (firebaseUid == null || firebaseUid.isBlank()) {
            throw new ResourceNotFoundException("Invalid authentication credentials");
        }

        // 1. If user already linked to this firebaseUid, return existing
        Optional<User> existingByUid = userRepository.findByFirebaseUid(firebaseUid);
        if (existingByUid.isPresent()) {
            return toAuthResponse(existingByUid.get());
        }

        String normalizedEmail = request.email() != null ? request.email().trim().toLowerCase(Locale.ROOT) : "";

        // 2. Check if user exists by email (e.g. created by admin before first login)
        if (!normalizedEmail.isBlank()) {
            Optional<User> existingByEmail = userRepository.findByEmailIgnoreCase(normalizedEmail);
            if (existingByEmail.isPresent()) {
                User user = existingByEmail.get();
                user.setFirebaseUid(firebaseUid);
                return toAuthResponse(userRepository.save(user));
            }
        }

        // 3. Create new user with safe default role CONTACT (never ADMIN)
        User user = new User();
        user.setName(request.name() != null ? request.name().trim() : "User");
        user.setEmail(normalizedEmail);
        user.setFirebaseUid(firebaseUid);
        Role assignedRole = (request.role() != null && request.role() != Role.ADMIN)
                ? request.role()
                : Role.CONTACT;
        user.setRole(assignedRole);
        user.setActive(true);

        return toAuthResponse(userRepository.save(user));
    }

    private AuthMeResponse toAuthResponse(User user) {
        return new AuthMeResponse(
                String.valueOf(user.getId()),
                user.getFirebaseUid(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
