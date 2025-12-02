package com.ll.backend.global.webClient.service;

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

        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/generate-script")
                        .queryParam("pdfId", pdfId)
                        .queryParam("pdfName", pdfName)
                        .build())
                .retrieve()
                .bodyToMono(ScriptDto.class);
    }

    public Mono<SpeechDto> postSpeech(ScriptDto dto) {

        return webClient.post()
                .uri("/speech")
                .bodyValue(dto)
                .retrieve()
                .bodyToMono(SpeechDto.class);
    }
}
