package com.ll.backend.domain.file.file.entity;

import com.ll.backend.domain.ai.entity.Script;
import com.ll.backend.domain.member.member.entity.Member;
import com.ll.backend.global.entity.BaseTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileDocument extends BaseTime {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;
    private String originalName;
    private String storedName;
    private String filePath;
    @OneToMany(mappedBy = "fileDocument", cascade = CascadeType.ALL)
    private List<Script> scripts;
}
