"use client";

import {
    remove,
    script,
    scriptResponse,
    upload,
    uploadResponse,
    speech,          // 추가됨
    speechResponse,  // 추가됨
} from "@/api/generated/apiClient";
import { useState } from "react";

export default function useFileUpload(
    onHistoryAdd: (name: string) => void,
    onSuccess?: () => void
) {
    // 상태는 그대로 유지 (generating 상태에서 script -> speech 둘 다 처리)
    const [status, setStatus] = useState<"idle" | "uploading" | "generating" | "done" | "error">("idle");
    const [result, setResult] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [storedFileName, setStoredFileName] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleFileSet = (file: File | null) => {
        setErrorMsg(null);
        if (!file) return;
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
            setErrorMsg("PDF 파일만 업로드할 수 있습니다.");
            return;
        }
        setSelectedFile(file);
    };

    const submitUpload = async () => {
        if (!selectedFile) {
            setErrorMsg("PDF 파일을 선택해 주세요.");
            return;
        }

        try {
            setStatus("uploading");
            setResult(null);
            setErrorMsg(null);

            // 1. 파일 업로드
            const uploadRes: uploadResponse = await upload({ file: selectedFile });
            if (uploadRes.status !== 200 || !uploadRes.data?.success) throw new Error("파일 업로드 실패");

            const uploaded = uploadRes.data.data;
            if (!uploaded?.pdfId || !uploaded?.storedName) throw new Error("업로드 정보 오류");

            onHistoryAdd(uploaded.originalName ?? selectedFile.name);

            setStatus("generating"); // 대본 생성 & 음성 합성 시작

            // 2. 대본 생성 (Script)
            const scriptRes: scriptResponse = await script({
                pdfId: uploaded.pdfId,
                pdfName: uploaded.storedName,
            });

            // 생성 실패 시 파일 삭제 로직
            if (scriptRes.status !== 200 || !scriptRes.data?.success || !scriptRes.data.data) {
                console.warn(`스크립트 생성 실패. 파일(ID: ${uploaded.pdfId}) 삭제 시도.`);
                await tryRemoveFile(uploaded.pdfId);
                throw new Error("스크립트 생성에 실패했습니다.");
            }

            const generatedScriptData = scriptRes.data.data; // ScriptDto 형식

            // 3. 음성 합성 (Speech) - 새로 추가된 부분!
            // script 결과(generatedScriptData)를 그대로 speech 요청 바디로 사용
            const speechRes: speechResponse = await speech(generatedScriptData);

            if (speechRes.status !== 200 || !speechRes.data?.success) {
                console.warn(`음성 합성 실패. 파일(ID: ${uploaded.pdfId}) 삭제 시도.`);
                await tryRemoveFile(uploaded.pdfId);
                throw new Error("음성 합성에 실패했습니다.");
            }

            // 4. 완료 처리
            // 최종적으로 음성 파일 정보가 포함된 데이터를 결과로 설정
            setStoredFileName(uploaded.storedName);
            setResult(speechRes.data.data);
            setStatus("done");

            if (onSuccess) {
                onSuccess();
            }

        } catch (err: any) {
            console.error(err);
            setStatus("error");
            setErrorMsg(err.message || "처리 중 오류가 발생했습니다.");
        }
    };

    // 에러 발생 시 파일 삭제를 위한 헬퍼 함수
    const tryRemoveFile = async (pdfId: number) => {
        try {
            await remove({ id: pdfId });
        } catch (delErr) {
            console.error("파일 삭제 실패:", delErr);
        }
    };

    const reset = () => {
        setStatus("idle");
        setResult(null);
        setSelectedFile(null);
        setStoredFileName(null);
        setErrorMsg(null);
    };

    return {
        status,
        result,
        storedFileName,
        selectedFile,
        errorMsg,
        handleFileSet,
        submitUpload,
        reset
    };
}