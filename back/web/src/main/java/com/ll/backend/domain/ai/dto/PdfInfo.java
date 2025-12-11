package com.ll.backend.domain.ai.dto;

// class 대신 record 사용
public record PdfInfo(
        int pageNum,
        String script
) {}