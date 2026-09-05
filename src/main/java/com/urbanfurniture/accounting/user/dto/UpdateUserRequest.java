package com.urbanfurniture.accounting.user.dto;

import com.urbanfurniture.accounting.user.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(max = 100) @Pattern(regexp = ".*\\S.*", message = "must not be blank") String name,
        @Email @Size(max = 255) String email,
        Role role,
        Boolean active,
        String firebaseUid
) {
    public UpdateUserRequest(String name, String email, Role role, Boolean active) {
        this(name, email, role, active, null);
    }
}
