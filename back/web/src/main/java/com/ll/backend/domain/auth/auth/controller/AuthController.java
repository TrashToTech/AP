package com.ll.backend.domain.auth.auth.controller;

import com.ll.backend.domain.auth.auth.service.AuthService;
import com.ll.backend.domain.member.member.controller.MemberController;
import com.ll.backend.global.redis.RedisRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RedisRepository redisRepository;

    public AuthController(AuthService authService, RedisRepository redisRepository) {
        this.authService = authService;
        this.redisRepository = redisRepository;
    }


    record LoginRequest (
            String username,
            String password
    ){}

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody LoginRequest dto,
            HttpServletResponse response
    ) {

        authService.login(dto.username, dto.password, response);

        return ResponseEntity.ok(Map.of("message", "로그인 성공"));
    }
}
