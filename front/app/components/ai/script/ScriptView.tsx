"use client";

import { RefreshCcw, Sparkles, Loader2, FileText, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// PDF 워커 설정 (기존 유지)
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const SERVER_BASE_URL = "http://localhost:8080/test-data/";

interface ScriptViewProps {
    result: any;
    storedFileName: string | null;
    onReset: () => void;
}

export default function ScriptView({ result, storedFileName, onReset }: ScriptViewProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [numPages, setNumPages] = useState<number>(0);

    const pdfInfo = result?.pdfInfo || [];
    const currentScript = pdfInfo[activeIndex]?.script || "";

    const fileUrl = useMemo(() => {
        if (!storedFileName) return null;
        return `${SERVER_BASE_URL}${storedFileName}`;
    }, [storedFileName]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        // 전체 컨테이너: 화면 꽉 채우기 (h-full)
        <div className="flex h-full w-full bg-white overflow-hidden animate-fadeIn">

            {/* 1. 좌측: 썸네일 목록 (사이드바 바로 옆에 붙음) */}
            <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-10">
                    <span className="font-bold text-gray-700 flex items-center gap-2">
                        <FileText size={18} className="text-blue-500" /> 페이지 목록
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                        {numPages}장
                    </span>
                </div>

                <div className="overflow-y-auto p-3 space-y-4 flex-1 custom-scrollbar">
                    {fileUrl && (
                        <Document
                            file={fileUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={<div className="py-10 text-center"><Loader2 className="animate-spin inline text-gray-400" /></div>}
                            error={<div className="text-red-500 text-xs text-center p-4">로드 실패</div>}
                            className="flex flex-col gap-2"
                        >
                            {Array.from(new Array(numPages), (el, index) => (
                                <div
                                    key={`thumb_${index}`}
                                    onClick={() => setActiveIndex(index)}
                                    className={`
                                        cursor-pointer relative w-full rounded-md overflow-hidden transition-all duration-200 group
                                        ${activeIndex === index
                                            ? "ring-2 ring-blue-500 shadow-md transform scale-[1.02]"
                                            : "border border-gray-200 hover:border-blue-300 hover:shadow-sm opacity-80 hover:opacity-100"
                                        }
                                    `}
                                >
                                    {/* 썸네일용 작은 페이지 */}
                                    <Page
                                        pageNumber={index + 1}
                                        width={200}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        className="pointer-events-none"
                                    />

                                    {/* 페이지 번호 배지 */}
                                    <div className={`
                                        absolute bottom-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm
                                        ${activeIndex === index ? "bg-blue-500 text-white" : "bg-black/60 text-white"}
                                    `}>
                                        {index + 1}
                                    </div>
                                </div>
                            ))}
                        </Document>
                    )}
                </div>
            </div>

            {/* 2. 우측: 메인 뷰어 + 대본 영역 */}
            <div className="flex-1 flex flex-col min-w-0 h-full bg-white">

                {/* 상단 헤더 (간소화) */}
                <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Sparkles className="text-yellow-500 fill-yellow-500" size={20} />
                        <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            AI 분석 결과
                        </span>
                    </h2>
                    <button
                        onClick={onReset}
                        className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full hover:bg-gray-100"
                    >
                        <RefreshCcw size={12} /> 초기화
                    </button>
                </div>

                {/* 중앙: PDF 뷰어 영역 (가장 넓게) */}
                <div className="flex-1 bg-gray-100/80 overflow-hidden relative flex items-center justify-center p-4">
                    {/* 배경 패턴 (선택사항) */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    </div>

                    {fileUrl ? (
                        <div className="h-full w-full overflow-auto flex items-center justify-center custom-scrollbar">
                            <Document file={fileUrl} loading={<div className="mt-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>}>
                                <div className=" ring-1 ring-black/5 rounded-sm">
                                    <Page
                                        pageNumber={activeIndex + 1}
                                        height={520}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        className="bg-white"
                                    />
                                </div>
                            </Document>
                        </div>
                    ) : (
                        <span className="text-gray-400 text-sm flex items-center gap-2">
                            <Loader2 className="animate-spin" /> PDF 준비 중...
                        </span>
                    )}
                </div>

                {/* 하단: 대본 영역 (고정 높이 혹은 비율) */}
                <div className="h-1/3 min-h-[250px] max-h-[400px] border-t border-gray-200 bg-white flex flex-col shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                    <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <span className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">{activeIndex + 1}</span>
                            페이지 추천 대본
                        </span>
                        {/* 페이지 이동 버튼 (편의성) */}
                        <div className="flex gap-1">
                            <button
                                disabled={activeIndex <= 0}
                                onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                                className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 transition"
                            >
                                <ChevronRight className="rotate-180" size={16} />
                            </button>
                            <button
                                disabled={activeIndex >= numPages - 1}
                                onClick={() => setActiveIndex(prev => Math.min(numPages - 1, prev + 1))}
                                className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 transition"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-white">
                        {currentScript ? (
                            <p className="text-gray-800 whitespace-pre-wrap leading-8 text-lg font-medium tracking-wide">
                                {currentScript}
                            </p>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                <FileText size={40} className="opacity-20" />
                                <p>이 페이지에는 추출된 대본이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}