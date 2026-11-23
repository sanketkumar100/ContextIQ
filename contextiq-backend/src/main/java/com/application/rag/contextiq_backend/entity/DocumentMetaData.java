package com.application.rag.contextiq_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "document_metadata")
public class DocumentMetaData
{

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String fileName;


    @Column(nullable = false)
    private String contentType;
    private Long fileSize;
    private Integer totalPages;
    private Integer totalChunks;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentStatus status;


    @Column(length = 1000)
    private String errorMessage;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
