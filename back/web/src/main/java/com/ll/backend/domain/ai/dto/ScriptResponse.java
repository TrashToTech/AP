package com.ll.backend.domain.ai.dto;

import com.ll.backend.domain.ai.entity.Script;
import lombok.Getter;

@Getter
public class ScriptResponse {
    private final int pageNum;
    private final String script;
    private final String audioPath;

    public ScriptResponse(Script script) {
        this.pageNum = script.getPageNum();
        this.script = script.getScript();
        this.audioPath = script.getAudioPath();
    }
}
