package com.application.rag.contextiq_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchRequestDto
{
    @NotBlank(message = "Query cannot be empty")
    private String query;

    private UUID documentId;

    private Integer topK;

    private Double similaritySearch;
}
