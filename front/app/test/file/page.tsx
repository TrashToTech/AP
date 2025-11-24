"use client";
import { useState, useEffect } from "react";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState("");
    const [token, setToken] = useState("");

    useEffect(() => {
        // client에서만 실행됨
        const tk = localStorage.getItem("accessToken") ?? "";
        setToken(tk);
    }, []);

    const onChange = (e: any) => {
        setFile(e.target.files?.[0] ?? null);
    };

    const onSubmit = async () => {
        if (!file) return alert("파일을 선택하세요.");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:8080/api/file/upload", {
                method: "POST",
                body: formData,
                headers: {
                    "accessToken": token,
                },
            });

            setResult("status: " + res.status);
        } catch (e) {
            setResult("ERROR: " + e);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>파일 업로드 테스트</h2>
            <input type="file" onChange={onChange} />
            <br />
            <button onClick={onSubmit}>파일 업로드</button>
            <pre>{result}</pre>
        </div>
    );
}
