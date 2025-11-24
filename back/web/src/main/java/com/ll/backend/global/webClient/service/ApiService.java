package com.ll.backend.global.webClient.service;

import com.ll.backend.domain.ai.dto.ScriptResponseDto;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Configuration
public class ApiService {

    private final WebClient.Builder webClientBuilder;

    public ApiService(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    public Mono<ScriptResponseDto> postGenerateScript(int pdfId, String pdfName) {

        return webClientBuilder.baseUrl("http://127.0.0.1:8000").build()
                .post()
                .uri(uriBuilder -> uriBuilder
                        .path("/generate-script")
                        .queryParam("pdfId", pdfId)
                        .queryParam("pdfName", pdfName)
                        .build())
                .retrieve()
                .bodyToMono(ScriptResponseDto.class);
    }
}
