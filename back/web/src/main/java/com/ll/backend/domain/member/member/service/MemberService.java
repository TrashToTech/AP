package com.ll.backend.domain.member.member.service;

import com.ll.backend.domain.member.member.entity.Member;
import com.ll.backend.domain.member.member.repository.MemberRepository;
import com.ll.backend.global.exception.GlobalErrorCode;
import com.ll.backend.global.exception.GlobalException;
import com.ll.backend.global.security.jwt.JwtType;
import com.ll.backend.global.security.jwt.JwtUtil;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JwtUtil jwtUtil;

    public MemberService(MemberRepository memberRepository, BCryptPasswordEncoder bCryptPasswordEncoder, JwtUtil jwtUtil) {
        this.memberRepository = memberRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.jwtUtil = jwtUtil;
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

    public String[] login(String username, String password) {
        Member member = findByUsername(username);
        if (!bCryptPasswordEncoder.matches(password, member.getPassword())) {
            throw new GlobalException(GlobalErrorCode.INCORRECT_PASSWORD);
        }
        // 토큰 생성 후 반환
        String accessToken = jwtUtil.generateToken(member, JwtType.ACCESS);
        String refreshToken = jwtUtil.generateToken(member, JwtType.REFRESH);
        return new String[] { accessToken, refreshToken };
    }

    public Member findByUsername(String username) {
        return memberRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalException(GlobalErrorCode.NON_EXISTING_USERNAME));
    }
}
