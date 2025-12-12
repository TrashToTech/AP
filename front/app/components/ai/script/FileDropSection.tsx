"use client";

import { DownloadCloud } from "lucide-react";
import { useCallback, useState } from "react";

export default function FileDropSection({ onFileDrop }: { onFileDrop: (f: File) => void }) {
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