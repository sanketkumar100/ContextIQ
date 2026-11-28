package com.application.rag.contextiq_backend.dto;

public record RegisterUserRequest(
    String username,
    String email,
    String password
) {
}
