package com.application.rag.contextiq_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResultDto
{
    private String query;
    private int totalMatches;

    private List<CitationDto> matches;
}
