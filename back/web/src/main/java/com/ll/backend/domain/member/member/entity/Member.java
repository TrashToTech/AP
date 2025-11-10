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
}
