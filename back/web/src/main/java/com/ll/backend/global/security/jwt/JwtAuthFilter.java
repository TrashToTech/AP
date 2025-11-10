package com.ll.backend.global.security.jwt;

import com.ll.backend.domain.member.member.entity.Member;
import com.ll.backend.global.exception.GlobalErrorCode;
import com.ll.backend.global.exception.GlobalException;
import com.ll.backend.global.redis.RedisRepository;
import com.ll.backend.global.security.dto.CustomUserData;
import com.ll.backend.global.security.dto.CustomUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;


/**
 * sequenceDiagram
 * participant Client
 * participant Server
 * participant Redis
 * <p>
 * Client->>Server: 만료된 Access Token
 * Server->>Redis: 기존 Refresh Token 유효성 확인
 * Redis-->>Server: 유효 여부 응답
 * Server->>Server: 새 토큰 쌍 생성
 * Server->>Redis: 기존 Refresh Token 무효화
 * Server->>Redis: 새 Refresh Token 저장
 * Server-->>Client: 새 Access Token + Refresh Token
 *
 * @author user
 * @since 25. 4. 29.
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String ACCESS_TOKEN_HEADER = "accessToken";
    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (isPublicEndpoint(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String accessToken = request.getHeader(ACCESS_TOKEN_HEADER);

        if (!validateAccessToken(accessToken, response)) {
            return;
        }

        CustomUserDetails userDetails = jwtUtil.getUserDetailsFromToken(accessToken, JwtType.ACCESS);
        setAuthentication(userDetails);

        filterChain.doFilter(request, response);
    }

    /**
     * AccessToken 유효성 검증
     */
    private boolean validateAccessToken(String token, HttpServletResponse response) throws IOException {
        if (token == null) {
            writeErrorResponse(response, "ACCESS_TOKEN_NULL");
            return false;
        }

        try {
            jwtUtil.parseToken(token, JwtType.ACCESS);
            return true;
        } catch (ExpiredJwtException e) {
            writeErrorResponse(response, "ACCESS_TOKEN_EXPIRED");
        } catch (Exception e) {
            writeErrorResponse(response, "INVALID_ACCESS_TOKEN");
        }

        return false;
    }

    /**
     * SecurityContext 에 인증 정보 저장
     */
    private void setAuthentication(CustomUserDetails userDetails) {

        Authentication authToken =
                new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );

        SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    /**
     * Public Endpoint 여부 판단
     */
    private boolean isPublicEndpoint(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/v3/api-docs") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/api/member") ||
                path.startsWith("/api/auth") ||
                path.startsWith("/h2-console") ||
                path.equals("/");
    }

    /**
     * 에러 응답 공통 처리
     */
    private void writeErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write(message);
    }
}

