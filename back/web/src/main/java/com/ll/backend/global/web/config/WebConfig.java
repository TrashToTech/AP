package com.ll.backend.global.web.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}") // yml에서 "test_data" 문자열을 가져옴
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path path = Paths.get("").toAbsolutePath().getParent().getParent().resolve(uploadDir);

        String resourcePath = path.toUri().toString();

        System.out.println("연결된 이미지 경로: " + resourcePath);

        registry.addResourceHandler("/test-data/**")
                .addResourceLocations(resourcePath);
    }
}