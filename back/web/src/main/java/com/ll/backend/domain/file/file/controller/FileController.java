package com.ll.backend.domain.file.file.controller;

import com.ll.backend.domain.file.file.service.FileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/file")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file")MultipartFile file) {

        if (!"application/pdf".equals(file.getContentType())) {
            return ResponseEntity.badRequest().body("PDF 파일만 업로드할 수 있습니다.");
        }

        fileService.save(file);

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
