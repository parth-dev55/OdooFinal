package com.urbanfurniture.accounting.contact.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AddressRequest(
        @Size(max = 255) @Pattern(regexp = "^$|.*\\S.*", message = "must not be blank") String addressLine,
        @Size(max = 100) @Pattern(regexp = "^$|.*\\S.*", message = "must not be blank") String city,
        @Size(max = 100) @Pattern(regexp = "^$|.*\\S.*", message = "must not be blank") String state,
        @Size(max = 20) @Pattern(regexp = "^$|[A-Za-z0-9 -]+", message = "contains invalid characters") String pincode
) {
}
