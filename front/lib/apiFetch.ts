// lib/apiFetch.ts

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiFetch<T = any>(
  url: string,
  method: HttpMethod = "GET",
  options: RequestInit = {}
): Promise<T> {
  let accessToken = localStorage.getItem("accessToken");

  const isFormData = options.body instanceof FormData;

  const makeRequest = async () => {
    return await fetch(url, {
      ...options,
      method,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
      credentials: "include",
    });
  };

  // 1차 요청
  let res = await makeRequest();

  // 401 인증 에러 → refresh token 시도
  if (res.status === 401) {
    const refreshRes = await fetch("/api/auth/reIssue", {
      method: "POST",
      credentials: "include",
    });

    if (!refreshRes.ok) {
      // refresh 실패 → 로그인 페이지
      window.location.href = "/";
      throw new Error("세션 만료 — 다시 로그인 필요");
    }

    // refresh 성공 → accessToken 저장
    const refreshJson = await refreshRes.json();
    accessToken = refreshJson.data.accessToken;
    localStorage.setItem("accessToken", accessToken);

    // 요청 재시도
    res = await makeRequest();
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "API 요청 실패");
  }

  return res.json();
}
