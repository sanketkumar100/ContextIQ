package com.application.rag.contextiq_backend.dto;

import com.application.rag.contextiq_backend.entity.DocumentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DocumentMetadataDto
{
    private UUID id;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private Integer totalPages;
    private Integer totalChunks;
    private DocumentStatus status;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
