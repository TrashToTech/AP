package com.ll.backend.global.security.jwt;

import com.ll.backend.domain.member.member.entity.Member;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${custom.jwt.access}")
    private String accessKey;

    @Value("${custom.jwt.refresh}")
    private String refreshKey;

    @Value("${security.time.access}")
    private Long accessExpiration;

    @Value("${security.time.refresh}")
    private Long refreshExpiration;

    public String generateToken(Member member, JwtType type) {
        long now = System.currentTimeMillis();

        return Jwts.builder()
                .claims(createClaims(member))
                .issuedAt(new Date(now))
                .expiration(new Date(now + type.getExpiration(accessExpiration, refreshExpiration)))
                .signWith(type.getKey(accessKey, refreshKey))
                .compact();
    }

    public boolean validateToken(String token, JwtType type) {
        try {
            parseToken(token, type);

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Claims parseToken(String token, JwtType type) {
        return Jwts.parser()
                .verifyWith(type.getKey(accessKey, refreshKey))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUsername(String token, JwtType type) {
        return Jwts.parser().verifyWith(type.getKey(accessKey, refreshKey)).build().parseSignedClaims(token).getPayload().get("username", String.class);
    }

    public String getNickname(String token, JwtType type) {
        return Jwts.parser().verifyWith(type.getKey(accessKey, refreshKey)).build().parseSignedClaims(token).getPayload().get("nickname", String.class);
    }

    public String getRole(String token, JwtType type) {
        return Jwts.parser().verifyWith(type.getKey(accessKey, refreshKey)).build().parseSignedClaims(token).getPayload().get("role", String.class);
    }

    public Long getMemberId(String token, JwtType type) {
        return Jwts.parser().verifyWith(type.getKey(accessKey, refreshKey)).build().parseSignedClaims(token).getPayload().get("memberId", Long.class);
    }

    private Map<String, ?> createClaims(Member member) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", member.getUsername());
        claims.put("memberId", member.getId());
        claims.put("nickname", member.getNickname());
        claims.put("role", member.getRole());

        return claims;
    }
}
