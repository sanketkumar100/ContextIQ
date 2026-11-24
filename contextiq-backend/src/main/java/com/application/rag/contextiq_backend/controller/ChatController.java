package com.application.rag.contextiq_backend.controller;

import com.application.rag.contextiq_backend.dto.*;
import com.application.rag.contextiq_backend.service.RagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
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
    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(
            summary = "Stream real-time Q&A answer tokens via Server-Sent Events (SSE)"
    )
    public SseEmitter streamQuestion(
            @Valid @RequestBody ChatRequestDto requestDto,
            HttpServletResponse response
    )
    {
        // Disable proxy / servlet buffering
        response.setHeader("Cache-Control", "no-cache, no-transform");
        response.setHeader("Connection", "keep-alive");
        response.setHeader("X-Accel-Buffering", "no");

        SseEmitter emitter = new SseEmitter(180_000L); // 3 minutes timeout
        AtomicBoolean isCompleted = new AtomicBoolean(false);

        emitter.onCompletion(() -> isCompleted.set(true));
        emitter.onTimeout(() -> {
            isCompleted.set(true);
            emitter.complete();
        });
        emitter.onError((ex) -> isCompleted.set(true));

        Flux<String> flux = ragService.streamQuestionAnswer(requestDto);

        flux.subscribe(
                token -> {
                    if (token != null && !token.isEmpty() && !isCompleted.get()) {
                        try {
                            // Emit structured JSON SSE payload to preserve exact whitespace and special characters
                            emitter.send(SseEmitter.event().data(Map.of("content", token)));
                        } catch (Exception e) {
                            log.debug("Stream emitter send error or client disconnect: {}", e.getMessage());
                            isCompleted.set(true);
                            emitter.completeWithError(e);
                        }
                    }
                },
                error -> {
                    log.error("Error during streaming: ", error);
                    if (!isCompleted.get()) {
                        isCompleted.set(true);
                        emitter.completeWithError(error);
                    }
                },
                () -> {
                    if (!isCompleted.get()) {
                        try {
                            emitter.send(SseEmitter.event().data("[DONE]"));
                        } catch (Exception ignore) {}
                        isCompleted.set(true);
                        emitter.complete();
                    }
                }
        );

        return emitter;
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
