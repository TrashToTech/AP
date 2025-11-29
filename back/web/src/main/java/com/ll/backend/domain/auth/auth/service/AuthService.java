package com.ll.backend.domain.auth.auth.service;

import com.ll.backend.domain.auth.auth.dto.TokenInfo;
import com.ll.backend.global.exception.GlobalErrorCode;
import com.ll.backend.global.exception.GlobalException;
import com.ll.backend.global.redis.repository.RedisRepository;
import com.ll.backend.global.security.dto.CustomUserDetails;
import com.ll.backend.global.security.jwt.JwtType;
import com.ll.backend.global.security.jwt.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class AuthService {

    private static final long REFRESH_EXPIRATION = 86400000L; // 1 day
    private static final String REFRESH_COOKIE_NAME = "refreshToken";
    private static final String REDIS_REFRESH_PREFIX = "REFRESH_TOKEN:";

    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final RedisRepository redisRepository;

    public AuthService(JwtUtil jwtUtil, AuthenticationManager authenticationManager, RedisRepository redisRepository) {
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.redisRepository = redisRepository;
    }

    /**
     * 로그인 처리
     */
    public TokenInfo login(String username, String password, HttpServletResponse response) {
        Authentication authentication = authenticate(username, password);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        TokenInfo tokenInfo = generateTokenInfo(userDetails);
        redisRepository.save(REDIS_REFRESH_PREFIX + userDetails.getMemberId(), tokenInfo.getRefreshToken(), REFRESH_EXPIRATION);

        addTokensToResponse(response, tokenInfo);

        return tokenInfo;
    }

    /**
     * 토큰 재발급
     */
    public void reIssue(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractRefreshToken(request.getCookies());

        if (jwtUtil.isExpired(refreshToken, JwtType.REFRESH)) {
            throw new GlobalException(GlobalErrorCode.EXPIRATION_REFRESHTOKEN);
        }

        CustomUserDetails userDetails = jwtUtil.getUserDetailsFromToken(refreshToken, JwtType.REFRESH);
        verifyRefreshTokenWithRedis(userDetails.getMemberId(), refreshToken);

        TokenInfo newTokenInfo = generateTokenInfo(userDetails);
        redisRepository.modify(REDIS_REFRESH_PREFIX + userDetails.getMemberId(), refreshToken);

        addTokensToResponse(response, newTokenInfo);
    }

    // ================== Private Helper Methods ==================

    private Authentication authenticate(String username, String password) {
        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(username, password)
                );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return authentication;
    }

    private TokenInfo generateTokenInfo(CustomUserDetails userDetails) {
        String accessToken = jwtUtil.generateToken(userDetails, JwtType.ACCESS);
        String refreshToken = jwtUtil.generateToken(userDetails, JwtType.REFRESH);
        return new TokenInfo(accessToken, refreshToken);
    }

    private void addTokensToResponse(HttpServletResponse response, TokenInfo tokenInfo) {
        response.addHeader("Set-Cookie", createRefreshCookie(tokenInfo.getRefreshToken()).toString());
    }

    private String extractRefreshToken(Cookie[] cookies) {
        if (cookies == null) {
            throw new GlobalException(GlobalErrorCode.NOT_FOUND_REFRESHTOKEN);
        }

        return Arrays.stream(cookies)
                .filter(cookie -> cookie.getName().equals(REFRESH_COOKIE_NAME))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(() -> new GlobalException(GlobalErrorCode.NOT_FOUND_REFRESHTOKEN));
    }

    private void verifyRefreshTokenWithRedis(Long memberId, String requestToken) {
        String redisToken = redisRepository.get(REDIS_REFRESH_PREFIX + memberId);
        if (redisToken == null) {
            throw new GlobalException(GlobalErrorCode.INVALID_SESSTION);
        }

        if (!redisToken.equals(requestToken)) {
            throw new GlobalException(GlobalErrorCode.INVALID_TOKEN);
        }
    }

    private ResponseCookie createRefreshCookie(String refreshToken) {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, refreshToken)
                .path("/")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .build();
    }
}