package com.ll.backend.domain.file.file.controller;

import com.ll.backend.domain.file.file.dto.FileDto;
import com.ll.backend.domain.file.file.service.FileService;
import com.ll.backend.global.security.dto.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/file")
@Tag(name = "File API", description = "파일 업로드 및 조회 API")
@SecurityRequirement(name = "bearerAuth")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @Operation(
            summary = "파일 업로드",
            description = "PDF 파일을 업로드합니다. 로그인한 사용자만 가능하며 MultipartFile 형식을 사용합니다."
    )
    @PostMapping("/upload")
    public ResponseEntity<FileDto> upload(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal CustomUserDetails userDetails) {

        return ResponseEntity.ok(
                new FileDto(fileService.save(file, userDetails.getMemberId()))
        );
    }

    @Operation(
            summary = "업로드된 파일 리스트 조회",
            description = "로그인한 사용자가 업로드한 PDF 목록을 반환합니다."
    )
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
