package com.application.rag.contextiq_backend.dto;

import com.application.rag.contextiq_backend.entity.Role;
import lombok.Builder;

@Builder
public record UserDto(
    Long id,
    String username,
    String email,
    Role role
) {
}
