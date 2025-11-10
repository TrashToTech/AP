package com.ll.backend.domain.member.member.service;

import com.ll.backend.domain.member.member.entity.Member;
import com.ll.backend.domain.member.member.repository.MemberRepository;
import com.ll.backend.global.exception.GlobalErrorCode;
import com.ll.backend.global.exception.GlobalException;
import com.ll.backend.global.security.dto.CustomUserDetails;
import com.ll.backend.global.security.jwt.JwtType;
import com.ll.backend.global.security.jwt.JwtUtil;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public MemberService(MemberRepository memberRepository, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.memberRepository = memberRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    public Member join(String username, String password, String nickname, String email) {
        String encodingPassword = bCryptPasswordEncoder.encode(password);

        Member member = new Member(username, encodingPassword, nickname, email, "ROLE_MEMBER");

        try {
            return memberRepository.save(member);
        } catch (DataIntegrityViolationException e) {
            throw new GlobalException(GlobalErrorCode.ALREADY_USER);
        }
    }

    public Member findByUsername(String username) {
        return memberRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalException(GlobalErrorCode.NON_EXISTING_USERNAME));
    }
}
