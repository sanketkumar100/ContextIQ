package com.application.rag.contextiq_backend.repository;

import com.application.rag.contextiq_backend.entity.User;
import org.apache.xmlbeans.impl.xb.xsdschema.Attribute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>
{
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
}
