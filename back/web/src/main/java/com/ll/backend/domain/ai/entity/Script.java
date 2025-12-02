package com.ll.backend.domain.ai.entity;

import com.ll.backend.domain.file.file.entity.FileDocument;
import com.ll.backend.global.entity.BaseTime;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Script extends BaseTime {
    private int pageNum;
    private String script;
    private String audioPath;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fileDocument_id")
    private FileDocument fileDocument;
}
