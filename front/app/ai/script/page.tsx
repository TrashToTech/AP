"use client";

import { useEffect, useState } from "react";
import { list } from "@/api/generated/apiClient";
import type { listResponse } from "@/api/generated/apiClient";
import {
    ChevronLeft, Sun, Bell, User, Search, Clock, Archive, Home, LogOut
} from "lucide-react";
import FileUpload from "@/app/components/ai/script/FileUpload";
import MenuItem from "@/app/components/ai/script/MenuItem";

type HistoryItem = { originalName?: string; storedName?: string; id?: number };

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeMenu, setActiveMenu] = useState<"home" | "search" | "recent" | "archive">("home");
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res: listResponse = await list();
                if (res.status === 200 && res.data?.success) {
                    const files = res.data.data ?? [];
                    setHistory(files);
                }
            } catch (err) {
                console.error("Error fetching history", err);
            }
        };
        fetchHistory();
    }, []);

    // 하단 버튼용 공통 스타일
    const bottomBtnClass = "p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors";

    return (
        <div className="flex h-screen bg-white text-gray-800 font-sans">
            {/* 사이드바 영역 */}
            <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-[#F3F4F6] flex flex-col transition-all duration-300 border-r border-gray-200 z-20`}>

                {/* 1. 상단 로고 & 토글 */}
                <div className="flex items-center justify-between p-6 h-16 shrink-0">
                    <h1 className={`text-2xl font-bold whitespace-nowrap overflow-hidden transition-all ${!sidebarOpen && "w-0 opacity-0"}`}>TTT</h1>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-200 rounded ml-auto">
                        <ChevronLeft className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${!sidebarOpen && "rotate-180"}`} />
                    </button>
                </div>

                {/* 2. 네비게이션 (중간 영역 - flex-1로 남은 공간 차지) */}
                <nav className="flex-1 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                    <MenuItem icon={<Home size={20} />} label="홈" isOpen={sidebarOpen} active={activeMenu === "home"} onClick={() => setActiveMenu("home")} />
                    <MenuItem icon={<Search size={20} />} label="검색" isOpen={sidebarOpen} active={activeMenu === "search"} onClick={() => setActiveMenu("search")} />
                    <MenuItem icon={<Clock size={20} />} label="최근" isOpen={sidebarOpen} active={activeMenu === "recent"} onClick={() => setActiveMenu("recent")} />
                    {activeMenu === "recent" && sidebarOpen && (
                        <div className="ml-9 mt-1 space-y-1 mb-2">
                            {history.length === 0 ? <div className="text-xs text-gray-400 pl-2">기록 없음</div> :
                                history.map((h, i) => (
                                    <div key={i} className="text-sm py-1.5 px-2 text-gray-600 rounded hover:bg-gray-200 cursor-pointer transition truncate">
                                        {h.originalName ?? h.storedName ?? "이름 없음"}
                                    </div>
                                ))
                            }
                        </div>
                    )}
                    <MenuItem icon={<Archive size={20} />} label="보관함" isOpen={sidebarOpen} active={activeMenu === "archive"} onClick={() => setActiveMenu("archive")} />
                </nav>

                {/* 3. 하단 유틸리티 버튼 (여기로 이동!) */}
                <div className={`p-4 border-t border-gray-200 shrink-0 flex ${sidebarOpen ? "flex-row justify-around" : "flex-col gap-4 items-center"}`}>
                    <button className={bottomBtnClass} title="테마 변경">
                        <Sun size={20} />
                    </button>
                    <button className={bottomBtnClass} title="알림">
                        <Bell size={20} />
                    </button>
                    <button className={bottomBtnClass} title="마이페이지">
                        <User size={20} />
                    </button>
                </div>
            </aside>

            {/* 메인 영역 */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Header 삭제됨: 이제 FileUpload가 전체 영역을 씀 */}

                {/* FileUpload 컴포넌트 호출 */}
                <div className="flex-1 flex items-center h-full overflow-hidden">
                    <FileUpload
                        onHistoryAdd={(name: string) => setHistory((prev) => [...prev, { originalName: name }])}
                        setSidebarOpen={setSidebarOpen}
                    />
                </div>
            </div>
        </div>
    );
}