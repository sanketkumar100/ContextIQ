package com.application.rag.contextiq_backend.service;


import com.application.rag.contextiq_backend.config.AppProperties;
import com.application.rag.contextiq_backend.dto.*;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.Filter;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Slf4j
@Service
public class RagService
{
    private final VectorStore vectorStore;
    private final AppProperties appProperties;
    private final ChatClient chatClient;


    //to ask anything related to the document.
    public ChatResponseDto askQuestion(ChatRequestDto request)
    {
        long startTime = System.currentTimeMillis();
        log.info("Processing query: '{}', scoped documentId: {}, useDocuments: {}", request.getQuestion(), request.getDocumentId(), request.getUseDocuments());

        List<Document> similarDocuments = Boolean.FALSE.equals(request.getUseDocuments())
                ? Collections.emptyList()
                : this.retrieveRelevantDocuments(
                        request.getQuestion(),
                        request.getDocumentId(),
                        request.getTopK(),
                        request.getMinSimilarity()
                );//getting similar documents.


        //converting the similar documents to citation dtos.
        List<CitationDto> citationDtos = similarDocuments.stream()
                .map(this::mapToCitation)
                .toList();
        //now sending the context to the LLM for generating the answer.

        //build context
        String contextText = buildContextString(similarDocuments);

        //build prompt
        String prompt = buildPrompt(request.getQuestion(), contextText);

        //send to LLM
        String answer = this.chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();
        long responseTime = System.currentTimeMillis() -startTime;
        log.info("Completed Q&A in {} ms with {} citations", responseTime, citationDtos.size());

        //building the response dto
        return ChatResponseDto.builder()
                .answer(answer)
                .conversationId(request.getConversationId() != null? request.getConversationId() : UUID.randomUUID().toString())
                .citations(citationDtos)
                .responseTimeMs(responseTime)
                .build();


    }


    //this is for stream processing of the question and answer.
    public Flux<String> streamQuestionAnswer(ChatRequestDto requestDto)
    {
        log.info("Streaming query: '{}', useDocuments: {}", requestDto.getQuestion(), requestDto.getUseDocuments());

        List<Document> relevantDocuments = Boolean.FALSE.equals(requestDto.getUseDocuments())
                ? Collections.emptyList()
                : retrieveRelevantDocuments(
                        requestDto.getQuestion(),
                        requestDto.getDocumentId(),
                        requestDto.getTopK(),
                        requestDto.getMinSimilarity()
                );

        //building the context and prompt for the LLM
        String contextText = buildContextString(relevantDocuments);
        String userPrompt = buildPrompt(requestDto.getQuestion(), contextText);

        //streaming the response from the LLM
        return chatClient
                .prompt()
                .user(userPrompt)
                .stream()
                .content();
    }



    private String buildPrompt(@NotBlank(message = "Question cannot be empty") String question, String contextText)
    {
        if (contextText != null && !contextText.isBlank())
        {
            return String.format("""
                           Document Context:
                           ---------------------
                           %s
                           ---------------------                                        
                           User Message / Question: %s             
                           Instructions:
                           - If the user's question relates to the document context above, prioritize answering using that context and reference key sections.
                           - If the user is asking a general question, greeting, or discussing topics beyond the document context, respond helpfully and conversationally using your general knowledge while weaving in relevant document context if applicable
                    
                    """, contextText, question);
        }
        else
        {
            return String.format("""
                       User Message / Question:
                       %s                         
                       Instructions:
                          - Respond helpfully, accurately, and conversationally to the user's message using your broad knowledge base.
                    
                    """, question);
        }

    }

    private String buildContextString(List<Document> similarDocuments)
    {
        if (similarDocuments == null || similarDocuments.isEmpty())
        {
            return "";  //if no similar documents, return empty context
        }

        return similarDocuments.stream()
                .map(doc -> {
                    String fileName = (String) doc.getMetadata().getOrDefault("fileName", "Unknown File");
                    Object page = doc.getMetadata().getOrDefault("pageNumber", "N/A");
                    return String.format("[Source: %s | Page: %s]\n%s", fileName, page, doc.getText());
                })
                .collect(Collectors.joining("\n\n---\n\n"));  //separating each document with a line for clarity.

    }

