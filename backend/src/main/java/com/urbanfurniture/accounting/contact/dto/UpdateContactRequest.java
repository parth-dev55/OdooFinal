package com.urbanfurniture.accounting.contact.dto;

import com.urbanfurniture.accounting.contact.enums.ContactType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateContactRequest(
        @Size(max = 100) @Pattern(regexp = ".*\\S.*", message = "must not be blank") String name,
        ContactType type,
        @Email @Size(max = 255) String email,
        @Size(max = 25) @Pattern(regexp = "^$|[0-9+(). -]{7,25}", message = "must be a valid phone number") String mobile,
        @Valid AddressRequest address,
        @Size(max = 2048) String profileImageUrl,
        Boolean active
) {
}
