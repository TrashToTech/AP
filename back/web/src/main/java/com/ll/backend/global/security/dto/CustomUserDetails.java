package com.ll.backend.global.security.dto;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails {

    final private CustomUserData customUserData;

    public CustomUserDetails(CustomUserData customUserData) {
        this.customUserData = customUserData;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String role = customUserData.role;

        // 👇👇👇 이 로그를 꼭 추가해서 콘솔을 확인해주세요! 👇👇👇
        System.out.println("🔎 [Debug] CustomUserDetails - role 값 확인: " + role);

        if (role == null || role.isBlank()) {
            System.out.println("❌ [Debug] role이 비어있습니다! 권한 목록을 빈 값으로 반환합니다.");
            return Collections.emptyList();
        }

        return Collections.singletonList(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getPassword() {
        return customUserData.password;
    }

    @Override
    public String getUsername() {
        return customUserData.username;
    }

    public Long getMemberId() {
        return customUserData.memberId;
    }

    public String getRole() {
        return customUserData.role;
    }

    public String getNickname() {
        return customUserData.nickname;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
