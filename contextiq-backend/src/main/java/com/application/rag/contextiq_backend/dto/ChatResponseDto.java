package com.application.rag.contextiq_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatResponseDto
{
    private String answer;
    private String conversationId;
    private List<CitationDto> citations;
    private Long responseTimeMs;

}
