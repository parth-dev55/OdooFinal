package com.urbanfurniture.accounting.auth.service;

import com.urbanfurniture.accounting.common.exception.DuplicateResourceException;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import com.urbanfurniture.accounting.user.dto.UserResponse;
import com.urbanfurniture.accounting.user.entity.User;
import com.urbanfurniture.accounting.user.enums.Role;
import com.urbanfurniture.accounting.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;

    @Transactional(readOnly = true)
    public UserResponse currentUser(String firebaseUid) {
        return toResponse(users.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new ResourceNotFoundException("User profile was not found")));
    }

    @Transactional
    public UserResponse createOrUpdateProfile(String firebaseUid, String name, String email) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        User user = users.findByFirebaseUid(firebaseUid).orElseGet(User::new);
        if (user.getId() == null) {
            users.findByEmailIgnoreCase(normalizedEmail).ifPresent(existing -> {
                throw new DuplicateResourceException("Email is already associated with another profile");
            });
            user.setFirebaseUid(firebaseUid);
            user.setRole(Role.CONTACT_USER);
            user.setActive(true);
        } else if (!user.getEmail().equalsIgnoreCase(normalizedEmail)
                && users.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new DuplicateResourceException("Email is already associated with another profile");
        }
        user.setName(name.trim());
        user.setEmail(normalizedEmail);
        return toResponse(users.save(user));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(),
                user.isActive(), user.getFirebaseUid(),
                user.getContact() == null ? null : user.getContact().getId(),
                user.getCreatedAt(), user.getUpdatedAt());
    }
}
