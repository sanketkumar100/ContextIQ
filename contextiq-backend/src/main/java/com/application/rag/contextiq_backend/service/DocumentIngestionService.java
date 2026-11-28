package com.application.rag.contextiq_backend.service;

import com.application.rag.contextiq_backend.config.AppProperties;
import com.application.rag.contextiq_backend.entity.DocumentMetaData;
import com.application.rag.contextiq_backend.entity.DocumentStatus;
import com.application.rag.contextiq_backend.exception.DocumentProcessingException;
import com.application.rag.contextiq_backend.repository.DocumentMetaDataRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class DocumentIngestionService
{
    private final VectorStore vectorStore;
    private final DocumentMetaDataRepo documentMetaDataRepo;
    private final AppProperties appProperties;//it contains the configuration for the vector store like the index name and other properties.
    public int ingest(DocumentMetaData metaData, List<Document> parsedDocs)
    {
        log.info("Ingesting document [id={], name={}, pages={}] ", metaData.getId(), metaData.getFileName(), metaData.getFileSize());
        try {
            metaData.setStatus(DocumentStatus.PROCESSING);
            metaData.setTotalPages(parsedDocs.size());

            //1. text chunking using the TokenSplitter.

            //these properties are configured in the AppProperties class.
            TokenTextSplitter tokenTextSplitter = TokenTextSplitter.builder()
                    .withChunkSize(appProperties.getRag().getChunkSize())
                    .withMinChunkSizeChars(appProperties.getRag().getMinChunkSizeChars())
                    .withMinChunkLengthToEmbed(appProperties.getRag().getMinChunkLengthToEmbed())
                    .withMaxNumChunks(appProperties.getRag().getMaxNumChunks())
                    .withKeepSeparator(true)
                    .build();

            List<Document> chunks = tokenTextSplitter.apply(parsedDocs);
            if (chunks.isEmpty()) {
                metaData.setStatus(DocumentStatus.FAILED);
                metaData.setErrorMessage("Document appears to be empty or unscannable");
                documentMetaDataRepo.save(metaData);
                return 0;
            }


            //2. MetaData Enrichment on each chunk.
            List<Document> enrichedChunks = new ArrayList<>();
            for (int i = 0; i < chunks.size(); i++) {
                Document chunk = chunks.get(i);
                Map<String, Object> enrichedMetadata = new HashMap<>(chunk.getMetadata());
                enrichedMetadata.put("documentId", metaData.getId().toString());
                enrichedMetadata.put("fileName", metaData.getFileName());
                enrichedMetadata.put("contentType", metaData.getContentType());
                enrichedMetadata.put("chunkIndex", i);
                //adding userId to the chunks so that we can track which user uploaded.
                enrichedMetadata.put("userId", metaData.getUser().getId().toString());
                //preserve or calculate page number if available
                Object pageNumber = chunk.getMetadata().get("page_number");
                if (pageNumber == null) {
                    pageNumber = chunk.getMetadata().get("pageNumber");//if page number is not present in this form "page_number".
                }
                if (pageNumber != null) {
                    enrichedMetadata.put("pageNumber", pageNumber);
                }

                Document enrichedDoc = new Document(chunk.getText(), enrichedMetadata);
                enrichedChunks.add(enrichedDoc);

            }

            //3. Ingest or write the enriched chunks in to the pg vector database.
            log.info("Writing {} vector chunks to PgVectorStore for document: {}", enrichedChunks.size(), metaData.getFileName());
            vectorStore.add(enrichedChunks);//embeddings will be created automatically by vector store.

            //4. Update document status to Indexed
            metaData.setStatus(DocumentStatus.INDEXED);
            metaData.setTotalChunks(enrichedChunks.size());
            metaData.setErrorMessage(null);
            documentMetaDataRepo.save(metaData);
            log.info("Successfully indexed docuemnt [id={}, name={}, chunks={}]", metaData.getId(), metaData.getFileName(), enrichedChunks.size());

            return enrichedChunks.size();

        }
        catch (Exception ex)
        {
            log.error("Failed to ingest document into vector store: {}", metaData.getFileName(), ex);
            metaData.setStatus(DocumentStatus.FAILED);
            metaData.setErrorMessage(ex.getMessage());
            documentMetaDataRepo.save(metaData);
            throw new DocumentProcessingException("Failed to index document: " +ex.getMessage(), ex);


        }

    }
}
