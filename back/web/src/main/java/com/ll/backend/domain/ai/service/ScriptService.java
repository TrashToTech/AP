package com.ll.backend.domain.ai.service;

import com.ll.backend.domain.ai.dto.Audio;
import com.ll.backend.domain.ai.dto.ScriptDto;
import com.ll.backend.domain.ai.dto.ScriptResponse;
import com.ll.backend.domain.ai.dto.SpeechDto;
import com.ll.backend.domain.ai.entity.Script;
import com.ll.backend.domain.ai.repository.ScriptRepository;
import com.ll.backend.domain.file.file.entity.FileDocument;
import com.ll.backend.domain.file.file.repository.FileDocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ScriptService {
    private final ScriptRepository scriptRepository;
    private final FileDocumentRepository fileDocumentRepository;

    public ScriptService(ScriptRepository scriptRepository, FileDocumentRepository fileDocumentRepository) {
        this.scriptRepository = scriptRepository;
        this.fileDocumentRepository = fileDocumentRepository;
    }

    public Mono<Void> save(ScriptDto scriptDto) {
        if (scriptDto == null || scriptDto.pdfInfo() == null || scriptDto.pdfInfo().isEmpty()) {
            return Mono.empty();
        }

        FileDocument fileDocument = fileDocumentRepository.findById(scriptDto.pdfId())
                .orElseThrow();

        return Flux.fromIterable(scriptDto.pdfInfo())
                .flatMap(info -> {

                    Script script = Script.builder()
                            .pageNum(info.pageNum())
                            .script(info.script())
                            .fileDocument(fileDocument)   // 필요하면 pdfId도 채워
                            .build();

                    // 블로킹 JPA 호출을 boundedElastic 스레드로 옮긴다
                    return Mono.fromCallable(() -> scriptRepository.save(script))
                            .subscribeOn(Schedulers.boundedElastic());
                })
                .then(); // Mono<Void>
    }

    @Transactional
    public void saveAudioResults(SpeechDto speechDto) {
        // 1. 해당 PDF의 모든 스크립트를 한 번에 조회 (N+1 문제 방지)
        List<Script> scripts = scriptRepository.findAllByFileDocumentId(speechDto.pdfId());

        if (scripts.isEmpty()) {
            throw new IllegalArgumentException("해당 PDF의 스크립트가 존재하지 않습니다.");
        }

        // 2. [최적화] DTO 리스트를 Map<PageNum, AudioPath>으로 변환
        // 이렇게 하면 아래 for문에서 매번 탐색할 필요 없이 바로 값을 찾을 수 있음
        Map<Integer, String> audioMap = speechDto.audio().stream()
                .collect(Collectors.toMap(
                        Audio::pageNum, // Key: 페이지 번호
                        Audio::name     // Value: 파일 경로
                ));

        // 3. 스크립트를 순회하며 오디오 경로 업데이트 (Dirty Checking)
        for (Script script : scripts) {
            if (audioMap.containsKey(script.getPageNum())) {
                String newPath = audioMap.get(script.getPageNum());
                script.updateAudioPath(newPath); // 엔티티 메서드 호출
            }
        }

        // 4. 별도의 repository.saveAll()을 호출하지 않아도,
        // @Transactional이 끝날 때 변경된 감지(Dirty Checking)가 동작하여 Update 쿼리가 날아갑니다.
    }

    @Transactional(readOnly = true)
    public List<ScriptResponse> findByPdfId(long pdfId) {
        return scriptRepository.findAllByFileDocumentId(pdfId).stream()
                .map(ScriptResponse::new)
                .collect(Collectors.toList());
    }
}
