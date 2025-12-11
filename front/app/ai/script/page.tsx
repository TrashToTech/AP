"use client";

import { useEffect, useState } from "react";
import FileUpload from "@/app/components/FileUpload";
import { list } from "@/api/generated/apiClient";
import type { listResponse } from "@/api/generated/apiClient";
import {
    ChevronLeft,
    Sun,
    Bell,
    User,
    Search,
    Clock,
    Archive,
    Home
} from "lucide-react"; // 아이콘 사용을 위해 lucide-react가 필요합니다.

type HistoryItem = { originalName?: string; storedName?: string; id?: number };

export default function AppLayout() {
    // 사이드바 상태 (이미지상 열려있음)
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeMenu, setActiveMenu] = useState<"home" | "search" | "recent" | "archive">("home");

    const [history, setHistory] = useState<HistoryItem[]>([]);

    // 기존 데이터 페칭 로직 유지 (데이터는 가져오되 UI는 디자인 시안을 따름)
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
            {/* --- 사이드바 영역 --- */}
            <aside
                className={`${sidebarOpen ? "w-64" : "w-20"
                    } bg-[#F3F4F6] flex flex-col transition-all duration-300 border-r border-gray-200`}
            >
                {/* 로고 & 접기 버튼 */}
                <div className="flex items-center justify-between p-6">
                    <h1 className={`text-2xl font-bold ${!sidebarOpen && "hidden"}`}>TTT</h1>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-200 rounded">
                        <ChevronLeft className={`w-6 h-6 text-gray-500 transition-transform ${!sidebarOpen && "rotate-180"}`} />
                    </button>
                </div>

                {/* 메뉴 리스트 (디자인 시안 적용) */}
                <nav className="flex-1 px-4 space-y-2">
                    <MenuItem
                        icon={<Home size={20} />}
                        label="홈"
                        isOpen={sidebarOpen}
                        active={activeMenu === "home"}
                        onClick={() => setActiveMenu("home")}
                    />
                    <MenuItem
                        icon={<Search size={20} />}
                        label="검색"
                        isOpen={sidebarOpen}
                        active={activeMenu === "search"}
                        onClick={() => setActiveMenu("search")}
                    />
                    <MenuItem
                        icon={<Clock size={20} />}
                        label="최근"
                        isOpen={sidebarOpen}
                        active={activeMenu === "recent"}
                        onClick={() => setActiveMenu("recent")}
                    />
                    {/* ▼▼▼ “최근” 메뉴 클릭 시 history 출력 ▼▼▼ */}
                    {activeMenu === "recent" && sidebarOpen && (
                        <div className="ml-10 mt-2 space-y-1 text-gray-700">
                            {history.length === 0 ? (
                                <div className="text-sm text-gray-400">기록이 없습니다.</div>
                            ) : (
                                history.map((h, i) => (
                                    <div
                                        key={i}
                                        className="text-sm py-1 px-2 rounded hover:bg-gray-200 cursor-pointer transition"
                                    >
                                        {h.originalName ?? h.storedName ?? "이름 없음"}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    <MenuItem
                        icon={<Archive size={20} />}
                        label="보관함"
                        isOpen={sidebarOpen}
                        active={activeMenu === "archive"}
                        onClick={() => setActiveMenu("archive")}
                    />
                </nav>
            </aside>

            {/* --- 메인 영역 --- */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* 상단 헤더 */}
                <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-end px-6 gap-4">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <Sun size={20} />
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <Bell size={20} />
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <User size={20} />
                    </button>
                </header>

                {/* 메인 컨텐츠 */}
                <main className="flex-1 overflow-auto flex flex-col items-center pt-20 pb-10 px-4 bg-white">
                    {/* 메인 타이틀 */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold leading-tight text-black">
                            방대한 정보에서 맞춤형 대본을 전달드립니다.<br />
                            업로드하여 확인해 보세요!
                        </h2>
                    </div>

                    {/* 업로드 컴포넌트 영역 */}
                    <div className="w-full max-w-4xl">
                        <FileUpload
                            onHistoryAdd={(name: string) =>
                                setHistory((prev) => [...prev, { originalName: name }])
                            }
                        />
                    </div>

                    {/* 하단 버튼 예시 (디자인 시안의 파란 버튼들) */}
                    <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
                        <button className="w-full py-3 bg-blue-300 text-white font-bold rounded-lg hover:bg-blue-400 transition shadow-sm">
                            다음
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}

// 사이드바 메뉴 아이템 컴포넌트
function MenuItem({ icon, label, isOpen, active = false, onClick }: {
    icon: React.ReactNode,
    label: string,
    isOpen: boolean,
    active?: boolean,
    onClick?: () => void
}) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors 
                ${active ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}
        >
            <div>{icon}</div>
            {isOpen && <span className="font-medium text-sm">{label}</span>}
        </div>
    )
}