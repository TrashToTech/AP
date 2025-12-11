package com.ll.backend.domain.ai.repository;

import com.ll.backend.domain.ai.entity.Script;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScriptRepository extends JpaRepository<Script, Long> {
}
