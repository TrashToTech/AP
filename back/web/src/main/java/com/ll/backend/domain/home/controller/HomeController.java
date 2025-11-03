package com.ll.backend.domain.home.controller;

import com.ll.backend.domain.home.dto.ScriptDto;
import com.ll.backend.global.webClient.service.ApiService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
public class HomeController {

    private final ApiService apiService;

    public HomeController(ApiService apiService) {
        this.apiService = apiService;
    }

    @PostMapping("/home")
    public Mono<String> home(@ModelAttribute ScriptDto scriptDto) {
        return apiService.postGenerateScript(scriptDto.getDoc(), scriptDto.getPdf());
    }
}
