"use client";

import { Upload, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

type FileForm = {
    file: FileList;
};

export default function FileUpload({ onHistoryAdd, token }: { onHistoryAdd: (name: string) => void; token?: string }) {
    const [status, setStatus] = useState<"idle" | "uploading" | "generating" | "done" | "error">("idle");
    const [result, setResult] = useState<any>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<FileForm>();

    const onSubmit = async (data: FileForm) => {
        const file = data.file?.[0];
        if (!file) return alert("PDF 파일을 선택하세요.");

        setStatus("uploading");

        const formData = new FormData();
        formData.append("file", file);

        try {
            // FormData 전송: apiFetch는 FormData일 때 Content-Type을 자동으로 생략함
            const uploadBody = await apiFetch("/api/file/upload", "post", {
                method: "post",
                body: formData,
            });

            if (!uploadBody || !(uploadBody as any).success) {
                setStatus("error");
                return;
            }

            const uploaded = (uploadBody as any).data;
            onHistoryAdd(uploaded.originalName ?? file.name);

            setStatus("generating");

            const scriptBody = {
                pdfId: uploaded.pdfId ?? uploaded.id,
                pdfName: uploaded.storedName,
            };

            const scriptRes = await apiFetch("/api/ai/script", "post", {
                body: JSON.stringify(scriptBody),
            });

            console.log("scriptRes", scriptRes)

            if (!scriptRes || !(scriptRes as any).success) {
                setStatus("error");
                return;
            }

            setResult((scriptRes as any).data);
            setStatus("done");
        } catch (err) {
            console.error("upload error", err);
            setStatus("error");
        }
    };

    const renderStatus = () => {
        switch (status) {
            case "uploading":
                return (<div className="flex items-center gap-2 text-blue-600 mt-3"><Loader2 className="animate-spin" size={18} />파일 업로드 중...</div>);
            case "generating":
                return (<div className="flex items-center gap-2 text-purple-600 mt-3"><Loader2 className="animate-spin" size={18} />스크립트 생성 중입니다... (잠시만 기다려주세요)</div>);
            case "done": return <p className="text-green-600 mt-3">완료되었습니다!</p>;
            case "error": return <p className="text-red-600 mt-3">에러가 발생했습니다.</p>;
            default: return null;
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg p-6 bg-white shadow rounded-xl space-y-4">
                <label className="block text-sm font-medium">PDF 파일 선택</label>

                <input type="file" accept="application/pdf" className="w-full border p-2 rounded" {...register("file", { required: "PDF 파일을 선택하세요." })} />
                {errors.file && <p className="text-red-600 text-sm">{errors.file.message}</p>}

                <button type="submit" disabled={status === "uploading" || status === "generating"} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                    {status === "uploading" || status === "generating" ? (<><Loader2 className="animate-spin" size={18} /> 처리 중...</>) : (<><Upload size={18} /> 업로드하기</>)}
                </button>

                {renderStatus()}
            </form>

            <div className="mt-4 p-4 bg-gray-100 text-sm rounded-lg">
                {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
            </div>
        </div>
    );
}
