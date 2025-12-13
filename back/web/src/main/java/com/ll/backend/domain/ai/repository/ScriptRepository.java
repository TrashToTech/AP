package com.ll.backend.domain.ai.repository;

import com.ll.backend.domain.ai.entity.Script;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScriptRepository extends JpaRepository<Script, Long> {
    List<Script> findAllByFileDocumentId(long fileDocumentId);
}
