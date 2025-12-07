"use client";

import { useEffect, useState } from "react";
import FileUpload from "@/app/components/FileUpload";
import { apiFetch } from "@/lib/apiFetch";

type HistoryItem = { originalName?: string; storedName?: string; id?: number };

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [token, setToken] = useState("");

    useEffect(() => {
        const tk = localStorage.getItem("accessToken") ?? "";
        setToken(tk);
    }, []);

    useEffect(() => {
        if (!token) return;

        const fetchHistory = async () => {
            try {
                const body = await apiFetch("/api/file/list", "get");

                if (body && (body as any).success) {
                    setHistory((body as any).data ?? []);
                } else {
                    console.error((body as any)?.message);
                }
            } catch (err) {
                console.error("Error fetching history", err);
            }
        };

        fetchHistory();
    }, [token]);

    console.log("token", token)

    return (
        <div className="flex h-screen bg-gray-100">
            <div className={`${sidebarOpen ? "w-64" : "w-16"} bg-white shadow-xl transition-all duration-300 flex flex-col`}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className={`${sidebarOpen ? "text-lg" : "hidden"} font-semibold`}>기록</h2>
                    <button className="p-2 hover:bg-gray-200 rounded" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? "←" : "→"}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {Array.isArray(history) && history.map((item, idx) => (
                        <div key={idx} className="p-3 bg-gray-100 rounded-lg text-sm cursor-pointer hover:bg-gray-200">
                            {sidebarOpen ? item.originalName ?? "이름 없음" : (item.originalName?.slice(0, 3) || "") + ".."}
                        </div>
                    ))}
                </div>
            </div>

            <main className="flex-1 p-10 overflow-auto">
                <h1 className="text-2xl font-bold mb-6">PDF 업로드</h1>
                <FileUpload
                    onHistoryAdd={(name: string) => setHistory([...history, { originalName: name }])}
                    token={token}
                />
            </main>
        </div>
    );
}
