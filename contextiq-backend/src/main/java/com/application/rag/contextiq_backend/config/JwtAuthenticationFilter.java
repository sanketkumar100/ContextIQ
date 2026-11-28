package com.application.rag.contextiq_backend.config;

import com.application.rag.contextiq_backend.repository.UserRepository;
import com.application.rag.contextiq_backend.service.CustomUserDetail;
import com.application.rag.contextiq_backend.service.CustomUserDetailService;
import com.application.rag.contextiq_backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter
{
    private final JwtService jwtService;

    private final CustomUserDetailService userDetailService;

    private final UserRepository userRepository;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException
    {
        //logic for the validation and other stuff.

        //extracting the header from the request
        String authHeader = request.getHeader("Authorization");

        //checking if the header is null or not
        if (authHeader == null || !authHeader.startsWith("Bearer "))
        {
            filterChain.doFilter(request, response);//forwarding the request to the next filter in the chain.
            return;
        }

        //extracting the token from the header, that is after the "Bearer " prefix.
        String token = authHeader.substring(7);

        String username;

        try
        {
            username = jwtService.extractUsername(token);//in our logic the token will be validated while extracting the username, if the token is invalid then it will throw an exception.
            if (username == null || !jwtService.isTokenValid(token, userDetailService.loadUserByUsername(username)))
            {
                filterChain.doFilter(request, response);
                return;
            }

            //loading the user from the database and setting the authentication in the security context.
            var user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
            var authentication = new UsernamePasswordAuthenticationToken(user, null, new CustomUserDetail(user).getAuthorities());

            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);

        }
        catch (Exception e)
        {
            filterChain.doFilter(request, response);
            e.printStackTrace();;
            return;
        }




        filterChain.doFilter(request, response);
    }
}
