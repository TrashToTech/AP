package com.ll.backend.domain.ai.controller;

import com.ll.backend.domain.ai.dto.ScriptDto;
import com.ll.backend.domain.ai.dto.ScriptResponseDto;
import com.ll.backend.domain.file.file.service.FileService;
import com.ll.backend.global.webClient.service.ApiService;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final ApiService apiService;
    private final FileService fileService;

    public AIController(ApiService apiService, FileService fileService) {
        this.apiService = apiService;
        this.fileService = fileService;
    }

    @PostMapping("/script")
    public Mono<ScriptResponseDto> script(@ModelAttribute ScriptDto scriptDto) {
        return apiService.postGenerateScript(Math.toIntExact(scriptDto.getPdfId()), scriptDto.getPdfName());
    }
}
