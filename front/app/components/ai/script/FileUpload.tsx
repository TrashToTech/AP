"use client";

import { Loader2 } from "lucide-react";
import FileSelectSection from "./FileSelectSection";
import FileDropSection from "./FileDropSection";

interface FileUploadProps {
    status: "idle" | "uploading" | "generating" | "done" | "error";
    result: any;
    storedFileName: string | null;
    selectedFile: File | null;
    errorMsg: string | null;
    handleFileSet: (file: File | null) => void;
    submitUpload: () => void;
    reset: () => void;
}

export default function FileUpload({
    status,
    result,
    storedFileName,
    selectedFile,
    errorMsg,
    handleFileSet,
    submitUpload,
    reset
}: FileUploadProps) {

    if (status === "generating") {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-fadeIn bg-white">
                <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-700">AI가 데이터를 분석 중입니다...</h3>
                <p className="text-gray-500 mt-2">잠시만 기다려 주세요.</p>
            </div>
        );
    }

    // 기본 업로드 화면
    return (
        <main className="flex-1 overflow-auto flex flex-col items-center pt-20 pb-10 px-4 bg-white">
            {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 shadow-sm">
                    ⚠️ {errorMsg}
                </div>
            )}

            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold leading-tight text-black">
                    방대한 정보에서 맞춤형 대본을 전달드립니다.<br />
                    업로드하여 확인해 보세요!
                </h2>
            </div>
            <div className="w-full max-w-4xl">
                <div className="w-full bg-[#F3F4F6] rounded-lg overflow-hidden shadow-sm transition-all">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">PDF 업로드</h3>
                    </div>
                    <div className="bg-white p-8 flex flex-col md:flex-row gap-8 items-stretch min-h-[300px]">
                        <FileSelectSection
                            selectedFile={selectedFile}
                            status={status}
                            errorMsg={errorMsg}
                            onFileChange={handleFileSet}
                            onSubmit={submitUpload}
                        />
                        <FileDropSection onFileDrop={handleFileSet} />
                    </div>
                </div>
            </div>
        </main>
    );
}