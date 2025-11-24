"use client";

import { useState } from "react";

export default function JoinPage() {
    const [form, setForm] = useState({
        username: "",
        password: "",
        nickname: "",
        email: "",
    });
    const [result, setResult] = useState("");

    const onChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const onSubmit = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/member/join", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            setResult(JSON.stringify(data, null, 2));
        } catch (e) {
            setResult("ERROR: " + e);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>회원가입 테스트</h2>

            <input placeholder="username" name="username" onChange={onChange} />
            <br />
            <input placeholder="password" name="password" onChange={onChange} />
            <br />
            <input placeholder="nickname" name="nickname" onChange={onChange} />
            <br />
            <input placeholder="email" name="email" onChange={onChange} />
            <br />

            <button onClick={onSubmit}>가입 요청 보내기</button>

            <pre>{result}</pre>
        </div>
    );
}
