"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import FileSelectSection from "./FileSelectSection";
import FileDropSection from "./FileDropSection";
import useFileUpload from "./hook/UseFileUpload";


// ScriptView 동적 import (SSR 방지)
const ScriptView = dynamic(() => import("./ScriptView"), {
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-[600px]"><Loader2 className="animate-spin text-blue-500" size={40} /></div>,
});

export default function FileUpload({ onHistoryAdd }: { onHistoryAdd: (name: string) => void }) {
    const {
        status, result, storedFileName, selectedFile, errorMsg,
        handleFileSet, submitUpload, reset
    } = useFileUpload(onHistoryAdd);

    if (status === "done" && result && storedFileName) {
        return <ScriptView result={result} storedFileName={storedFileName} onReset={reset} />;
    }

    return (
        <main className="flex-1 overflow-auto flex flex-col items-center pt-20 pb-10 px-4 bg-white">
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