"use client";

import { remove, script, scriptResponse, upload, uploadResponse } from "@/api/generated/apiClient";
import { useState } from "react";

export default function useFileUpload(onHistoryAdd: (name: string) => void) {
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

            // 업로드
            const uploadRes: uploadResponse = await upload({ file: selectedFile });
            if (uploadRes.status !== 200 || !uploadRes.data?.success) throw new Error("파일 업로드 실패");

            const uploaded = uploadRes.data.data;
            if (!uploaded?.pdfId || !uploaded?.storedName) throw new Error("업로드 정보 오류");

            onHistoryAdd(uploaded.originalName ?? selectedFile.name);

            setStatus("generating");

            // 대본 생성
            const scriptRes: scriptResponse = await script({
                pdfId: uploaded.pdfId,
                pdfName: uploaded.storedName,
            });

            // 생성 실패 시 파일 삭제 로직
            if (scriptRes.status !== 200 || !scriptRes.data?.success) {
                console.warn(`스크립트 생성 실패. 파일(ID: ${uploaded.pdfId}) 삭제 시도.`);
                try {
                    await remove({ id: uploaded.pdfId });
                } catch (delErr) {
                    console.error("파일 삭제 실패:", delErr);
                }
                throw new Error("스크립트 생성에 실패했습니다.");
            }

            setStoredFileName(uploaded.storedName);
            setResult(scriptRes.data.data);
            setStatus("done");

        } catch (err: any) {
            console.error(err);
            setStatus("error");
            setErrorMsg(err.message || "처리 중 오류가 발생했습니다.");
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