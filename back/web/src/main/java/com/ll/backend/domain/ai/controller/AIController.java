package com.ll.backend.domain.ai.controller;

import com.ll.backend.domain.ai.dto.ScriptDto;
import com.ll.backend.domain.ai.dto.ScriptResponseDto;
import com.ll.backend.global.webClient.service.ApiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI API", description = "AI 관련 API")
@SecurityRequirement(name = "bearerAuth")
public class AIController {

    private final ApiService apiService;

    public AIController(ApiService apiService) {
        this.apiService = apiService;
    }

    @Operation(
            summary = "PDF 스크립트 생성",
            description = "PDF ID와 파일명을 받아 PDF에서 대본을 생성합니다."
    )
    @PostMapping("/script")
    public Mono<ScriptResponseDto> script(@RequestBody ScriptDto scriptDto) {
        return apiService.postGenerateScript(scriptDto.getPdfId(), scriptDto.getPdfName());
    }
}
