// lib/authFetch.ts
export async function authFetch(url: string, options: any = {}) {
  let accessToken = localStorage.getItem("accessToken");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include", // refreshToken 쿠키 전송
  });

  if (res.status !== 401) {
    return res;
  }

  // accessToken 만료 → refresh 요청
  const refreshRes = await fetch("http://localhost:8080/api/auth/reIssue", {
    method: "POST",
    credentials: "include",
  });

  if (!refreshRes.ok) {
    // refreshToken 만료 → 로그인 페이지로 이동
    window.location.href = "/";
    return;
  }

  const newTokens = await refreshRes.json();

  // 새로운 accessToken 저장
  localStorage.setItem("accessToken", newTokens.accessToken);

  // 재시도
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${newTokens.accessToken}`,
    },
    credentials: "include",
  });
}
