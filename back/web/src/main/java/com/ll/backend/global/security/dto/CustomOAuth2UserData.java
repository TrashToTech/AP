package com.ll.backend.global.security.dto;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.List;
import java.util.Map;

public record CustomOAuth2UserData(CustomUserData customUserData,
                                   Map<String, Object> attributes) implements OAuth2User {

    @Override
    public String getName() {
        return customUserData.nickname;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    public long getMemberId() { return customUserData.memberId; }
    public String getUsername() { return customUserData.username; }
    public String getRole() { return customUserData.role; }
}
