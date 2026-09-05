package com.urbanfurniture.accounting.user.dto;

import com.urbanfurniture.accounting.user.enums.Role;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role,
        boolean active,
        String firebaseUid,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
