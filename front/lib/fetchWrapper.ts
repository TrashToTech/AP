export const fetchWrapper = async (url: string, options: RequestInit = {}) => {
    let accessToken =
        typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    const isFormData = options.body instanceof FormData;

    const makeRequest = async () =>
        await fetch(url, {
            ...options,
            headers: {
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
                Authorization: accessToken ? `Bearer ${accessToken}` : "",
                ...(options.headers || {}),
            },
            credentials: "include",
        });

    let res = await makeRequest();

    if (res.status === 401) {
        const refreshRes = await fetch("/api/auth/reIssue", {
            method: "POST",
            credentials: "include",
        });

        console.log("refreshRes", refreshRes)

        if (!refreshRes.ok) {
            if (typeof window !== "undefined") {
                window.location.href = "/";
            }
            throw new Error("로그인 필요");
        }

        const json = await refreshRes.json();
        console.log("json", json)
        accessToken = json.data.accessToken;

        if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", accessToken);
        }

        res = await makeRequest();
    }

    // ★ orval 포맷으로 통일
    const json = await res.json();
    return {
        data: json,
        status: res.status,
        headers: res.headers,
    };
};