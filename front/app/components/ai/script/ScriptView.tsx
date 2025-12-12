"use client";

import { RefreshCcw, Sparkles, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

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
        <div className="w-full h-full flex flex-col animate-fadeIn bg-white pb-10">
            {/* 상단 헤더 */}
            <div className="text-center py-6 flex-shrink-0">
                <h2 className="text-2xl font-bold text-black mb-1 flex items-center justify-center gap-2">
                    <Sparkles className="text-yellow-400 fill-yellow-400" size={28} />
                    대본 생성 완료
                </h2>
                <p className="text-sm text-gray-500">좌측 썸네일을 클릭하여 페이지별 대본을 확인하세요.</p>
            </div>

            {/* 메인 영역 */}
            <div className="flex-1 min-h-0 flex gap-4 px-4 pb-4 max-w-7xl mx-auto w-full h-[700px]">
                {/* 좌측 썸네일 */}
                <div className="w-48 flex-shrink-0 border border-gray-200 rounded-lg bg-gray-50 overflow-hidden flex flex-col">
                    <div className="p-2 bg-gray-100 border-b text-xs font-bold text-gray-500 text-center">페이지 목록</div>
                    <div className="overflow-y-auto p-2 space-y-3 custom-scrollbar flex-1">
                        {fileUrl && (
                            <Document
                                file={fileUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={<div className="py-10 text-center"><Loader2 className="animate-spin inline text-gray-400" /></div>}
                                error={<div className="text-red-500 text-xs text-center p-4">로딩 실패</div>}
                            >
                                {Array.from(new Array(numPages), (el, index) => (
                                    <div
                                        key={`thumb_${index}`}
                                        onClick={() => setActiveIndex(index)}
                                        className={`cursor-pointer relative w-full aspect-[3/4] bg-white rounded shadow-sm overflow-hidden border-2 transition-all ${activeIndex === index ? "border-blue-500 ring-2 ring-blue-100" : "border-transparent hover:border-gray-300"}`}
                                    >
                                        <Page pageNumber={index + 1} width={150} renderTextLayer={false} renderAnnotationLayer={false} />
                                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 rounded">{index + 1}</div>
                                    </div>
                                ))}
                            </Document>
                        )}
                    </div>
                </div>

                {/* 중앙 뷰어 & 대본 */}
                <div className="flex-1 flex flex-col gap-4 min-w-0 h-full">
                    <div className="flex-1 bg-gray-800/5 rounded-lg border border-gray-200 flex items-center justify-center relative overflow-hidden">
                        {fileUrl ? (
                            <div className="h-full w-full overflow-auto flex items-center justify-center p-4 custom-scrollbar">
                                <Document file={fileUrl} loading={<Loader2 className="animate-spin text-gray-400" />}>
                                    <Page pageNumber={activeIndex + 1} height={500} renderTextLayer={false} renderAnnotationLayer={false} className="shadow-xl border border-gray-200 bg-white" />
                                </Document>
                            </div>
                        ) : (
                            <span className="text-gray-400 text-sm">PDF 파일을 불러오는 중...</span>
                        )}
                    </div>
                    <div className="h-1/3 min-h-[200px] bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm">
                        <div className="px-4 py-2 bg-gray-50 border-b flex justify-between items-center"><span className="text-sm font-bold text-gray-700">📜 AI 추천 대본</span></div>
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <p className="text-gray-800 whitespace-pre-wrap leading-loose text-lg font-medium">{currentScript || "대본 내용이 없습니다."}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 하단 버튼 */}
            <div className="py-4 text-center">
                <button onClick={onReset} className="inline-flex items-center gap-2 text-gray-500 hover:text-red-500 transition text-sm font-medium underline decoration-gray-300 underline-offset-4">
                    <RefreshCcw size={14} /> 다른 파일 업로드하기
                </button>
            </div>
        </div>
    );
}