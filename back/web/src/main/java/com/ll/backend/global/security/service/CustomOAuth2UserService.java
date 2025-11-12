package com.ll.backend.global.security.service;

import com.ll.backend.domain.member.member.entity.Member;
import com.ll.backend.domain.member.member.repository.MemberRepository;
import com.ll.backend.domain.member.member.role.MemberRole;
import com.ll.backend.global.security.dto.CustomOAuth2UserData;
import com.ll.backend.global.security.dto.CustomUserData;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;

    public CustomOAuth2UserService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest)
            throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        Member member = memberRepository.findByEmail(email)
                .orElseGet(() -> memberRepository.save(
                        Member.builder()
                                .username(email)
                                .nickname(name)
                                .email(email)
                                .role(MemberRole.USER.getValue())
                                .build()
                ));

        return new CustomOAuth2UserData(
                new CustomUserData(
                        member.getId(),
                        member.getPassword(),
                        member.getUsername(),
                        member.getRole(),
                        member.getNickname()
                ),
                attributes
        );
    }
}