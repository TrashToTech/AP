package com.ll.backend.domain.file.file.repository;


import com.ll.backend.domain.file.file.entity.FileDocument;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FileDocumentRepository extends JpaRepository<FileDocument, Long> {
}
