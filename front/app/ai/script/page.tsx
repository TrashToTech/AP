"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { list } from "@/api/generated/apiClient";
import type { listResponse } from "@/api/generated/apiClient";
import {
    ChevronLeft, Sun, Bell, User, Search, Clock, Archive, Home, Loader2
} from "lucide-react";
import FileUpload from "@/app/components/ai/script/FileUpload";
import MenuItem from "@/app/components/ai/script/MenuItem";
import useFileUpload from "@/app/components/ai/script/hook/UseFileUpload";

// ScriptView 동적 임포트
const ScriptView = dynamic(() => import("@/app/components/ai/script/ScriptView"), {
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-blue-500" size={40} /></div>,
});

export type HistoryItem = { originalName?: string; storedName?: string; pdfId?: number };

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeMenu, setActiveMenu] = useState<"home" | "search" | "recent" | "archive">("home");
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const fileUploadHook = useFileUpload(
        (name: string) => setHistory((prev) => [...prev, { originalName: name }]),
        () => setSidebarOpen(false)
    );

    const bottomBtnClass = "p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors";

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res: listResponse = await list();
                if (res.status === 200 && res.data?.success) {
                    setHistory(res.data.data ?? []);
                }
            } catch (err) {
                console.error("Error fetching history", err);
            }
        };
        fetchHistory();
    }, []);

    const handleHistoryClick = (item: HistoryItem) => {
        if (item.pdfId) {
            console.log("History Clicked ID:", item.pdfId);
            const displayName = item.storedName ?? item.originalName ?? "문서";
            fileUploadHook.loadFromHistory(item.pdfId, displayName);
        }
    };

    const handleGoHome = () => {
        setActiveMenu("home");
        fileUploadHook.reset();
    };

    return (
        <div className="flex h-screen bg-white text-gray-800 font-sans">
            {/* 사이드바 영역 */}
            <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-[#F3F4F6] flex flex-col transition-all duration-300 border-r border-gray-200 z-20`}>
                <div className="flex items-center justify-between p-6 h-16 shrink-0">
                    <h1 className={`text-2xl font-bold whitespace-nowrap overflow-hidden transition-all ${!sidebarOpen && "w-0 opacity-0"}`}>TTT</h1>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-200 rounded ml-auto">
                        <ChevronLeft className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${!sidebarOpen && "rotate-180"}`} />
                    </button>
                </div>

                <nav className="flex-1 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                    <MenuItem icon={<Home size={20} />} label="홈" isOpen={sidebarOpen} active={activeMenu === "home"} onClick={handleGoHome} />
                    <MenuItem icon={<Search size={20} />} label="검색" isOpen={sidebarOpen} active={activeMenu === "search"} onClick={() => setActiveMenu("search")} />
                    <MenuItem icon={<Clock size={20} />} label="최근" isOpen={sidebarOpen} active={activeMenu === "recent"} onClick={() => setActiveMenu("recent")} />

                    {activeMenu === "recent" && sidebarOpen && (
                        <div className="ml-9 mt-1 space-y-1 mb-2">
                            {history.length === 0 ? <div className="text-xs text-gray-400 pl-2">기록 없음</div> :
                                history.map((h, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleHistoryClick(h)}
                                        className="text-sm py-1.5 px-2 text-gray-600 rounded hover:bg-gray-200 cursor-pointer transition truncate"
                                        title={h.originalName}
                                    >
                                        {h.originalName ?? h.storedName ?? "이름 없음"}
                                    </div>
                                ))
                            }
                        </div>
                    )}
                    <MenuItem icon={<Archive size={20} />} label="보관함" isOpen={sidebarOpen} active={activeMenu === "archive"} onClick={() => setActiveMenu("archive")} />
                </nav>

                <div className={`p-4 border-t border-gray-200 shrink-0 flex ${sidebarOpen ? "flex-row justify-around" : "flex-col gap-4 items-center"}`}>
                    <button className={bottomBtnClass}><Sun size={20} /></button>
                    <button className={bottomBtnClass}><Bell size={20} /></button>
                    <button className={bottomBtnClass}><User size={20} /></button>
                </div>
            </aside>

            {/* 메인 영역 */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                <div className="flex-1 h-full overflow-hidden">
                    {/* 상태에 따라 화면 전환 */}
                    {fileUploadHook.status === "done" && fileUploadHook.result && fileUploadHook.storedFileName ? (
                        <ScriptView
                            result={fileUploadHook.result}
                            storedFileName={fileUploadHook.storedFileName}
                            onReset={fileUploadHook.reset}
                        />
                    ) : (
                        <FileUpload {...fileUploadHook} />
                    )}
                </div>
            </div>
        </div>
    );
}