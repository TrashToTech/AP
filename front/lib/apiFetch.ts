// lib/apiFetch.ts
import type { paths } from "@/lib/backend/type/schema";

type HttpMethod = "get" | "post" | "put" | "delete" | "patch";

export async function apiFetch<
  TPath extends keyof paths,
  TMethod extends keyof paths[TPath] & HttpMethod,
  TResponse = paths[TPath][TMethod] extends {
    responses: { 200: infer R };
  }
  ? R
  : unknown
>(
  url: TPath,
  method: TMethod,
  options: RequestInit = {}
): Promise<TResponse> {
  let accessToken = localStorage.getItem("accessToken");
  console.log("accessToken = " + accessToken)

  const isFormData = options.body instanceof FormData;

  const makeRequest = async () =>
    await fetch(url, {
      ...options,
      method: method.toUpperCase(),
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
      credentials: "include",
    });

  let res = await makeRequest();
  console.log("status", res.status)

  if (res.status === 401) {
    console.log("여기")
    // 리프레시 시도
    const refreshRes = await fetch("/api/auth/reIssue", {
      method: "POST",
      credentials: "include",
    });
    console.log("여기")

    if (!refreshRes.ok) {
      window.location.href = "/";
      throw new Error("세션 만료 — 다시 로그인 필요");
    }

    const refreshJson = await refreshRes.json();

    accessToken = refreshJson.data.accessToken;
    localStorage.setItem("accessToken", accessToken);

    // 재시도
    res = await makeRequest();
  }

  return res.json();
}
