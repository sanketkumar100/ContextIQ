package com.application.rag.contextiq_backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService
{

    @Value("${spring.jwt.secret}")
    private String secret;

    @Value("${spring.jwt.expiration}")
    private long expiration;

    private SecretKey getSigningKey()
    {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(UserDetails userDetails)
    {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    //extracting the claims from the token, by using this we can get the user details.
    public Claims getPayload(String token)
    {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    //extracting all the details from the token
    public String extractUsername(String token)
    {
        return this.getPayload(token).getSubject();
    }

    //checking if the token is expired or not
    public boolean isTokenExpired(String token)
    {
        return this.getPayload(token).getExpiration().before(new Date());
    }

    //getting the issuer from the token, this is useful to know who issued the token.
    public String getIssuer(String token)
    {
        return this.getPayload(token).getIssuer();
    }

    public boolean isTokenValid(String token, UserDetails userDetails)
    {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }
}
