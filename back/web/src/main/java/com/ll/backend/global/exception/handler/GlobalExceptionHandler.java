package com.ll.backend.global.exception.handler;

import com.ll.backend.global.exception.GlobalException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(GlobalException.class)
    public ResponseEntity<Map<String, Object>> handle(GlobalException ex) {
        return ResponseEntity
                .status(ex.getStatus())
                .body(Map.of("status", ex.getStatus().value(),
                        "code", ex.getCode(),
                        "message", ex.getMessage()));
    }
}
