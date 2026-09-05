package com.urbanfurniture.accounting.user.dto;

import com.urbanfurniture.accounting.user.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Positive;

public record UpdateUserRequest(
        @Size(max = 100) @Pattern(regexp = ".*\\S.*", message = "must not be blank") String name,
        @Email @Size(max = 255) String email,
        Role role,
        Boolean active,
        @Positive Long contactId
) {
}
