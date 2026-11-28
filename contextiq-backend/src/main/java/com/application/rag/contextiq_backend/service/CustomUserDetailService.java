package com.application.rag.contextiq_backend.service;

import com.application.rag.contextiq_backend.entity.User;
import com.application.rag.contextiq_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService
{
    private final UserRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException
    {
        // TODO: Implement the logic to load user by username

        Optional<User> user = userRepository.findByUsername(username);

        return new CustomUserDetail(
                user.orElseThrow(() -> new UsernameNotFoundException("Invalid username or password")));
    }
}
