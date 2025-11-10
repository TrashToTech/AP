package com.ll.backend.domain.auth.auth.service;

import com.ll.backend.global.redis.RedisRepository;
import com.ll.backend.global.security.dto.CustomUserDetails;
import com.ll.backend.global.security.jwt.JwtType;
import com.ll.backend.global.security.jwt.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final RedisRepository redisRepository;

    public AuthService(JwtUtil jwtUtil, AuthenticationManager authenticationManager, RedisRepository redisRepository) {
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.redisRepository = redisRepository;
    }

    public void login(String username, String password, HttpServletResponse response) {

        // security auth
        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(username, password)
                );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        // 토큰 생성 후 반환
        String accessToken = jwtUtil.generateToken(userDetails, JwtType.ACCESS);
        String refreshToken = jwtUtil.generateToken(userDetails, JwtType.REFRESH);

        redisRepository.save(refreshToken, accessToken, 86400000L);

        String refreshCookie = ResponseCookie
                .from("refresh", refreshToken)
                .path("/")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .build()
                .toString();

        response.addHeader("Set-Cookie", refreshCookie);
        response.addHeader("accessToken", accessToken);
    }
}
