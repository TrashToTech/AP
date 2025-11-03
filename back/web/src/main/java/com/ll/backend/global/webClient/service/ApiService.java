package com.ll.backend.global.webClient.service;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;

@Configuration
public class ApiService {

    private final WebClient.Builder webClientBuilder;

    public ApiService(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    public Mono<String> postGenerateScript(String doc, MultipartFile pdf) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        try {
            body.add("doc", doc);
            body.add("pdf", new ByteArrayResource(pdf.getBytes()) {
                @Override
                public String getFilename() {
                    return pdf.getOriginalFilename();
                }
            });
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return webClientBuilder.build()
                .post()
                .uri("http://127.0.0.1:8000/generate-script")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(body))
                .retrieve()
                .bodyToMono(String.class);
    }
}
