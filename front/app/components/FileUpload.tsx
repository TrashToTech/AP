"use client";

import { Upload, Loader2, FileText, DownloadCloud, AlertCircle } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { upload, script } from "@/api/generated/apiClient";
import type { uploadResponse, scriptResponse } from "@/api/generated/apiClient";

// ----------------------------------------------------------------------
// 1. Logic Hook (로직 분리)
// ----------------------------------------------------------------------
function useFileUpload(onHistoryAdd: (name: string) => void) {
    const [status, setStatus] = useState<"idle" | "uploading" | "generating" | "done" | "error">("idle");
    const [result, setResult] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 파일 유효성 검사 및 설정
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

    // 실제 업로드 로직
    const submitUpload = async () => {
        if (!selectedFile) {
            setErrorMsg("PDF 파일을 선택해 주세요.");
            return;
        }

        try {
            setStatus("uploading");
            setResult(null);
            setErrorMsg(null);

            // 1) 업로드
            const uploadRes: uploadResponse = await upload({ file: selectedFile });

            if (uploadRes.status !== 200 || !uploadRes.data?.success) throw new Error("파일 업로드 실패");

            const uploaded = uploadRes.data.data;
            if (!uploaded?.pdfId || !uploaded?.storedName) throw new Error("업로드 정보 오류");

            onHistoryAdd(uploaded.originalName ?? selectedFile.name);

            // 2) 스크립트 생성
            setStatus("generating");
            const scriptRes: scriptResponse = await script({
                pdfId: uploaded.pdfId,
                pdfName: uploaded.storedName,
            });

            if (scriptRes.status !== 200 || !scriptRes.data?.success) throw new Error("스크립트 생성 실패");

            setResult(scriptRes.data.data);
            setStatus("done");

        } catch (err: any) {
            console.error(err);
            setStatus("error");
            setErrorMsg(err.message || "처리 중 오류가 발생했습니다.");
        }
    };

    return {
        status,
        result,
        selectedFile,
        errorMsg,
        handleFileSet,
        submitUpload
    };
}

// ----------------------------------------------------------------------
// 2. Main Component (컨테이너)
// ----------------------------------------------------------------------
export default function FileUpload({ onHistoryAdd }: { onHistoryAdd: (name: string) => void }) {
    const {
        status, result, selectedFile, errorMsg,
        handleFileSet, submitUpload
    } = useFileUpload(onHistoryAdd);

    return (
        <div className="w-full bg-[#F3F4F6] rounded-lg overflow-hidden shadow-sm">
            {/* 헤더 */}
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">PDF 업로드</h3>
            </div>

            {/* 본문 (좌우 배치) */}
            <div className="bg-white p-8 flex flex-col md:flex-row gap-8 items-stretch min-h-[250px]">
                {/* 왼쪽: 파일 선택 폼 */}
                <FileSelectSection
                    selectedFile={selectedFile}
                    status={status}
                    errorMsg={errorMsg}
                    onFileChange={handleFileSet}
                    onSubmit={submitUpload}
                />

                {/* 오른쪽: 드래그 앤 드롭 */}
                <FileDropSection onFileDrop={handleFileSet} />
            </div>

            {/* 결과창 */}
            <ResultSection result={result} />
        </div>
    );
}

// ----------------------------------------------------------------------
// 3. Sub Components (UI)
// ----------------------------------------------------------------------

// 왼쪽 섹션: 파일 인풋 & 버튼
function FileSelectSection({
    selectedFile, status, errorMsg, onFileChange, onSubmit
}: {
    selectedFile: File | null,
    status: string,
    errorMsg: string | null,
    onFileChange: (f: File | null) => void,
    onSubmit: () => void
}) {
    const isLoading = status === "uploading" || status === "generating";

    return (
        <div className="flex-1 flex flex-col justify-center space-y-6">
            <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500">PDF 파일 선택</label>

                {/* 커스텀 인풋 UI */}
                <div className="relative group">
                    <input
                        type="file"
                        accept="application/pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                            if (e.target.files?.length) onFileChange(e.target.files[0]);
                        }}
                        disabled={isLoading}
                    />
                    <div className={`w-full border rounded px-4 py-3 bg-white text-sm flex justify-between items-center transition-colors
                        ${errorMsg ? "border-red-300 bg-red-50" : "border-gray-300 group-hover:border-blue-400"}
                    `}>
                        <span className={`truncate max-w-[200px] ${selectedFile ? "text-gray-800" : "text-gray-400"}`}>
                            {selectedFile ? selectedFile.name : "파일 선택 (선택된 파일 없음)"}
                        </span>
                        {selectedFile && <FileText size={16} className="text-blue-500" />}
                    </div>
                </div>

                {/* 에러 메시지 */}
                {errorMsg && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1 animate-pulse">
                        <AlertCircle size={12} />
                        <span>{errorMsg}</span>
                    </div>
                )}
            </div>

            <button
                onClick={onSubmit}
                disabled={isLoading}
                className="w-fit bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-bold flex items-center gap-2 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <> <Loader2 className="animate-spin" size={16} /> 처리 중... </>
                ) : (
                    <> <Upload size={16} /> 업로드하기 </>
                )}
            </button>
        </div>
    );
}

// 오른쪽 섹션: 드래그 앤 드롭 존
function FileDropSection({ onFileDrop }: { onFileDrop: (f: File) => void }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files?.length) {
            onFileDrop(e.dataTransfer.files[0]);
        }
    }, [onFileDrop]);

    return (
        <div
            className={`flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all cursor-default select-none
                ${isDragging ? "border-blue-400 bg-blue-50 text-blue-500 scale-[1.02]" : "border-gray-200 bg-gray-50 text-gray-400"}
            `}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <DownloadCloud size={48} className={`mb-2 transition-opacity ${isDragging ? "opacity-100" : "opacity-50"}`} />
            <span className="text-xl font-light">{isDragging ? "여기에 파일을 놓으세요" : "Drop files here"}</span>
            <p className="text-xs mt-2">PDF 파일을 여기로 드래그하세요</p>
            <div className="mt-3 text-xs text-gray-500">또는 왼쪽 박스를 클릭하여 선택</div>
        </div>
    );
}

// 결과 섹션
function ResultSection({ result }: { result: any }) {
    if (!result) return null;
    return (
        <div className="p-4 bg-gray-100 text-sm border-t border-gray-200 max-h-60 overflow-auto">
            <p className="font-bold mb-2 text-gray-700">📜 생성된 대본:</p>
            <pre className="whitespace-pre-wrap text-xs text-gray-600 font-mono bg-white p-3 rounded border">
                {JSON.stringify(result, null, 2)}
            </pre>
        </div>
    );
}