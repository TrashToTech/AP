"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { apiFetch } from "@/lib/apiFetch";

type LoginForm = {
    username: string;
    password: string;
};

export default function LoginPage() {
    const router = useRouter();
    const [result, setResult] = useState("");
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

    const onSubmit = async (form: LoginForm) => {
        try {
            const body = await apiFetch("/api/auth/login", "post", {
                body: JSON.stringify(form),
            });

            // body: ApiResponse<{ accessToken: string }>
            if (body && (body as any).success) {
                const token = (body as any).data?.accessToken;
                if (token) localStorage.setItem("accessToken", token);
                router.replace("/ai/script");
            } else {
                setResult((body as any)?.message ?? "Login failed");
            }
        } catch (e: any) {
            setResult("ERROR: " + (e?.message ?? e));
        }
    };

    return (
        <main className="min-h-screen flex bg-gray-50">
            <section className="flex-1 flex items-center justify-center bg-white">
                <div className="w-full max-w-md px-4 py-10">
                    <div className="text-3xl mb-7"><strong>T T T</strong> 👋</div>
                    <p className="text-gray-700 mb-9">
                        Today is a new day. It's your day. You shape it.<br />
                        Sign in to start managing your projects.
                    </p>

                    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
                        <label className="block text-sm mb-1 font-medium">ID</label>
                        <input type="text" placeholder="Example" className="w-full border rounded-lg bg-blue-50 px-4 py-2 mb-4" {...register("username", { required: "ID를 입력하세요." })} />
                        {errors.username && <p className="text-red-600 text-sm mb-3">{errors.username.message}</p>}

                        <label className="block text-sm mb-1 font-medium">Password</label>
                        <input type="password" placeholder="at least 8 characters" className="w-full border rounded-lg bg-blue-50 px-4 py-2 mb-4" {...register("password", { required: "비밀번호를 입력하세요." })} />
                        {errors.password && <p className="text-red-600 text-sm mb-3">{errors.password.message}</p>}

                        <div className="flex justify-end mb-4">
                            <a href="#" className="text-xs text-blue-600 hover:underline">Forgot Password?</a>
                        </div>

                        <button type="submit" className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold text-base">Sign in</button>
                        <button type="button" onClick={() => router.push("/member/join")} className="w-full mt-3 border border-gray-800 hover:bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold text-base">Sign up</button>
                    </form>

                    {result && <p className="mt-4 text-center text-sm text-red-600">{result}</p>}

                    <div className="flex items-center my-10 w-full">
                        <hr className="flex-grow border-gray-200" />
                        <span className="mx-2 text-gray-400 text-sm">Or</span>
                        <hr className="flex-grow border-gray-200" />
                    </div>

                    <div className="w-full space-y-3">
                        <button className="w-full flex items-center justify-center gap-3 bg-cyan-50 rounded-lg py-2 hover:bg-gray-200 text-gray-700 font-semibold">
                            <img src="/google.svg" alt="Google" className="w-6 h-6" />
                            Sign in with Google
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm text-gray-600">Don't you have an account? <a href="#" className="text-blue-600 hover:underline">Sign up</a></p>
                </div>
            </section>

            <section className="flex-1 relative hidden md:block">
                <Image src="/universal.jpg" alt="Login Visual" fill style={{ objectFit: "cover" }} priority />
            </section>
        </main>
    );
}
