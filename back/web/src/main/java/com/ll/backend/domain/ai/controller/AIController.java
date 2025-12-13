package com.ll.backend.domain.ai.controller;

import com.ll.backend.domain.ai.dto.ScriptDto;
import com.ll.backend.domain.ai.dto.SpeechDto;
import com.ll.backend.domain.ai.service.ScriptService;
import com.ll.backend.global.dto.ApiResponse;
import com.ll.backend.global.web.client.service.ApiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI API", description = "AI 관련 API")
@SecurityRequirement(name = "bearerAuth")
public class AIController {

    private final ApiService apiService;
    private final ScriptService scriptService;

    public AIController(ApiService apiService, ScriptService scriptService) {
        this.apiService = apiService;
        this.scriptService = scriptService;
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
    public ApiResponse<ScriptDto> script(@RequestBody ScriptRequest req) {
        System.out.println("대본 생성 시작");

        return apiService.postGenerateScript(req.pdfId(), req.pdfName())
                .doOnSubscribe(s -> System.out.println("FastAPI 요청 시작"))
                .flatMap(scriptDto -> {
                    if (scriptDto == null || scriptDto.pdfInfo() == null || scriptDto.pdfInfo().isEmpty()) {
                        return Mono.error(new IllegalStateException("대본 생성 실패"));
                    }
                    System.out.println("FastAPI 응답 수신, DB 저장 시작");
                    return scriptService.save(scriptDto).thenReturn(scriptDto);
                })
                .map(ApiResponse::success)
                .doOnSuccess(res -> System.out.println("FastAPI 응답 수신 완료"))
                .doOnError(err -> System.out.println("FastAPI 요청 실패: " + err))
                .block();
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
    public ApiResponse<SpeechDto> speech(@RequestBody ScriptDto scriptDto) {

        System.out.println("음성 생성");
        // fastAPI 수정되면 저장 service 추가
        return apiService.postSpeech(scriptDto)
                .doOnSubscribe(s -> System.out.println("FastAPI 요청 시작"))
                .flatMap(dto -> {
                    // 1. 유효성 검사
                    if (dto == null || dto.audio() == null || dto.audio().isEmpty()) {
                        return Mono.error(new IllegalStateException("대본 생성 실패"));
                    }

                    System.out.println("FastAPI 응답 수신, DB 저장 시작");

                    // 2. 🔥 여기가 수정된 핵심 부분!
                    // void 메서드를 Mono.fromRunnable()로 감싸야 체이닝이 가능함
                    return Mono.fromRunnable(() -> scriptService.saveAudioResults(dto))
                            .subscribeOn(Schedulers.boundedElastic()) // (선택) DB 저장이 블로킹 작업이면 별도 스레드에서 실행
                            .thenReturn(dto); // 저장이 끝나면(then) 원래 dto를 반환(Return)
                })
                .map(ApiResponse::success)
                .doOnSuccess(res -> System.out.println("FastAPI 응답 수신 완료"))
                .doOnError(err -> System.out.println("FastAPI 요청 실패: " + err))
                .block();
    }
}
