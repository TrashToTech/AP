package com.ll.backend.domain.home.dto;

import org.springframework.web.multipart.MultipartFile;

public class ScriptDto {
    private String doc;
    private MultipartFile pdf;

    public String getDoc() {
        return doc;
    }

    public void setDoc(String doc) {
        this.doc = doc;
    }

    public MultipartFile getPdf() {
        return pdf;
    }

    public void setPdf(MultipartFile pdf) {
        this.pdf = pdf;
    }
}
