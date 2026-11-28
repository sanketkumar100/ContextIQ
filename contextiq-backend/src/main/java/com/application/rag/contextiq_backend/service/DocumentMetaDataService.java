package com.application.rag.contextiq_backend.service;

import com.application.rag.contextiq_backend.dto.DocumentMetadataDto;
import com.application.rag.contextiq_backend.dto.DocumentResponseDto;
import com.application.rag.contextiq_backend.entity.DocumentMetaData;
import com.application.rag.contextiq_backend.entity.DocumentStatus;
import com.application.rag.contextiq_backend.entity.User;
import com.application.rag.contextiq_backend.exception.DocumentProcessingException;
import com.application.rag.contextiq_backend.exception.ResourceNotFoundException;
import com.application.rag.contextiq_backend.repository.DocumentMetaDataRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.ai.document.Document;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;


@Service
@Slf4j
@RequiredArgsConstructor
public class DocumentMetaDataService
{
    private final DocumentMetaDataRepo documentMetaDataRepo;
    private final JdbcTemplate jdbcTemplate;
    private final DocumentParserService parserService;
    private final DocumentIngestionService ingestionService;
    private final ModelMapper modelMapper;


    public DocumentResponseDto uplodadAndProcess(MultipartFile file, User user)
    {

        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String contentType = file.getContentType() !=null ? file.getContentType().toLowerCase() : "application/octet-stream";

        //creating document metadata.
        //storing the user details in the document metadata so that we can track which user uploaded which document.
        DocumentMetaData  documentMetaData= DocumentMetaData.builder()
                .fileName(fileName)
                .contentType(contentType)
                .status(DocumentStatus.UPLOADING)
                .fileSize(file.getSize())
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();

        //save the document metadata to the database
        documentMetaData = documentMetaDataRepo.save(documentMetaData);

        List<Document> parsedDocs = null;
        int chunksCreated = 0;

        try
        {
            //parsing the file to get the documents that is form spring.ai package.
            parsedDocs = parserService.parse(file);


            //ingesting the parsed documents to the vector database.
            chunksCreated = ingestionService.ingest(documentMetaData, parsedDocs);
        }
        catch (DocumentProcessingException e)
        {
            log.info("Document metadata deleting due to failed processing or ingestion.");
            documentMetaDataRepo.delete(documentMetaData);
            throw e;
        }

        //documentMetaData.setTotalChunks(chunksCreated);
        //save the document metadata to the database

        return DocumentResponseDto.builder()
                .id(documentMetaData.getId())
                .fileName(documentMetaData.getFileName())
                .fileSize(documentMetaData.getFileSize())
                .chunkCreated(chunksCreated)
                .status(documentMetaData.getStatus())
                .message("document successfully processed and indexed.")
                .userId(user.getId())
                .build();
    }

    //for processing multiple documents at once.
    public List<DocumentResponseDto> uploadMultipleDocuments(List<MultipartFile> files, User user)
    {
        List<DocumentResponseDto> responseDtos = new ArrayList<>();//we will store the response and send it to the controller.

        for (MultipartFile file : files)
        {
            DocumentResponseDto result = this.uplodadAndProcess(file, user);  //we already defined this method for the single document upload and processing.
            responseDtos.add(result);//storing the result or response in the list.

        }
        return responseDtos;
    }

    //this method returns all the document but, now as we are isolating the documents per user, this is of use. But for ADMIN it can be useful.
    public List<DocumentMetadataDto> getAllDocuments()
    {
        List<DocumentMetaData> allDocuments = documentMetaDataRepo.findAllByOrderByCreatedAtDesc();

        return allDocuments.stream()
                .map(documentMetadata -> modelMapper.map(documentMetadata, DocumentMetadataDto.class))
                .toList();

    }

    public List<DocumentMetadataDto> getAllDocumentsByUser(User user)
    {
        List<DocumentMetaData> documents = documentMetaDataRepo.findByUserOrderByCreatedAtDesc(user);

        return documents.stream()
                .map(documentMetadata -> modelMapper.map(documentMetadata, DocumentMetadataDto.class))
                .toList();
    }


    public DocumentMetadataDto getDocumentById(UUID id)
    {
        DocumentMetaData documentMetadata = documentMetaDataRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Document with given id not found !!"));

        return modelMapper.map(documentMetadata, DocumentMetadataDto.class);
    }

    //here, we will have to delete the document as well as the chunks of that document from the vector store.
    public void deleteDocument(UUID id)
    {
        //fetching the specific document.
        DocumentMetaData documentMetadata = documentMetaDataRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Document with given id not found !!"));

        //deleting the vector entries
        try
        {
            String deleteVectorSql = "DELETE FROM vector_store WHERE metadata->> 'documentId' = ?";//this query will delete all the vector entries that have the documentId in their metadata. metadata->> 'documentId' => It is the important PostgreSQL part, that assumes metadata is a JSON/JSONB column and extracts the value associated with the key 'documentId' as text.
            int deletedCount = jdbcTemplate.update(deleteVectorSql, id.toString());//deletes and returns the number of rows delted.

            log.info("Deleted {} vector chunks for documnet id {} ", deletedCount, id);

        }
        catch (Exception e)
        {
            log.warn("could not delete from the vector store directly: {}", e.getMessage());
        }

        // Delete metadata from database
        documentMetaDataRepo.delete(documentMetadata);
        log.info("Deleted document metadata for id: {}", id);
    }

    //get all vector chunks for a specific document
    public List<com.application.rag.contextiq_backend.dto.CitationDto> getDocumentChunks(UUID id)
    {
        DocumentMetaData documentMetadata = documentMetaDataRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document with given id not found !!"));

        try
        {
            String sql = "SELECT content, metadata FROM vector_store WHERE metadata->>'documentId' = ?";
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                String content = rs.getString("content");
                String metaJson = rs.getString("metadata");
                Integer chunkIndex = rowNum;
                Integer pageNumber = 1;
                Map<String, Object> map = null;
                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    map = mapper.readValue(metaJson, Map.class);
                    if (map.get("chunkIndex") instanceof Number n) {
                        chunkIndex = n.intValue();
                    }
                    if (map.get("pageNumber") instanceof Number n) {
                        pageNumber = n.intValue();
                    } else if (map.get("page_number") instanceof Number n) {
                        pageNumber = n.intValue();
                    }
                } catch (Exception ignore) {}

                return com.application.rag.contextiq_backend.dto.CitationDto.builder()
                        .documentId(id)
                        .fileName(documentMetadata.getFileName())
                        .chunkIndex(chunkIndex)
                        .pageNumber(pageNumber)
                        .snippet(content)
                        .metadata(map)
                        .build();
            }, id.toString());
        }
        catch (Exception e)
        {
            log.warn("Could not query vector_store for document chunks: {}", e.getMessage());
            return java.util.Collections.emptyList();
        }
    }
}
