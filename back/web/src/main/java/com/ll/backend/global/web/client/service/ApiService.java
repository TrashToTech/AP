package com.ll.backend.global.web.client.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ll.backend.domain.ai.dto.ScriptDto;
import com.ll.backend.domain.ai.dto.SpeechDto;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class ApiService {

    private final WebClient webClient;

    public ApiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("http://127.0.0.1:8000")
                .build();
    }

    public Mono<ScriptDto> postGenerateScript(long pdfId, String pdfName) {
        System.out.println("pdfId = " + pdfId);
        System.out.println("pdfName = " + pdfName);
        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/generate-script")
                        .queryParam("pdfId", pdfId)
                        .queryParam("pdfName", pdfName)
                        .build())
                .retrieve()
                .bodyToMono(String.class)  // 먼저 Raw JSON 받기
                .doOnNext(raw -> {
                    System.out.println("===== FastAPI Raw JSON =====");
                    System.out.println(raw);
                })
                .flatMap(raw -> {
                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        ScriptDto dto = mapper.readValue(raw, ScriptDto.class);

                        System.out.println("===== Parsed ScriptDto =====");
                        System.out.println(dto);

                        if (dto != null && dto.pdfInfo() != null) {
                            dto.pdfInfo().forEach(info ->
                                    System.out.println("Page: " + info.pageNum() + ", Script: " + info.script())
                            );
                        }

                        return Mono.just(dto);
                    } catch (Exception e) {
                        System.out.println("❌ ScriptDto 파싱 실패: " + e.getMessage());
                        return Mono.error(e);
                    }
                });
    }

    public Mono<SpeechDto> postSpeech(ScriptDto scriptDto) {
        return webClient.post()
                .uri("/speech")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(scriptDto)
                .retrieve()
                // 🔥 String으로 받지 말고, 바로 SpeechDto로 받자!
                // 위에서 @JsonProperty("audio")를 붙였기 때문에 찰떡같이 변환됨.
                .bodyToMono(SpeechDto.class)
                .doOnNext(dto -> {
                    System.out.println("===== FastAPI 응답 수신 성공 =====");
                    System.out.println("PDF ID: " + dto.pdfId());
                    System.out.println("오디오 개수: " + (dto.audio() != null ? dto.audio().size() : 0));
                })
                .doOnError(e -> System.out.println("❌ FastAPI 통신 에러: " + e.getMessage()));
    }
}
