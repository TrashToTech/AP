package com.ll.backend.domain.file.file.dto;

import com.ll.backend.domain.file.file.entity.FileDocument;
import lombok.Getter;

@Getter
public class FileDto {
    private Long pdfId;
    private String originalName;
    private String storedName;

    public FileDto(FileDocument fileDocument) {
        this.pdfId = fileDocument.getId();
        this.originalName = fileDocument.getOriginalName();
        this.storedName = fileDocument.getStoredName();
    }
}
