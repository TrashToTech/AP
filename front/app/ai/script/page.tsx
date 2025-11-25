"use client";

import { useEffect, useState } from "react";
import FileUpload from "@/app/components/FileUpload";

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [history, setHistory] = useState([]);
    const [token, setToken] = useState("");

    useEffect(() => {
        const tk = localStorage.getItem("accessToken") ?? "";
        setToken(tk);
        console.log(tk);
    }, []);

    useEffect(() => {
        if (!token) return;

        const fetchHistory = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/file/list", {
                    method: "GET",
                    headers: {
                        "accessToken": token,
                    },
                });

                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

                const data = await res.json();
                setHistory(data);
            } catch (err) {
                console.error("Error fetching history", err);
            }
        };

        fetchHistory();
    }, [token]);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div
                className={`${sidebarOpen ? "w-64" : "w-16"} bg-white shadow-xl transition-all duration-300 flex flex-col`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className={`${sidebarOpen ? "text-lg" : "hidden"} font-semibold`}>기록</h2>
                    <button
                        className="p-2 hover:bg-gray-200 rounded"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? "←" : "→"}
                    </button>
                </div>

                {/* Sidebar List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {history.map((item, idx) => (
                        <div
                            key={idx}
                            className="p-3 bg-gray-100 rounded-lg text-sm cursor-pointer hover:bg-gray-200"
                        >
                            {/* item이 객체이므로 원하는 필드를 꺼내서 표시 */}
                            {sidebarOpen
                                ? item.originalName   // 예: 파일 이름 표시
                                : (item.originalName?.slice(0, 3) || "") + ".."}
                        </div>
                    ))}
                </div>
            </div>
            {/* Main Content */}
            <main className="flex-1 p-10 overflow-auto">
                <h1 className="text-2xl font-bold mb-6">PDF 업로드</h1>
                <FileUpload
                    onHistoryAdd={(name) => setHistory([...history, { originalName: name }])}
                    token={token}
                />
            </main>
        </div>
    );
}
