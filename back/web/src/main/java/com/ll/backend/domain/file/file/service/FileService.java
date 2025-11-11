package com.ll.backend.domain.file.file.service;

import com.ll.backend.domain.file.file.entity.FileDocument;
import com.ll.backend.domain.file.file.repository.FileDocumentRepository;
import com.ll.backend.domain.member.member.entity.Member;
import com.ll.backend.domain.member.member.repository.MemberRepository;
import com.ll.backend.global.exception.GlobalErrorCode;
import com.ll.backend.global.exception.GlobalException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileService {

    private final FileDocumentRepository fileDocumentRepository;
    private final MemberRepository memberRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public FileService(FileDocumentRepository fileDocumentRepository, MemberRepository memberRepository) {
        this.fileDocumentRepository = fileDocumentRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional
    public void save(MultipartFile file, Long memberId) {

        validateFile(file);

        String savedPath = moveToFinalStorage(file);

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new GlobalException(GlobalErrorCode.NON_FOUND_MEMBER));

        fileDocumentRepository.save(
                FileDocument.builder()
                        .member(member)
                        .filePath(savedPath)
                        .script("")
                        .audioPath("")
                        .build()
        );
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        if (!file.getContentType().equals("application/pdf")) {
            throw new IllegalArgumentException("PDF 파일만 업로드 가능합니다.");
        }

        if (file.getSize() > 10 * 1024 * 1024) { // 10MB 제한 나중에 변경 하면 됨
            throw new IllegalArgumentException("파일이 너무 큽니다.");
        }
    }

    private String moveToFinalStorage(MultipartFile file) {
        try {
            String fileName = UUID.randomUUID() + ".pdf";
            Path targetPath = Paths.get(uploadDir).resolve(fileName);

            Files.createDirectories(targetPath.getParent());
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return targetPath.toString();  // DB에는 이 경로만 저장
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }
    }
}
