package com.application.rag.contextiq_backend.controller;

import com.application.rag.contextiq_backend.dto.*;
import com.application.rag.contextiq_backend.service.RagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.converters.FileSupportConverter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import javax.annotation.processing.SupportedAnnotationTypes;
import java.time.LocalDateTime;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/chat")
@Tag(
        name = "Chat Management",
        description = "All chat APIs are here."
)
public class ChatController
{
    private final RagService ragService;
    private final FileSupportConverter fileSupportConverter;

    @PostMapping("/query")
    @Operation(
            summary = "Ask a question against all documents or a specific document with citations"
    )
    public ResponseEntity<ApiResponse<ChatResponseDto>> askQuestion(
            @Valid @RequestBody ChatRequestDto requestDto
            )
    {
        ChatResponseDto chatResponseDto = ragService.askQuestion(requestDto);
        return ResponseEntity.ok(
                ApiResponse.<ChatResponseDto>builder()
                        .success(true)
                        .message(null)
                        .data(chatResponseDto)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    //for stream processing
    @PostMapping("/stream")
    @Operation(
            summary = "Stream real-time Q&A answer tokens via Server-Sent Events (SSE)"
    )
    public Flux<String> streamQuestion(
            @Valid @RequestBody ChatRequestDto requestDto
    )
    {
        return ragService.streamQuestionAnswer(requestDto);
    }

    //for similarity search
    @PostMapping("/search/similarity")
    @Operation(
            summary = "Perform semantic similarity search on stored document vectors"
    )
    public ResponseEntity<ApiResponse<SearchResultDto>> searchSimilar(@Valid @RequestBody SearchRequestDto request)
    {
        SearchResultDto results = ragService.searchSimilarityChunks(request);

        return ResponseEntity.ok(
                ApiResponse.<SearchResultDto>builder()
                        .success(true)
                        .message(null)
                        .data(results)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}
