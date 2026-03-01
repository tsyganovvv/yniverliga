export type UserRole = "employee" | "manager";

export interface SessionUser {
  id: string;
  username: string;
  role?: string | null;
  department_id?: string | null;
  is_active?: boolean;
  created_at?: string;
  fullname?: string | null;
}

interface SaveSessionInput {
  token: string;
  user?: SessionUser | null;
  fallbackRole?: UserRole | null;
}

interface ErrorDetailItem {
  msg?: unknown;
}

interface ErrorPayload {
  detail?: unknown;
  message?: unknown;
}

interface LoginSuccessPayload {
  token?: unknown;
}

const STORAGE_KEYS = {
  token: "authToken",
  role: "userRole",
  user: "sessionUser",
};

const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000"
).replace(/\/+$/, "");

const SESSIONS_ENDPOINT = `${API_BASE_URL}/v1/sessions/`;

const isBrowser = () => typeof window !== "undefined";

const parseMaybeJson = <T>(raw: string | null): T | null => {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const normalizeRole = (role: string | null | undefined): UserRole | null => {
  if (!role) {
    return null;
  }

  const normalized = role.toLowerCase();
  if (normalized.includes("manager")) {
    return "manager";
  }
  if (normalized.includes("employee") || normalized.includes("staff")) {
    return "employee";
  }

  return null;
};

export const getStoredToken = (): string | null => {
  if (!isBrowser()) {
    return null;
  }
  return localStorage.getItem(STORAGE_KEYS.token);
};

export const getStoredRole = (): UserRole | null => {
  if (!isBrowser()) {
    return null;
  }
  return normalizeRole(localStorage.getItem(STORAGE_KEYS.role));
};

export const getStoredUser = (): SessionUser | null => {
  if (!isBrowser()) {
    return null;
  }
  return parseMaybeJson<SessionUser>(localStorage.getItem(STORAGE_KEYS.user));
};

export const saveSession = ({ token, user, fallbackRole }: SaveSessionInput): UserRole | null => {
  if (!isBrowser()) {
    return fallbackRole ?? null;
  }

  localStorage.setItem(STORAGE_KEYS.token, token);

  if (user) {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.user);
  }

  const resolvedRole = normalizeRole(user?.role) ?? fallbackRole ?? null;
  if (resolvedRole) {
    localStorage.setItem(STORAGE_KEYS.role, resolvedRole);
  } else {
    localStorage.removeItem(STORAGE_KEYS.role);
  }

  return resolvedRole;
};

export const clearStoredSession = () => {
  if (!isBrowser()) {
    return;
  }
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.role);
  localStorage.removeItem(STORAGE_KEYS.user);
};

const extractTokenFromHeaders = (headers: Headers): string | null => {
  const directHeader = headers.get("x-auth-token") ?? headers.get("auth-token");
  if (directHeader?.trim()) {
    return directHeader.trim();
  }

  const authorization = headers.get("authorization");
  if (!authorization?.trim()) {
    return null;
  }

  const rawAuth = authorization.trim();
  if (rawAuth.toLowerCase().startsWith("bearer ")) {
    const bearerToken = rawAuth.slice(7).trim();
    return bearerToken || null;
  }

  return rawAuth;
};

const getErrorMessage = async (response: Response): Promise<string> => {
  const fallback = `Request failed (${response.status})`;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return fallback;
  }

  const payload = (await response.json().catch(() => null)) as ErrorPayload | null;
  if (!payload) {
    return fallback;
  }

  if (typeof payload.detail === "string" && payload.detail.trim()) {
    return payload.detail;
  }

  if (Array.isArray(payload.detail) && payload.detail.length > 0) {
    const firstError = payload.detail[0] as ErrorDetailItem;
    if (typeof firstError?.msg === "string" && firstError.msg.trim()) {
      return firstError.msg;
    }
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  return fallback;
};

export const createSession = async (
  username: string,
  password: string,
): Promise<{ token: string }> => {
  const response = await fetch(SESSIONS_ENDPOINT, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const tokenFromHeaders = extractTokenFromHeaders(response.headers);
  if (tokenFromHeaders) {
    return { token: tokenFromHeaders };
  }

  const payload = (await response.json().catch(() => null)) as LoginSuccessPayload | null;
  const tokenFromBody =
    typeof payload?.token === "string" && payload.token.trim() ? payload.token.trim() : null;
  const token = tokenFromBody;
  if (!token) {
    throw new Error("Server did not return a session token");
  }

  return { token };
};

export const fetchCurrentSessionUser = async (token: string): Promise<SessionUser> => {
  const response = await fetch(SESSIONS_ENDPOINT, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const user = (await response.json()) as SessionUser;
  if (!user || typeof user !== "object" || typeof user.id !== "string" || !user.id.trim()) {
    throw new Error("Invalid session user payload");
  }

  return user;
};
