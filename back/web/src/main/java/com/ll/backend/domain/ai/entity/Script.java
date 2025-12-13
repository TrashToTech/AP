package com.ll.backend.domain.ai.entity;

import com.ll.backend.domain.file.file.entity.FileDocument;
import com.ll.backend.global.entity.BaseTime;
import jakarta.persistence.*;
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
    @Lob
    @Column(columnDefinition = "TEXT")
    private String script;
    private String audioPath;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fileDocument_id")
    private FileDocument fileDocument;

    public void updateAudioPath(String audioPath) {
        this.audioPath = audioPath;
    }
}
