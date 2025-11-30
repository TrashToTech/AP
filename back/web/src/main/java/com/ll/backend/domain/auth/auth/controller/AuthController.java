package com.ll.backend.domain.auth.auth.controller;

import com.ll.backend.domain.auth.auth.dto.TokenInfo;
import com.ll.backend.domain.auth.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth API", description = "인증/인가 관련 API")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    record LoginRequest (
            String username,
            String password
    ){}

    @Operation(
            summary = "로그인",
            description = "아이디와 비밀번호를 입력하여 로그인 후 AccessToken 을 반환합니다."
    )
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody LoginRequest dto,
            HttpServletResponse response
    ) {

        TokenInfo token = authService.login(dto.username, dto.password, response);

        return ResponseEntity.ok(Map.of("accessToken", token.getAccessToken()));
    }

    @Operation(
            summary = "토큰 재발급",
            description = "RefreshToken 을 이용해 AccessToken 을 재발급합니다."
    )
    @PostMapping("/reIssue")
    public ResponseEntity<?> reIssue(HttpServletRequest request, HttpServletResponse response) {
        authService.reIssue(request, response);

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
