"use client";

import { Upload, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";

type FileForm = {
    file: FileList;
};

export default function FileUpload({ onHistoryAdd, token }) {
    const [status, setStatus] = useState<
        "idle" | "uploading" | "generating" | "done" | "error"
    >("idle");
    const [result, setResult] = useState<any>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<FileForm>();

    const onSubmit = async (data: FileForm) => {
        const file = data.file?.[0];
        if (!file) return alert("PDF 파일을 선택하세요.");

        //---------------------------------------
        // 1) Spring Boot 파일 업로드
        //---------------------------------------
        setStatus("uploading");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const uploadRes = await fetch("http://localhost:8080/api/file/upload", {
                method: "POST",
                body: formData,
                headers: { accessToken: token },
            });

            if (!uploadRes.ok) {
                setStatus("error");
                return;
            }

            const uploaded = await uploadRes.json();

            // 히스토리 저장
            onHistoryAdd(uploaded.originalName ?? file.name);

            //---------------------------------------
            // 2) Spring Boot -> FastAPI 스크립트 생성 요청
            //---------------------------------------
            setStatus("generating");

            const scriptBody = {
                pdfId: uploaded.id,
                pdfName: uploaded.storedName,
            };

            const scriptRes = await fetch("http://localhost:8080/api/ai/script", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": token,
                },
                body: JSON.stringify(scriptBody),
            });

            if (!scriptRes.ok) {
                setStatus("error");
                return;
            }

            const scriptResult = await scriptRes.json();
            setResult(scriptResult);

            setStatus("done");

        } catch (err) {
            setStatus("error");
        }
    };

    const renderStatus = () => {
        switch (status) {
            case "uploading":
                return (
                    <div className="flex items-center gap-2 text-blue-600 mt-3">
                        <Loader2 className="animate-spin" size={18} />
                        파일 업로드 중...
                    </div>
                );
            case "generating":
                return (
                    <div className="flex items-center gap-2 text-purple-600 mt-3">
                        <Loader2 className="animate-spin" size={18} />
                        스크립트 생성 중입니다... (잠시만 기다려주세요)
                    </div>
                );
            case "done":
                return <p className="text-green-600 mt-3">완료되었습니다!</p>;
            case "error":
                return <p className="text-red-600 mt-3">에러가 발생했습니다.</p>;
            default:
                return null;
        }
    };

    return (
        <div>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="max-w-lg p-6 bg-white shadow rounded-xl space-y-4"
            >
                <label className="block text-sm font-medium">PDF 파일 선택</label>

                <input
                    type="file"
                    accept="application/pdf"
                    className="w-full border p-2 rounded"
                    {...register("file", { required: "PDF 파일을 선택하세요." })}
                />

                {errors.file && (
                    <p className="text-red-600 text-sm">{errors.file.message}</p>
                )}

                <button
                    type="submit"
                    disabled={status === "uploading" || status === "generating"}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {status === "uploading" || status === "generating" ? (
                        <>
                            <Loader2 className="animate-spin" size={18} /> 처리 중...
                        </>
                    ) : (
                        <>
                            <Upload size={18} /> 업로드하기
                        </>
                    )}
                </button>

                {renderStatus()}
            </form>

            <div className="mt-4 p-4 bg-gray-100 text-sm rounded-lg">
                {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
            </div>
        </div>
    );
}
