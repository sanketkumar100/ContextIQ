package com.application.rag.contextiq_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequestDto
{
    @NotBlank(message = "Question cannot be empty")
    private String question;

    private UUID documentId;

    private Integer topK;

    private Double minSimilarity;

    private String conversationId;

    @Builder.Default
    private Boolean useDocuments = true;
}
