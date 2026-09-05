package com.urbanfurniture.accounting.contact.dto;

import com.urbanfurniture.accounting.contact.enums.ContactType;

import java.time.LocalDateTime;

public record ContactResponse(
        Long id,
        String name,
        ContactType type,
        String email,
        String mobile,
        AddressResponse address,
        String profileImageUrl,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
