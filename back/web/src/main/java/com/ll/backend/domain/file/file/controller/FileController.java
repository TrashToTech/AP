package com.ll.backend.domain.file.file.controller;

import com.ll.backend.domain.file.file.service.FileService;
import com.ll.backend.global.security.dto.CustomUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal CustomUserDetails userDetails) {

        fileService.save(file,userDetails.getMemberId());

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
