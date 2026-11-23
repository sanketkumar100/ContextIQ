package com.application.rag.contextiq_backend.dto;

import com.application.rag.contextiq_backend.entity.DocumentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class DocumentResponseDto
{

    private UUID id;
    private String fileName;
    private Long fileSize;
    private DocumentStatus status;
    private Integer chunkCreated;
    private String message;

}
