import { defineConfig } from "orval";

export default defineConfig({
    api: {
        input: "./lib/backend/type/swagger.json",
        output: {
            target: "./api/generated/apiClient.ts", // 자동 생성될 API 클라이언트
            schemas: "./api/generated/model",       // 스키마 타입 생성 폴더
            client: "fetch",
            clean: true,
            override: {
                mutator: {
                    path: "./lib/fetchWrapper.ts",
                    name: "fetchWrapper",
                },
            },
        },
    },
});
