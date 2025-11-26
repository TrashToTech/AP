package com.ll.backend.domain.file.file.controller;

import com.ll.backend.domain.file.file.dto.FileDto;
import com.ll.backend.domain.file.file.service.FileService;
import com.ll.backend.global.security.dto.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/file")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping("/upload")
    public ResponseEntity<FileDto> upload(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal CustomUserDetails userDetails) {

        return ResponseEntity.ok(
                new FileDto(fileService.save(file, userDetails.getMemberId()))
        );
    }

    @GetMapping("list")
    public ResponseEntity<List<FileDto>> list(@AuthenticationPrincipal CustomUserDetails userDetails) {

        return ResponseEntity.ok(
                fileService.findByMemberId(userDetails.getMemberId())
                        .stream()
                        .map(FileDto::new)
                        .collect(Collectors.toList())
        );
    }
}
