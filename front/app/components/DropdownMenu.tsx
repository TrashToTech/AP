"use client"

import { useState, useRef, useEffect } from "react";

export default function DropdownMenu({ label, items }: { label: string, items: string[] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // 바깥 클릭시 닫기 처리
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        if (open) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div ref={ref} className="relative inline-block text-left">
            <button
                onClick={() => setOpen(!open)}
                className="px-3 py-2 bg-white text-gray-600 hover:bg-gray-50"
            >
                {label}
                <span className="ml-1">▼</span>
            </button>
            {open && (
                <ul className="absolute left-0 mt-2 w-32 bg-white border rounded shadow z-10 text-sm">
                    {items.map(item => (
                        <li
                            key={item}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                            onClick={() => { setOpen(false); /* 선택 동작 추가 */ }}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}