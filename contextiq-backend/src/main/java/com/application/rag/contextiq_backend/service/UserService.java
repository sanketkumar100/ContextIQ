package com.application.rag.contextiq_backend.service;

import com.application.rag.contextiq_backend.dto.RegisterUserRequest;
import com.application.rag.contextiq_backend.dto.UserDto;
import com.application.rag.contextiq_backend.entity.Role;
import com.application.rag.contextiq_backend.entity.User;
import com.application.rag.contextiq_backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService
{
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDto registerUser(@Valid RegisterUserRequest registerUserRequest)
    {

        //validation
        if (registerUserRequest.username().isEmpty())
        {
            throw new IllegalArgumentException("Username cannot be empty");
        } else if (userRepository.existsByUsername(registerUserRequest.username())
        ) {

            throw new IllegalArgumentException("Username already exists");
        }

        //building the user entity from the request
        User user = User.builder()
                .username(registerUserRequest.username())
                .email(registerUserRequest.email())
                .password(passwordEncoder.encode(registerUserRequest.password()))
                .role(Role.USER)
                .build();

        //saving the new user to the database
        User savedUser = userRepository.save(user);

        //returning the user details as a DTO
        return UserDto.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .build();

    }
}
