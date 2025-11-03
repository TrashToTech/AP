package com.ll.backend.global.security.service;

import com.ll.backend.domain.member.member.entity.Member;
import com.ll.backend.domain.member.member.service.MemberService;
import com.ll.backend.global.security.dto.CustomUserData;
import com.ll.backend.global.security.dto.CustomUserDetails;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final MemberService memberService;

    public CustomUserDetailsService(MemberService memberService) {
        this.memberService = memberService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Member member = memberService.findByUsername(username);

        CustomUserData customUserData = new CustomUserData(member.getId(), member.getUsername(), member.getRole(), member.getNickname());

        return new CustomUserDetails(customUserData);
    }
}
