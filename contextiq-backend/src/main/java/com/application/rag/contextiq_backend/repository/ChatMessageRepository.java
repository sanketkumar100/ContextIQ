package com.application.rag.contextiq_backend.repository;

import com.application.rag.contextiq_backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long>
{
    List<ChatMessage> findByConversation_IdOrderByCreatedAtAsc(String conversationId);

    // Native SQL query to get the last N messages for a given conversationId
    @Query(value = "SELECT * FROM chat_messages WHERE conversation_id = :conversationId ORDER BY created_at DESC LIMIT :lastN", nativeQuery = true)
    List<ChatMessage> findLastNMessages(@Param("conversationId") String conversationId, @Param("lastN") int lastN);

    void deleteByConversation_Id(String conversationId);
}
