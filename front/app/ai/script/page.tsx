"use client";

import { useEffect, useState } from "react";
import { list } from "@/api/generated/apiClient";
import type { listResponse } from "@/api/generated/apiClient";
import {
    ChevronLeft, Sun, Bell, User, Search, Clock, Archive, Home
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

    return (
        <div className="flex h-screen bg-white text-gray-800 font-sans">
            {/* 사이드바 영역 */}
            <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-[#F3F4F6] flex flex-col transition-all duration-300 border-r border-gray-200`}>
                <div className="flex items-center justify-between p-6">
                    <h1 className={`text-2xl font-bold ${!sidebarOpen && "hidden"}`}>TTT</h1>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-200 rounded">
                        <ChevronLeft className={`w-6 h-6 text-gray-500 transition-transform ${!sidebarOpen && "rotate-180"}`} />
                    </button>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <MenuItem icon={<Home size={20} />} label="홈" isOpen={sidebarOpen} active={activeMenu === "home"} onClick={() => setActiveMenu("home")} />
                    <MenuItem icon={<Search size={20} />} label="검색" isOpen={sidebarOpen} active={activeMenu === "search"} onClick={() => setActiveMenu("search")} />
                    <MenuItem icon={<Clock size={20} />} label="최근" isOpen={sidebarOpen} active={activeMenu === "recent"} onClick={() => setActiveMenu("recent")} />
                    {activeMenu === "recent" && sidebarOpen && (
                        <div className="ml-10 mt-2 space-y-1 text-gray-700">
                            {history.length === 0 ? <div className="text-sm text-gray-400">기록이 없습니다.</div> :
                                history.map((h, i) => (
                                    <div key={i} className="text-sm py-1 px-2 rounded hover:bg-gray-200 cursor-pointer transition">
                                        {h.originalName ?? h.storedName ?? "이름 없음"}
                                    </div>
                                ))
                            }
                        </div>
                    )}
                    <MenuItem icon={<Archive size={20} />} label="보관함" isOpen={sidebarOpen} active={activeMenu === "archive"} onClick={() => setActiveMenu("archive")} />
                </nav>
            </aside>

            {/* 메인 영역 */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-end px-6 gap-4">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Sun size={20} /></button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Bell size={20} /></button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><User size={20} /></button>
                </header>
                {/* FileUpload 컴포넌트 호출 */}
                <FileUpload onHistoryAdd={(name: string) => setHistory((prev) => [...prev, { originalName: name }])} />
            </div>
        </div>
    );
}