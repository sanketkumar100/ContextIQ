package com.application.rag.contextiq_backend.dto;

import lombok.Builder;
import lombok.Data;

@Builder
public record LoginResponse(
    String accessToken,
    UserDto user
) {
}
