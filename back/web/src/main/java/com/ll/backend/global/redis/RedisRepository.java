package com.ll.backend.global.redis;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.concurrent.*;
@Repository
public class RedisRepository {
    private final RedisTemplate<String,String> redisTemplate;


    public RedisRepository(RedisTemplate<String,String> redisTemplate){
        this.redisTemplate = redisTemplate;
    }
    public void save(String key,String value, Long limit){
        redisTemplate.opsForValue().set(key,value,limit, TimeUnit.MINUTES);
    }

    public String get(String key){
        return redisTemplate.opsForValue().get(key);
    }

    public void delete(String key){
        redisTemplate.delete(key);
    }

    public void modify(String key, String newValue){
        Long limit = redisTemplate.getExpire(key,TimeUnit.MILLISECONDS);
        delete(key);
        save(key,newValue,limit);
    }
}
