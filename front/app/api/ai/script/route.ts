export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const body = await req.json();
    const controller = new AbortController();
    // 타임아웃 넉넉하게
    const timeout = setTimeout(() => controller.abort(), 100 * 60 * 1000);
    const authHeader = req.headers.get("authorization")
    console.log("🚀 [Next.js Route] 백엔드로 보내는 토큰:", authHeader);

    try {
        const springRes = await fetch("http://localhost:8080/api/ai/script", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader ?? "",
            },
            body: JSON.stringify(body),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        console.log("springRes", springRes)
        // 🛑 핵심: 바로 json() 하지 말고 text()로 먼저 받아서 확인!
        const textData = await springRes.text();

        // 상태 코드가 200이 아니거나, 내용이 HTML(<!doctype...)로 시작하면 에러 처리
        if (!springRes.ok || textData.trim().startsWith("<")) {
            console.error("🔥 Spring 응답 에러 (HTML 내용):", textData); // <-- 로그 확인 필수!
            return Response.json(
                { success: false, message: "Spring 내부 에러 발생", error: "Check Server Logs" },
                { status: springRes.status || 500 }
            );
        }

        // 정상이면 파싱
        const data = JSON.parse(textData);
        return Response.json(data, { status: springRes.status });

    } catch (err) {
        clearTimeout(timeout);
        console.error("Error proxying to Spring:", err);
        return Response.json(
            { success: false, message: "Spring 요청 실패", error: String(err) },
            { status: 500 }
        );
    }
}