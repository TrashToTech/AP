package com.ll.backend.domain.file.file.repository;


import com.ll.backend.domain.file.file.entity.FileDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FileDocumentRepository extends JpaRepository<FileDocument, Long> {
    Optional<FileDocument> findByStoredName(String pdfName);

    List<FileDocument> findByMemberId(Long memberId);
}
