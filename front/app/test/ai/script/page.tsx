"use client";

import { useState } from "react";

export default function ScriptPage() {
    const [pdfName, setPdfName] = useState("");
    const [result, setResult] = useState("");

    const onSubmit = async () => {
        if (!pdfName) {
            alert("pdfName(UUID 파일명)을 입력하세요.");
            return;
        }

        const formData = new FormData();
        formData.append("pdfName", pdfName);

        try {
            const res = await fetch("http://localhost:8080/api/ai/script", {
                method: "POST",
                body: formData,
                headers: {
                    "accessToken": "" + localStorage.getItem("accessToken"),
                },
            });

            const data = await res.json();
            setResult(JSON.stringify(data, null, 2));
        } catch (e) {
            setResult("ERROR: " + e);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>AI Script 생성 테스트</h2>

            <p>업로드된 PDF의 UUID 파일명을 입력하세요.</p>

            <input
                placeholder="예: a82f-2b3c-44aa.pdf"
                value={pdfName}
                onChange={(e) => setPdfName(e.target.value)}
                style={{ width: 300 }}
            />

            <br /><br />
            <button onClick={onSubmit}>스크립트 생성 요청</button>

            <pre style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>
                {result}
            </pre>
        </div>
    );
}
