export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const body = await req.json();

    // timeout 100분 (임시)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 100 * 60 * 1000);


    try {
        const springRes = await fetch("http://localhost:8080/api/ai/script", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // 필요하면 토큰도 같이 전달 가능
                Authorization: req.headers.get("authorization") ?? "",
            },
            body: JSON.stringify(body),
            signal: controller.signal,
            // Node fetch는 기본 타임아웃 없음 → 무한대
        });

        // timeout 100분 (임시)
        clearTimeout(timeout);


        const data = await springRes.json();
        return Response.json(data, { status: springRes.status });
    } catch (err) {
        // timeout 100분 (임시)
        clearTimeout(timeout);

        console.error("Error proxying to Spring:", err);

        return Response.json(
            { success: false, message: "Spring 요청 실패", error: String(err) },
            { status: 500 }
        );
    }
}
