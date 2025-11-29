package com.ll.backend.global.security.config.handler;

import com.ll.backend.domain.member.member.entity.Member;
import com.ll.backend.domain.member.member.repository.MemberRepository;
import com.ll.backend.global.exception.GlobalErrorCode;
import com.ll.backend.global.exception.GlobalException;
import com.ll.backend.global.redis.repository.RedisRepository;
import com.ll.backend.global.security.dto.CustomOAuth2UserData;
import com.ll.backend.global.security.dto.CustomUserDetails;
import com.ll.backend.global.security.jwt.JwtType;
import com.ll.backend.global.security.jwt.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private static final long REFRESH_EXPIRATION = 86400000L; // 1 day
    private static final String REDIS_REFRESH_PREFIX = "REFRESH_TOKEN:";

    private final JwtUtil jwtUtil;
    private final RedisRepository redisRepository;
    private final MemberRepository memberRepository;

    public OAuth2SuccessHandler(JwtUtil jwtUtil, RedisRepository redisRepository, MemberRepository memberRepository) {
        this.jwtUtil = jwtUtil;
        this.redisRepository = redisRepository;
        this.memberRepository = memberRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        CustomOAuth2UserData oAuth2User = (CustomOAuth2UserData) authentication.getPrincipal();
        String email = (String) oAuth2User.getAttributes().getOrDefault("email", "");

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new GlobalException(GlobalErrorCode.NON_FOUND_MEMBER));

        CustomUserDetails userDetails = new CustomUserDetails(oAuth2User.customUserData());

        // JWT 생성
        String accessToken = jwtUtil.generateToken(userDetails, JwtType.ACCESS);
        String refreshToken = jwtUtil.generateToken(userDetails, JwtType.REFRESH);

        // Redis에 Refresh Token 저장
        redisRepository.save(REDIS_REFRESH_PREFIX + member.getId(), refreshToken, REFRESH_EXPIRATION);

        // Cookie 설정
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .path("/")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .build();

        response.addHeader("Set-Cookie", refreshCookie.toString());
        response.addHeader("Authorization", "Bearer " + accessToken);

        // Redirect
        response.sendRedirect("http://localhost:3000/ai/script");
    }
}
