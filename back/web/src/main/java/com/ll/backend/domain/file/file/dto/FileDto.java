package com.ll.backend.domain.file.file.dto;

import com.ll.backend.domain.file.file.entity.FileDocument;
import lombok.Getter;

@Getter
public class FileDto {
    private Long pdfId;
    private String originalName;
    private String storedName;
    private String script;
    private String audioPath;

    public FileDto(FileDocument fileDocument) {
        this.pdfId = fileDocument.getId();
        this.originalName = fileDocument.getOriginalName();
        this.storedName = fileDocument.getStoredName();
        this.script = fileDocument.getScript();
        this.audioPath = fileDocument.getAudioPath();
    }
}
