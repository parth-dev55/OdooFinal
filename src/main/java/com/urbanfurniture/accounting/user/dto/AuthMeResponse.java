package com.urbanfurniture.accounting.user.dto;

public record AuthMeResponse(
        String id,
        String firebaseUid,
        String name,
        String email,
        String role
) {
}
