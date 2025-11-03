package com.ll.backend.global.security.jwt;

import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;

public enum JwtType {
    ACCESS,
    REFRESH;

    public SecretKey getKey(String accessKey, String refreshKey) {
        return this == ACCESS
                ? Keys.hmacShaKeyFor(accessKey.getBytes())
                : Keys.hmacShaKeyFor(refreshKey.getBytes());
    }

    public long getExpiration(long accessExpiration, long refreshExpiration) {
        return this == ACCESS
                ? accessExpiration
                : refreshExpiration;
    }
}
