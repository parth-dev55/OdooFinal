package com.urbanfurniture.accounting.user.service;

import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
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

import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AuthMeResponse getProfile(String firebaseUid) {
        if (firebaseUid == null || firebaseUid.isBlank()) {
            throw new ResourceNotFoundException("Invalid authentication credentials");
        }

        Optional<User> userByUid = userRepository.findByFirebaseUid(firebaseUid);
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
