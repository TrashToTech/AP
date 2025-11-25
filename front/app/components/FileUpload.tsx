"use client";

import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { useForm } from 'react-hook-form';

export default function FileUpload({ onHistoryAdd, token }) {
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState("");
    const [result, setResult] = useState("");
    const { register, handleSubmit, formState: { errors } } = useForm();

    const handleUpload = async () => {
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

            const body = await res.json();
            console.log(body);

            setResult(body);
        } catch (e) {
        }
    };


    return (
        <div>
            <form
                onSubmit={handleUpload}
                className="max-w-lg p-6 bg-white shadow rounded-xl space-y-4"
            >
                <label className="block text-sm font-medium">PDF 파일 선택</label>
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full border p-2 rounded"
                />


                <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    <Upload size={18} /> 업로드하기
                </button>

                {uploadStatus && (
                    <p className="text-sm mt-3 text-gray-700">{uploadStatus}</p>
                )}
            </form>
            <div>
                {result}
            </div>
        </div>
    );
}