package com.application.rag.contextiq_backend.repository;

import com.application.rag.contextiq_backend.entity.DocumentMetaData;
import com.application.rag.contextiq_backend.entity.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DocumentMetaDataRepo extends JpaRepository<DocumentMetaData, UUID>
{

    List<DocumentMetaData> findByStatus(DocumentStatus status);
    List<DocumentMetaData> findAllByOrderByCreatedAtDesc();
}
