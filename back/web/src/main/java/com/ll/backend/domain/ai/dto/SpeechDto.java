package com.ll.backend.domain.ai.dto;

import java.util.List;

public record SpeechDto (
        long pdfId,
        List<Audio> audio
){}
