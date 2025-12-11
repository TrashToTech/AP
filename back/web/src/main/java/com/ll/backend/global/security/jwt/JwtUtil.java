package com.ll.backend.global.security.jwt;

import com.ll.backend.global.security.dto.CustomUserData;
import com.ll.backend.global.security.dto.CustomUserDetails;
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

    public String generateToken(CustomUserDetails userDetails, JwtType type) {
        long now = System.currentTimeMillis();

        return Jwts.builder()
                .claims(createClaims(userDetails))
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

    public Boolean isExpired(String token, JwtType type) {
        return Jwts.parser().verifyWith(type.getKey(accessKey, refreshKey)).build().parseSignedClaims(token).getPayload().getExpiration().before(new Date());
    }

    public CustomUserDetails getUserDetailsFromToken(String token, JwtType type) {
        Claims claims = parseToken(token, type);
        String username = claims.get("username", String.class);
        // 👇 여기가 중요합니다! 토큰의 키값("role")과 정확히 일치해야 합니다.
        String role = claims.get("role", String.class);

        // 👇 로그 추가
        System.out.println("🔎 [Debug] JwtUtil - 토큰에서 꺼낸 role: " + role);
        CustomUserData userData = new CustomUserData(
                claims.get("memberId", Long.class),
                "",
                claims.get("username", String.class),
                claims.get("role", String.class),
                claims.get("nickname", String.class)
        );

        return new CustomUserDetails(userData);
    }

    private Map<String, ?> createClaims(CustomUserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("memberId", userDetails.getMemberId());
        claims.put("username", userDetails.getUsername());
        claims.put("nickname", userDetails.getNickname());
        claims.put("role", userDetails.getRole());

        return claims;
    }
}
