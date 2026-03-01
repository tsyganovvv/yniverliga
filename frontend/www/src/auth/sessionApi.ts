import type { SessionUser } from "./types";

const rawBaseUrl = import.meta.env.VITE_AUTH_API_URL ?? "http://localhost:8000";
const authBaseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
const sessionsUrl = `${authBaseUrl}/v1/sessions/`;

type LoginPayload = {
  username: string;
  password: string;
};

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data === "string") {
      return data;
    }
    if (data && typeof data.detail === "string") {
      return data.detail;
    }
    if (data && typeof data.message === "string") {
      return data.message;
    }
  } catch {
    // ignore invalid json
  }

  return response.statusText || `HTTP ${response.status}`;
}

function extractBearerToken(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.toLowerCase().startsWith("bearer ")) {
    const token = trimmed.slice(7).trim();
    return token || null;
  }

  return trimmed;
}

function extractTokenFromHeaders(headers: Headers): string | null {
  return (
    extractBearerToken(headers.get("x-auth-token")) ||
    extractBearerToken(headers.get("auth-token")) ||
    extractBearerToken(headers.get("authorization"))
  );
}

export async function loginWithSessions(payload: LoginPayload): Promise<string> {
  const response = await fetch(sessionsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const token = extractTokenFromHeaders(response.headers);
  if (!token) {
    throw new Error(
      "Токен не получен из заголовков ответа. Проверьте CORS (Access-Control-Expose-Headers).",
    );
  }

  return token;
}

export async function getUserBySession(token: string): Promise<SessionUser> {
  const response = await fetch(sessionsUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as SessionUser;
}
