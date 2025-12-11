package com.ll.backend.domain.ai.service;

import com.ll.backend.domain.ai.dto.ScriptDto;
import com.ll.backend.domain.ai.entity.Script;
import com.ll.backend.domain.ai.repository.ScriptRepository;
import com.ll.backend.domain.file.file.entity.FileDocument;
import com.ll.backend.domain.file.file.repository.FileDocumentRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

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
}
