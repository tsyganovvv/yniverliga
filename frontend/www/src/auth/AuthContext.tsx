import type { AppRole, AuthSession } from "./types";
import { clearSession, loadSession, saveSession } from "./storage";
import { getUserBySession, loginWithSessions } from "./sessionApi";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type AuthContextValue = {
  session: AuthSession | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (params: { username: string; password: string; appRole: AppRole }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function fallbackRoleByUserRole(rawRole: string | undefined): AppRole {
  const role = rawRole?.toUpperCase();
  if (role === "ADMIN" || role === "ROOT" || role === "MANAGER") {
    return "manager";
  }
  return "employee";
}

export function getHomePath(appRole: AppRole): string {
  return appRole === "manager" ? "/dashboard" : "/team";
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      const saved = loadSession();
      if (!saved) {
        setIsReady(true);
        return;
      }

      try {
        const user = await getUserBySession(saved.token);
        const restored: AuthSession = {
          token: saved.token,
          user,
          appRole: saved.appRole ?? fallbackRoleByUserRole(user.role),
        };

        saveSession(restored);
        setSession(restored);
      } catch {
        clearSession();
        setSession(null);
      } finally {
        setIsReady(true);
      }
    };

    void restoreSession();
  }, []);

  const login = useCallback(
    async (params: { username: string; password: string; appRole: AppRole }) => {
      const token = await loginWithSessions({
        username: params.username,
        password: params.password,
      });
      const user = await getUserBySession(token);

      const nextSession: AuthSession = {
        token,
        user,
        appRole: params.appRole,
      };

      saveSession(nextSession);
      setSession(nextSession);
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isReady,
      isAuthenticated: Boolean(session),
      login,
      logout,
    }),
    [session, isReady, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
