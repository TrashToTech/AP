package com.ll.backend.global.exception.handler;

import com.ll.backend.global.dto.ApiResponse;
import com.ll.backend.global.exception.GlobalException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(GlobalException.class)
    public ResponseEntity<ApiResponse<?>> handle(GlobalException e) {
        return ResponseEntity
                .status(e.getStatus().value())
                .body(ApiResponse.error(e.getCode(), e.getMessage()));
    }
}
