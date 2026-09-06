package com.urbanfurniture.accounting.user.dto;

public record LoginResponse(
        String token,
        String type,
        AuthMeResponse user) {
}
