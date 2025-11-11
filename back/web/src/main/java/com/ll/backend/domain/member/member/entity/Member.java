package com.ll.backend.domain.member.member.entity;

import com.ll.backend.domain.file.file.entity.FileDocument;
import com.ll.backend.global.entity.BaseTime;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Member extends BaseTime {

    @Column(nullable = false,unique=true)
    String username;
    String password;
    String nickname;
    String email;
    String role;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL)
    private List<FileDocument> fileDocuments;
}
