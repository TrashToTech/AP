package com.ll.backend.global.exception;

import org.springframework.http.HttpStatus;

public enum GlobalErrorCode {
    NOT_VALID(HttpStatus.BAD_REQUEST, "400", "요청이 올바르지 않습니다."),
    ALREADY_USER(HttpStatus.BAD_REQUEST, "409", "해당 username은 이미 사용중입니다."),
    NON_EXISTING_USERNAME(HttpStatus.NOT_FOUND, "404", "존재하지 않는 사용자 입니다."),
    INCORRECT_PASSWORD(HttpStatus.UNAUTHORIZED, "401", "비밀번호가 맞지 않습니다."),
    NOT_FOUND_ACCESSTOKEN(HttpStatus.UNAUTHORIZED,"401", "ACCESSTOKEN을 찾을 수 없습니다"),
    NOT_FOUND_REFRESHTOKEN(HttpStatus.UNAUTHORIZED,"401", "REFRESHTOKEN을 찾을 수 없습니다"),
    EXPIRATION_ACCESSTOKEN(HttpStatus.UNAUTHORIZED,"401", "ACCESSTOKEN이 만료되었습니다."),
    EXPIRATION_REFRESHTOKEN(HttpStatus.UNAUTHORIZED,"401", "REFRESHTOKEN이 만료되었습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED,"401", "유효하지 않은 토큰입니다."),
    INVALID_SESSTION(HttpStatus.UNAUTHORIZED,"401", "다시 로그인 하세요");

    final HttpStatus status;
    final String code;
    final String message;

    GlobalErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
