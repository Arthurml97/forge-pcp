package com.forgepcp.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.forgepcp.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    // 1 Passo: Gerar o Token, permissão, crachá
    public String generateToken(User user) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("forge-pcp-api") // Quem emitiu o token
                    .withSubject(user.getLogin()) // Quem é o usuario do token
                    .withClaim("role", user.getRole().name())
                    .withExpiresAt(genExpirationDate()) // Data de expiração do token
                    .sign(algorithm); // Assinar o token digitalmente
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar o Token", exception);
        }
    }

    // 2 Passo: Validação do Token
    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("forge-pcp-api")
                    .build()
                    .verify(token) // Caso o token seja inválido haverá um erro
                    .getSubject(); // Retorna o login do usuario
        } catch (JWTVerificationException exception) {
            return ""; // Deu token invalido
        }
    }

    private Instant genExpirationDate() {
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }
}
