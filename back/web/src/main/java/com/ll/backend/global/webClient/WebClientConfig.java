package com.ll.backend.global.webClient;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient.Builder webClientBuilder() {

        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 600000) // 연결 대기 10분
                .responseTimeout(Duration.ofMinutes(100))              // 전체 응답 대기 100분
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(100, TimeUnit.MINUTES))  // read timeout 대기 100분 (임시)
                        .addHandlerLast(new WriteTimeoutHandler(100, TimeUnit.MINUTES)) // write timeout 대기 100분 (임시)
                );

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient));
    }
}
