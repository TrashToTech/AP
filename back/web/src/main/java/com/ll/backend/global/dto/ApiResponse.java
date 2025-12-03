package com.ll.backend.global.dto;

public record ApiResponse<T>(
        boolean success,
        String code,
        String message,
        T data
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "200", "요청 성공", data);
    }
    public static ApiResponse<Void> successVoid() {
        return new ApiResponse<>(true, "200", "요청 성공", null);
    }

    public static ApiResponse<Void> error(String code, String message) {
        return new ApiResponse<>(false, code, message, null);
    }
}