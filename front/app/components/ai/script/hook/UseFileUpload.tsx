"use client";

import {
    remove,
    script,
    scriptResponse,
    upload,
    uploadResponse,
    speech,
    speechResponse,
    getScript,
    getScriptResponse
} from "@/api/generated/apiClient";
import { useState } from "react";

export default function useFileUpload(
    onHistoryAdd: (name: string) => void,
    onSuccess?: () => void
) {
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

    const loadFromHistory = async (pdfId: number, name: string) => {
        if (!pdfId) {
            setErrorMsg("잘못된 파일 ID입니다.");
            return;
        }

        try {
            reset(); // 상태 초기화
            setStatus("generating"); // 로딩 스피너 표시
            setStoredFileName(name); // 파일명 세팅

            const res: getScriptResponse = await getScript({ id: pdfId });

            if (res.status !== 200 || !res.data?.success) {
                throw new Error("저장된 대본을 불러오는데 실패했습니다.");
            }

            const scriptList = res.data.data;
            const formattedResult = {
                pdfInfo: scriptList
            };

            setResult(formattedResult);
            setStatus("done");

            if (onSuccess) {
                onSuccess();
            }

        } catch (err: any) {
            console.error(err);
            setStatus("error");
            setErrorMsg(err.message || "기록을 불러오는 중 오류가 발생했습니다.");
        }
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

            // 1. 업로드
            const uploadRes: uploadResponse = await upload({ file: selectedFile });
            if (uploadRes.status !== 200 || !uploadRes.data?.success) throw new Error("파일 업로드 실패");

            const uploaded = uploadRes.data.data;
            if (!uploaded?.pdfId || !uploaded?.storedName) throw new Error("업로드 정보 오류");

            onHistoryAdd(uploaded.originalName ?? selectedFile.name);

            setStatus("generating");

            // 2. 대본 생성
            const scriptRes: scriptResponse = await script({
                pdfId: uploaded.pdfId,
                pdfName: uploaded.storedName,
            });

            if (scriptRes.status !== 200 || !scriptRes.data?.success || !scriptRes.data.data) {
                console.warn(`스크립트 생성 실패. 파일(ID: ${uploaded.pdfId}) 삭제 시도.`);
                await tryRemoveFile(uploaded.pdfId);
                throw new Error("스크립트 생성에 실패했습니다.");
            }

            const generatedScriptData = scriptRes.data.data;

            // 3. 음성 합성
            const speechRes: speechResponse = await speech(generatedScriptData);

            if (speechRes.status !== 200 || !speechRes.data?.success) {
                console.warn(`음성 합성 실패. 파일(ID: ${uploaded.pdfId}) 삭제 시도.`);
                await tryRemoveFile(uploaded.pdfId);
                throw new Error("음성 합성에 실패했습니다.");
            }

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
        loadFromHistory,
        reset
    };
}