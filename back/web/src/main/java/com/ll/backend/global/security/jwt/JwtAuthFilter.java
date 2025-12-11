package com.ll.backend.global.security.jwt;

import com.ll.backend.global.security.dto.CustomUserDetails;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. 요청 URL과 헤더 로그 찍어보기 (디버깅용)
        String header = request.getHeader("Authorization");
        System.out.println("🚩 [Filter] Request: " + request.getRequestURI());
        System.out.println("🚩 [Filter] Authorization Header: " + header);

        if (isPublicEndpoint(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. 헤더 검사
        if (header != null && header.startsWith("Bearer ")) {
            String accessToken = header.substring(7);

            // 토큰 유효성 검증
            if (validateAccessToken(accessToken, response)) {
                CustomUserDetails userDetails = jwtUtil.getUserDetailsFromToken(accessToken, JwtType.ACCESS);
                setAuthentication(userDetails);
                System.out.println("✅ [Filter] 인증 객체 설정 완료: " + userDetails.getUsername());
            } else {
                System.out.println("❌ [Filter] 토큰 유효성 검증 실패");
                return; // validateAccessToken 내부에서 에러 응답을 보냈으므로 리턴
            }
        } else {
            System.out.println("⚠️ [Filter] Authorization 헤더가 없거나 Bearer 타입이 아님.");
        }

        // 3. ★★★ 핵심 수정: 토큰이 있든 없든, 다음 필터로 넘겨야 함! ★★★
        // (이 부분이 if문 안에 있으면 안 됨!)
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
            e.printStackTrace();
            writeErrorResponse(response, "ACCESS_TOKEN_EXPIRED");
        } catch (Exception e) {
            e.printStackTrace();
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
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}

