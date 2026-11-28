package com.application.rag.contextiq_backend.repository;

import com.application.rag.contextiq_backend.entity.Conversation;
import com.application.rag.contextiq_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, String>
{
    List<Conversation> findByUserOrderByCreatedAtDesc(User user);
    Optional<Conversation> findByIdAndUser(String id, User user);
    void deleteByIdAndUser(String id, User user);

}
