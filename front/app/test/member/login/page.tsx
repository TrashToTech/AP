"use client";

import { useState } from "react";

export default function LoginPage() {
    const [form, setForm] = useState({
        username: "",
        password: "",
    });
    const [result, setResult] = useState("");

    const onChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const onSubmit = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                // accessToken 로컬스토리지에 저장
                localStorage.setItem("accessToken", data.accessToken);
                setResult("로그인 성공! 토큰 저장됨:\n" + data.accessToken);
            } else {
                setResult("로그인 실패: " + JSON.stringify(data));
            }

        } catch (e) {
            setResult("ERROR: " + e);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>로그인 테스트 (localStorage 저장)</h2>

            <input
                placeholder="username"
                name="username"
                onChange={onChange}
            />
            <br />

            <input
                placeholder="password"
                name="password"
                type="password"
                onChange={onChange}
            />
            <br />

            <button onClick={onSubmit}>로그인 요청</button>

            <pre>{result}</pre>
        </div>
    );
}
