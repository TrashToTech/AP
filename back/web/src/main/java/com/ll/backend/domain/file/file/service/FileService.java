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
import java.util.List;
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
    public FileDocument save(MultipartFile file, Long memberId) {

        validateFile(file);

        String originalName = file.getOriginalFilename();
        String storedName = UUID.randomUUID() + ".pdf";
        String savedPath = saveToStorage(file, storedName);

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new GlobalException(GlobalErrorCode.NON_FOUND_MEMBER));

        return fileDocumentRepository.save(
                FileDocument.builder()
                        .member(member)
                        .originalName(originalName)
                        .storedName(storedName)
                        .filePath(savedPath)
                        .build()
        );
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        // PDF 파일 검증 (확장자 기반)
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("PDF 파일만 업로드 가능합니다.");
        }

        // Content-Type 검증 (한컴 PDF 등 다양한 PDF 타입 허용)
        String contentType = file.getContentType();
        if (contentType != null &&
            !contentType.equals("application/pdf") &&
            !contentType.equals("application/haansoftpdf") &&
            !contentType.equals("application/x-pdf")) {
            System.out.println("경고: 예상치 못한 Content-Type: " + contentType + " (파일명: " + originalFilename + ")");
        }

        if (file.getSize() > 10 * 1024 * 1024) { // 10MB 제한 나중에 변경 하면 됨
            throw new IllegalArgumentException("파일이 너무 큽니다.");
        }
    }

    private String saveToStorage(MultipartFile file, String storedName) {
        try {
            Path baseDir = Paths.get("").toAbsolutePath().getParent().getParent();
            Path finalDir = baseDir.resolve(uploadDir);
            Files.createDirectories(finalDir);

            Path targetPath = finalDir.resolve(storedName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return targetPath.toString();
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }
    }

    public FileDocument findByStoredName(String pdfName) {
        return fileDocumentRepository.findByStoredName(pdfName)
                .orElseThrow();
    }

    public List<FileDocument> findByMemberId(Long memberId) {
        return fileDocumentRepository.findByMemberId(memberId);
    }

    @Transactional
    public void remove(long pdfId, Long memberId) {
        fileDocumentRepository.deleteByIdAndMemberId(pdfId, memberId);
    }

    public FileDocument findById(long pdfId) {
        return fileDocumentRepository.findById(pdfId)
                .orElseThrow();
    }
}
