package com.ll.backend.domain.member.member.entity;

import com.ll.backend.global.entity.BaseTime;
import io.jsonwebtoken.Claims;
import jakarta.persistence.*;
import lombok.*;

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

    public Member(Claims claims) {
        setId(claims.get("memberId", Long.class));
        this.password = "";
        this.username = claims.get("username", String.class);
        this.role = claims.get("role", String.class);
        this.nickname = claims.get("nickname", String.class);
    }
}
