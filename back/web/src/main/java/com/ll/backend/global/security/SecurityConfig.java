package com.ll.backend.global.security;

import com.ll.backend.global.redis.RedisRepository;
import com.ll.backend.global.security.jwt.JwtAuthFilter;
import com.ll.backend.global.security.jwt.JwtUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final RedisRepository redisRepository;

    public SecurityConfig(JwtUtil jwtUtil, RedisRepository redisRepository) {
        this.jwtUtil = jwtUtil;
        this.redisRepository = redisRepository;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sessionManagement ->
                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorizeRequests -> authorizeRequests
                        .requestMatchers("/api/member/**",
                                "/api/reissue",
                                "/",
                                "/h2-console/**",
                                "/ws/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**")
                        .permitAll()  //인증없이 접속가능
                        .anyRequest()
                        .authenticated() // 인증 필요
                )
                .headers(headers -> headers
                        .defaultsDisabled()
                        .frameOptions(frame -> frame.sameOrigin())
                )
                .addFilterBefore(new JwtAuthFilter(jwtUtil, redisRepository), UsernamePasswordAuthenticationFilter.class);  // jwt 유효성 검사;

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {

        return new BCryptPasswordEncoder();
    }
}
