package com.urbanfurniture.accounting.user.dto;

import com.urbanfurniture.accounting.user.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateProfileRequest(
        String id,
        String firebaseUid,
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 255) String email,
        Role role
) {
}