    public SearchResultDto searchSimilarityChunks(SearchRequestDto request)
    {
        double effectiveSimilarity = (request.getSimilaritySearch() != null && request.getSimilaritySearch() > 0.0)
                ? request.getSimilaritySearch()
                : (appProperties.getRag().getSimilarityThreshold() > 0.0 ? appProperties.getRag().getSimilarityThreshold() : 0.60);

        List<Document> matchedDocs = retrieveRelevantDocuments(
                request.getQuery(),
                request.getDocumentId(),
                request.getTopK(),
                effectiveSimilarity
        );

        List<CitationDto> citations = matchedDocs.stream()
                .map(this::mapToCitation)
                .filter(c -> c.getSimilarityScore() == null || c.getSimilarityScore() >= effectiveSimilarity)
                .toList();

        return SearchResultDto.builder()
                .query(request.getQuery())
                .totalMatches(citations.size())
                .matches(citations)
                .build();
    }

    private CitationDto mapToCitation(Document document)
    {
        //we can use model mapper here too.

        Map<String, Object> meta=document.getMetadata();
        UUID docId=null;

        if (meta.get("documentId")!=null)
        {
            try {
                docId = UUID.fromString(meta.get("documentId").toString());
            }
            catch (Exception ignore)
            {

            }
        }

        //for chunk
        Integer chunkIndex=null;
        if (meta.get("chunkIndex") instanceof Number n)
        {
            chunkIndex=n.intValue();
        }
        //fro page number
        Integer pageNumber=null;
        if (meta.get("pageNumber") instanceof Number n)
        {
            pageNumber=n.intValue();
        }
        else if (meta.get("page_number") instanceof Number n)
        {
            pageNumber=n.intValue();
        }
        //for score
        Double score = null;
        try {
            score = document.getScore();
        } catch (Throwable ignore) {}
        if (score == null && meta.get("distance") instanceof Number n)
        {
            score=1.0 - n.doubleValue();
        }
        else if (score == null && meta.get("score") instanceof Number n)
        {
            score = n.doubleValue();
        }
        else if (score == null && meta.get("similarity") instanceof Number n)
        {
            score = n.doubleValue();
        }

        return CitationDto.builder()
                .documentId(docId)
                .fileName((String) meta.getOrDefault("fileName", "Unknown"))
                .chunkIndex(chunkIndex)
                .pageNumber(pageNumber)
                .snippet(document.getText())
                .similarityScore(score)
                .metadata(meta)
                .build();

    }

    private List<Document> retrieveRelevantDocuments(@NotBlank(message = "Query cannot be empty") String query, UUID documentId, Integer topK, Double similaritySearch)
    {
        int effectiveTopK = (topK!=null && topK>0) ? topK : appProperties.getRag().getTopK();
        double effectiveSimilarity = (similaritySearch !=null && similaritySearch > 0.0) 
                ? similaritySearch 
                : (appProperties.getRag().getSimilarityThreshold() > 0.0 ? appProperties.getRag().getSimilarityThreshold() : 0.60);

        SearchRequest.Builder searchRequestBuilder = SearchRequest
                .builder()
                .query(query)
                .topK(effectiveTopK)
                .similarityThreshold(effectiveSimilarity);

        //if documentId is provided, we will filter the search results to only include chunks from that specific document, otherwise, we will search across all documents in the vector store.
        if (documentId!=null)
        {
            log.info("Filtering from document: {}", documentId);
            FilterExpressionBuilder b= new FilterExpressionBuilder();
            Filter.Expression documentId1 = b.eq("documentId", documentId.toString()).build();
            searchRequestBuilder.filterExpression(documentId1);
        }

        try
        {
            List<Document> documents = vectorStore.similaritySearch(searchRequestBuilder.build());
            log.info("Retrived {} chunks for query: '{}' (scoped docId: {}, threshold: {})", 
                    documents.size(), query, documentId, effectiveSimilarity);

            return documents;
        }
        catch (Exception e)
        {
            log.error("Similarity search failed for query: '{}'", query, e);
            return Collections.emptyList();
        }
    }

}
