package com.application.rag.contextiq_backend.controller;


import com.application.rag.contextiq_backend.dto.ApiResponse;
import com.application.rag.contextiq_backend.dto.DocumentMetadataDto;
import com.application.rag.contextiq_backend.dto.DocumentResponseDto;
import com.application.rag.contextiq_backend.service.DocumentMetaDataService;
import com.google.protobuf.Api;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.converters.FileSupportConverter;
import org.springframework.cglib.core.Local;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/documents")
@Tag(
        name = "Document Management",
        description = "Endpoints for uploading, listening and managing documents and their vector embeddings."
)
public class DocumentController
{
    private final DocumentMetaDataService documentService;
    private final FileSupportConverter fileSupportConverter;

    //api for uploading single document.
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Upload Document",
            description = "Endpoint to upload a document. The document will be processed and stored in the system."
    )
    public ResponseEntity<ApiResponse<DocumentResponseDto>> uploadDocument(
            @RequestParam("file")MultipartFile file
            )
    {

        //processing the file
        DocumentResponseDto documentResponseDto=documentService.uplodadAndProcess(file);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<DocumentResponseDto>builder()
                        .success(true)
                        .data(documentResponseDto)
                        .timestamp(LocalDateTime.now())
                        .message("File Indexed successfully")
                        .build());
    }


    //api to upload multiple documents.
    @PostMapping(value = "/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Upload and Index multiple documents simultaneously",
            description = "This API is used for uploading and indexing multiple documents at once."
    )
    public ResponseEntity<ApiResponse<List<DocumentResponseDto>>> uploadMultiple(
            @RequestParam("files")
            List<MultipartFile> files
    )
    {
        List<DocumentResponseDto> responseDtos = documentService.uploadMultipleDocuments(files);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<List<DocumentResponseDto>> builder()
                        .message("Document uploaded successfully")
                        .success(true)
                        .timestamp(LocalDateTime.now())
                        .data(responseDtos)
                        .build()
                );
    }


    //list all uploaded documents.
    @GetMapping
    @Operation(
            summary = "List all uploaded documents and their indexing status"
    )
    public ResponseEntity<ApiResponse<List<DocumentMetadataDto>>> getAllDocuments()
    {
        List<DocumentMetadataDto> documents = documentService.getAllDocuments();

        return ResponseEntity.ok(
                ApiResponse.<List<DocumentMetadataDto>> builder()
                        .message("Retrieved all documents successfully")
                        .success(true)
                        .timestamp(LocalDateTime.now())
                        .data(documents)
                        .build()
        );
    }

    //get a specific document by id.

    @GetMapping("/{id}")
    @Operation(
            summary = "Get metadata of a specific document by ID"
    )
    public ResponseEntity<ApiResponse<DocumentMetadataDto>> getDocumentById(@PathVariable UUID id)
    {
        DocumentMetadataDto document = documentService.getDocumentById(id);

        return ResponseEntity.ok(ApiResponse.<DocumentMetadataDto> builder()
                .message("Single document is here")
                .success(true)
                .timestamp(LocalDateTime.now())
                .data(document)
                .build()
        );
    }

    //get chunks of a specific document by id.
    @GetMapping("/{id}/chunks")
    @Operation(summary = "Get all vector chunks for a specific document")
    public ResponseEntity<ApiResponse<List<com.application.rag.contextiq_backend.dto.CitationDto>>> getDocumentChunks(@PathVariable UUID id)
    {
        List<com.application.rag.contextiq_backend.dto.CitationDto> chunks = documentService.getDocumentChunks(id);

        return ResponseEntity.ok(
                ApiResponse.<List<com.application.rag.contextiq_backend.dto.CitationDto>> builder()
                        .message("Retrieved document chunks successfully")
                        .success(true)
                        .timestamp(LocalDateTime.now())
                        .data(chunks)
                        .build()
        );
    }

    //delete a specific document by id.
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a document and purge its vector embeddings from vector store")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable UUID id)
    {
        documentService.deleteDocument(id);

        return ResponseEntity.ok(
                ApiResponse.<Void> builder()
                        .message("Document deleted successfully")
                        .success(true)
                        .timestamp(LocalDateTime.now())
                        .data(null)
                        .build()
        );

    }

}
