package com.application.rag.contextiq_backend.controller;

import com.application.rag.contextiq_backend.dto.LoginRequest;
import com.application.rag.contextiq_backend.dto.LoginResponse;
import com.application.rag.contextiq_backend.dto.RegisterUserRequest;
import com.application.rag.contextiq_backend.dto.UserDto;
import com.application.rag.contextiq_backend.entity.User;
import com.application.rag.contextiq_backend.repository.UserRepository;
import com.application.rag.contextiq_backend.service.CustomUserDetail;
import com.application.rag.contextiq_backend.service.JwtService;
import com.application.rag.contextiq_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/auth")
public class AuthContoller
{
    private final UserService userService;

    private final AuthenticationManager authenticationManager;

    private final UserRepository userRepository;

    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest)
    {
        // ToDO: Authenticate and return the token and user details

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                loginRequest.username(),
                loginRequest.password()
        );

        Authentication authenticated = authenticationManager.authenticate(authentication);

        //getting the user details from the database
        User user = userRepository.findByUsername(loginRequest.username()).orElseThrow(() -> new RuntimeException("User not found"));
        //creating the jwt token
        String token = jwtService.generateToken(new CustomUserDetail(user));

        var response = LoginResponse.builder()
                .accessToken(token)
                .user(UserDto.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .build();

        return ResponseEntity.ok(response);
    }


    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterUserRequest registerUserRequest)
    {
        UserDto userDto = userService.registerUser(registerUserRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(userDto);
    }

}
