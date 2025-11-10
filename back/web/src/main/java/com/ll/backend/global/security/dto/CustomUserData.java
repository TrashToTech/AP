package com.ll.backend.global.security.dto;


public class CustomUserData {
    long memberId;
    String password;
    String username;
    String role;
    String nickname;

    public CustomUserData(long memberId, String password, String username, String role, String nickname) {
        this.memberId = memberId;
        this.password = password;
        this.username = username;
        this.role = role;
        this.nickname = nickname;
    }
}
