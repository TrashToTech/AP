package com.ll.backend.domain.ai.dto;

import java.util.List;

// class 대신 record 사용 (Lombok 불필요)
public record ScriptDto(
        long pdfId,
        List<PdfInfo> pdfInfo
) {}