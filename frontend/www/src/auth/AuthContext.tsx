import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearStoredSession,
  createSession,
  fetchCurrentSessionUser,
  getStoredRole,
  getStoredToken,
  getStoredUser,
  saveSession,
  type SessionUser,
  type UserRole,
} from "./session";

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  isInitializing: boolean;
  isAuthenticated: boolean;
  token: string | null;
  role: UserRole | null;
  user: SessionUser | null;
  login: (username: string, password: string, fallbackRole: UserRole) => Promise<UserRole>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedRole = getStoredRole();
    const storedUser = getStoredUser();

    if (!storedToken) {
      setStatus("anonymous");
      return;
    }

    let disposed = false;

    const hydrateSession = async () => {
      try {
        const freshUser = await fetchCurrentSessionUser(storedToken);
        if (disposed) {
          return;
        }

        const resolvedRole = saveSession({
          token: storedToken,
          user: freshUser,
          fallbackRole: storedRole,
        });

        setToken(storedToken);
        setUser(freshUser);
        setRole(resolvedRole);
        setStatus("authenticated");
      } catch {
        if (disposed) {
          return;
        }

        clearStoredSession();
        setToken(null);
        setRole(null);
        setUser(null);
        setStatus("anonymous");
      }
    };

    setToken(storedToken);
    setRole(storedRole);
    setUser(storedUser);
    hydrateSession();

    return () => {
      disposed = true;
    };
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setToken(null);
    setRole(null);
    setUser(null);
    setStatus("anonymous");
  }, []);

  const login = useCallback(
    async (username: string, password: string, fallbackRole: UserRole): Promise<UserRole> => {
      const { token: newToken } = await createSession(username, password);

      let currentUser: SessionUser | null = null;
      try {
        currentUser = await fetchCurrentSessionUser(newToken);
      } catch {
        currentUser = null;
      }

      const resolvedRole = saveSession({
        token: newToken,
        user: currentUser,
        fallbackRole,
      });

      setToken(newToken);
      setUser(currentUser);
      setRole(resolvedRole ?? fallbackRole);
      setStatus("authenticated");

      return resolvedRole ?? fallbackRole;
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isInitializing: status === "loading",
      isAuthenticated: status === "authenticated",
      token,
      role,
      user,
      login,
      logout,
    }),
    [login, logout, role, status, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
