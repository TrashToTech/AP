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
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;


/**
 * sequenceDiagram
 *     participant Client
 *     participant Server
 *     participant Redis
 *
 *     Client->>Server: 만료된 Access Token
 *     Server->>Redis: 기존 Refresh Token 유효성 확인
 *     Redis-->>Server: 유효 여부 응답
 *     Server->>Server: 새 토큰 쌍 생성
 *     Server->>Redis: 기존 Refresh Token 무효화
 *     Server->>Redis: 새 Refresh Token 저장
 *     Server-->>Client: 새 Access Token + Refresh Token
 *
 * @author user
 * @since 25. 4. 29.
 */
public class JwtAuthFilter extends OncePerRequestFilter {

        private final JwtUtil jwtUtil;
        private final RedisRepository redisRepository;

        public JwtAuthFilter(JwtUtil jwtUtil, RedisRepository redisRepository) {
            this.jwtUtil = jwtUtil;
            this.redisRepository = redisRepository;
        }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if (isPublicEndpoint(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String accessToken = request.getHeader("accessToken");

        if (accessToken != null) {
            try{
                Claims claims = jwtUtil.parseToken(accessToken, JwtType.ACCESS);
                setAuthentication(claims);

                filterChain.doFilter(request, response);
            } catch (ExpiredJwtException e) {
                String refreshToken = getRefreshToken(request.getCookies());
                if (refreshToken != null) {
                    Claims claims = jwtUtil.parseToken(refreshToken, JwtType.REFRESH);
                    Member member = new Member(claims);
                    String newAccessToken = jwtUtil.generateToken(member, JwtType.ACCESS);
                    String newRefreshToken = jwtUtil.generateToken(member, JwtType.REFRESH);

                    String refreshCookie = ResponseCookie
                            .from("refresh", newRefreshToken)
                            .path("/")
                            .httpOnly(true)
                            .secure(true)
                            .sameSite("None")
                            .build()
                            .toString();

                    response.addHeader("Set-Cookie", refreshCookie);
                    response.addHeader("accessToken", newAccessToken);

                    setAuthentication(claims);

                    filterChain.doFilter(request, response);
                    return;
                }
                throw new GlobalException(GlobalErrorCode.NOT_FOUND_REFRESHTOKEN);
            }
        }
    }

    private void setAuthentication(Claims claims) {
        CustomUserData userData = new CustomUserData(
                claims.get("memberId", Long.class),
                claims.get("username", String.class),
                claims.get("role", String.class),
                claims.get("nickname", String.class)
        );

        CustomUserDetails customUserDetails = new CustomUserDetails(userData);
        Authentication authToken = new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    private String getRefreshToken(Cookie[] cookies) {
        if (cookies == null) {
            throw new GlobalException(GlobalErrorCode.NOT_FOUND_REFRESHTOKEN);
        }

        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("refresh")) {
                return  cookie.getValue();
            }
        }
        throw new GlobalException(GlobalErrorCode.NOT_FOUND_REFRESHTOKEN);
    }

    private boolean isPublicEndpoint(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/v3/api-docs") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/api/member") ||
                path.equals("/");
    }
}
