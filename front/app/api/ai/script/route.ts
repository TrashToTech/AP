export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const body = await req.json();
    const controller = new AbortController();
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

        const textData = await springRes.text();

        if (!springRes.ok || textData.trim().startsWith("<")) {
            console.error("🔥 Spring 응답 에러 (HTML 내용):", textData);
            return Response.json(
                { success: false, message: "Spring 내부 에러 발생", error: "Check Server Logs" },
                { status: springRes.status || 500 }
            );
        }

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