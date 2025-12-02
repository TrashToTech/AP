package com.ll.backend.domain.ai.controller;

import com.ll.backend.domain.ai.dto.ScriptDto;
import com.ll.backend.domain.ai.dto.SpeechDto;
import com.ll.backend.global.webClient.service.ApiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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

    record ScriptRequest(
            long pdfId,
            String pdfName
    ){}
    @Operation(
            summary = "PDF 스크립트 생성",
            description = "PDF ID와 파일명을 받아 PDF에서 대본을 생성합니다."
    )
    @PostMapping("/script")
    public Mono<ScriptDto> script(@RequestBody ScriptRequest req) {
        // fastAPI 수정되면 저장 service 추가
        return apiService.postGenerateScript(req.pdfId, req.pdfName);
    }

    @Operation(
            summary = "PDF 페이지 대본을 기반으로 음성 합성 요청",
            description = """
                업로드된 PDF에서 생성한 페이지별 대본(script)을 FastAPI로 전달하여
                각 페이지의 음성을 합성하고, 생성된 음성 파일명을 반환합니다.
                
                - 요청 Body에는 pdfId와 페이지별 대본 리스트(pdfInfo)가 포함됩니다.
                - FastAPI는 모든 페이지를 한 번에 처리하며, 각 페이지마다 음성 파일이 생성됩니다.
                - 응답으로는 pageNum, script, audioFileName이 포함된 리스트가 반환됩니다.
                """
    )
    @PostMapping("/speech")
    public Mono<SpeechDto> speech(@RequestBody ScriptDto scriptDto) {
        // fastAPI 수정되면 저장 service 추가
        return apiService.postSpeech(scriptDto);
    }
}
