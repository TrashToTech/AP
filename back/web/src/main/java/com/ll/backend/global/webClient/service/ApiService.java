package com.ll.backend.global.webClient.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ll.backend.domain.ai.dto.ScriptDto;
import com.ll.backend.domain.ai.dto.SpeechDto;
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

    public Mono<SpeechDto> postSpeech(ScriptDto dto) {

        return webClient.post()
                .uri("/speech")
                .bodyValue(dto)
                .retrieve()
                .bodyToMono(SpeechDto.class);
    }
}
