import { AlertCircle, FileText, Loader2, Upload } from "lucide-react";

export default function FileSelectSection({
    selectedFile, status, errorMsg, onFileChange, onSubmit
}: {
    selectedFile: File | null,
    status: string,
    errorMsg: string | null,
    onFileChange: (f: File | null) => void,
    onSubmit: () => void
}) {
    const isLoading = status === "uploading" || status === "generating";

    return (
        <div className="flex-1 flex flex-col justify-center space-y-6">
            <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500">PDF 파일 선택</label>
                <div className="relative group">
                    <input
                        type="file"
                        accept="application/pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                            if (e.target.files?.length) onFileChange(e.target.files[0]);
                        }}
                        disabled={isLoading}
                    />
                    <div className={`w-full border rounded px-4 py-3 bg-white text-sm flex justify-between items-center transition-colors
                        ${errorMsg ? "border-red-300 bg-red-50" : "border-gray-300 group-hover:border-blue-400"}
                    `}>
                        <span className={`truncate max-w-[200px] ${selectedFile ? "text-gray-800" : "text-gray-400"}`}>
                            {selectedFile ? selectedFile.name : "파일 선택 (선택된 파일 없음)"}
                        </span>
                        {selectedFile && <FileText size={16} className="text-blue-500" />}
                    </div>
                </div>
                {errorMsg && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1 animate-pulse">
                        <AlertCircle size={12} />
                        <span>{errorMsg}</span>
                    </div>
                )}
            </div>

            <button
                onClick={onSubmit}
                disabled={isLoading}
                className="w-fit bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-bold flex items-center gap-2 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <> <Loader2 className="animate-spin" size={16} /> 처리 중... </>
                ) : (
                    <> <Upload size={16} /> 업로드하기 </>
                )}
            </button>
        </div>
    );
}