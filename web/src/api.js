export async function apiRequest(path, options = {}) {
  const response = await fetch(path, options);
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("서버 응답을 읽을 수 없습니다.");
  }
  if (!response.ok || !result.success) {
    throw new Error(result.message || "요청을 처리하지 못했습니다.");
  }
  return result.data;
}

export function authHeaders(session) {
  return { Authorization: `Bearer ${session.accessToken}` };
}
