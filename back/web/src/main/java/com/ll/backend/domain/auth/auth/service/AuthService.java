package com.ll.backend.domain.auth.auth.service;

import com.ll.backend.global.security.dto.CustomUserDetails;
import com.ll.backend.global.security.jwt.JwtType;
import com.ll.backend.global.security.jwt.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public String[] login(String username, String password) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(username, password)
                );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        // 토큰 생성 후 반환
        String accessToken = jwtUtil.generateToken(userDetails, JwtType.ACCESS);
        String refreshToken = jwtUtil.generateToken(userDetails, JwtType.REFRESH);
        return new String[] { accessToken, refreshToken };
    }
}
