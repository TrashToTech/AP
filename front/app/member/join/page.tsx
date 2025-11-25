"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

type SignUpForm = {
    username: string;
    password: string;
    passwordConfirm: string;
    email: string;
    nickname: string;
};

export default function SignUpPage() {
    const router = useRouter();
    const [result, setResult] = useState("");
    const [status, setStatus] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<SignUpForm>();

    const onSubmit = async (data: SignUpForm) => {
        if (data.password !== data.passwordConfirm) {
            setResult("비밀번호가 일치하지 않습니다.");
            return;
        }
        try {
            const res = await fetch("http://localhost:8080/api/member/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const body = await res.json();
            if (res.ok) {
                setResult("회원가입에 성공했습니다. 로그인 하세요.");
                setStatus(true);
            } else {
                setResult(body.message || "회원가입에 실패했습니다.");
            }
        } catch (e) {
            setResult("ERROR: " + e);
        }
        return;
    };

    return (
        <main className="min-h-screen flex bg-gray-50">
            {/* 왼쪽: 회원가입 섹션 */}
            <section className="flex-1 flex items-center justify-center bg-white">
                <div className="w-full max-w-md px-4 py-10">
                    <div className="text-3xl mb-7"><strong>T T T</strong> ✨</div>
                    <p className="text-gray-700 mb-9">
                        Create your account.<br />
                        Join us and start your journey!
                    </p>
                    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
                        <label className="block text-sm mb-1 font-medium">ID</label>
                        <input
                            type="text"
                            placeholder="아이디"
                            className="w-full border rounded-lg bg-blue-50 px-4 py-2 mb-4 text-gray-700 focus:outline-none focus:ring"
                            {...register("username", { required: "ID를 입력하세요." })}
                        />
                        {errors.username && (
                            <p className="text-red-600 text-sm mb-3">{errors.username.message}</p>
                        )}
                        <label className="block text-sm mb-1 font-medium">Password</label>
                        <input
                            type="password"
                            placeholder="at least 4 characters"
                            className="w-full border rounded-lg bg-blue-50 px-4 py-2 mb-4 text-gray-700 focus:outline-none focus:ring"
                            {...register("password", {
                                required: "비밀번호를 입력하세요.",
                                minLength: { value: 4, message: "4자 이상 입력하세요." }
                            })}
                        />
                        {errors.password && (
                            <p className="text-red-600 text-sm mb-3">{errors.password.message}</p>
                        )}
                        <label className="block text-sm mb-1 font-medium">Password Confirm</label>
                        <input
                            type="password"
                            placeholder="비밀번호 확인"
                            className="w-full border rounded-lg bg-blue-50 px-4 py-2 mb-4 text-gray-700 focus:outline-none focus:ring"
                            {...register("passwordConfirm", {
                                required: "비밀번호를 다시 입력하세요.",
                                minLength: { value: 4, message: "4자 이상 입력하세요." }
                            })}
                        />
                        {errors.passwordConfirm && (
                            <p className="text-red-600 text-sm mb-3">{errors.passwordConfirm.message}</p>
                        )}
                        <label className="block text-sm mb-1 font-medium">E-mail</label>
                        <input
                            type="email"
                            placeholder="example@email.com"
                            className="w-full border rounded-lg bg-blue-50 px-4 py-2 mb-4 text-gray-700 focus:outline-none focus:ring"
                            {...register("email", {
                                required: "이메일을 입력하세요.",
                                pattern: { value: /\S+@\S+\.\S+/, message: "유효한 이메일을 입력하세요." }
                            })}
                        />
                        {errors.email && (
                            <p className="text-red-600 text-sm mb-3">{errors.email.message}</p>
                        )}
                        <label className="block text-sm mb-1 font-medium">ID</label>
                        <input
                            type="text"
                            placeholder="홍길동"
                            className="w-full border rounded-lg bg-blue-50 px-4 py-2 mb-4 text-gray-700 focus:outline-none focus:ring"
                            {...register("nickname", { required: "닉네임을 입력하세요." })}
                        />
                        {errors.nickname && (
                            <p className="text-red-600 text-sm mb-3">{errors.nickname.message}</p>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold text-base"
                        >
                            Sign up
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/member/login")}
                            className="w-full mt-3 border border-gray-800 hover:bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold text-base"
                        >
                            Sign in
                        </button>
                    </form>
                    {result && (
                        <p className={`mt-4 text-center text-sm ${status ? "text-green-600" : "text-red-600"}`}>{result}</p>
                    )}
                </div>
            </section>
            {/* 오른쪽: 이미지 섹션 */}
            <section className="flex-1 relative hidden md:block">
                <Image
                    src="/universal.jpg"
                    alt="Sign Up Visual"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-none"
                    priority
                />
            </section>
        </main>
    );
}
