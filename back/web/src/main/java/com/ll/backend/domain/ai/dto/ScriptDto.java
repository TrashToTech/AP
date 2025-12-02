package com.ll.backend.domain.ai.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class ScriptDto {
    private long pdfId;
    private List<PdfInfo> pdfInfos;
}
