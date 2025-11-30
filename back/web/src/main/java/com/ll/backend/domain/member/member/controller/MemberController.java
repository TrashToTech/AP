package com.ll.backend.domain.member.member.controller;

import com.ll.backend.domain.member.member.entity.Member;
import com.ll.backend.domain.member.member.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/member")
@Tag(name = "Member API", description = "회원 가입 API")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    record RegisterRequest (
            @NotBlank
            @Length(min = 4)
            String username,

            @NotBlank
            @Length(min = 4)
            String password,

            @NotBlank
            @Length(min = 2)
            String nickname,

            @NotBlank
            @Email
            String email
    ){}

    @Operation(
            summary = "회원가입",
            description = "username, password, nickname, email 정보를 입력하여 회원가입을 진행합니다."
    )
    @PostMapping("/join")
    public ResponseEntity<Member> join(
            @Valid @RequestBody RegisterRequest dto
    ) {
        Member member = memberService.join(dto.username, dto.password, dto.nickname, dto.email);
        return ResponseEntity.ok(member);
    }
}
