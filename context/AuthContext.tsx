import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface User {
  id: string; // אם השרת מחזיר מספר, המירו ל-String לפני שמירה
  firstName: string;
  lastName: string;
  email: string;
}

type AuthStorage = { user: User; token: string };

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: { user: User; token: string }) => Promise<void>;
  logout: () => Promise<void>;
  /**
   * Wrapper around fetch that injects Authorization header.
   * If server returns 401, it auto-logs out and throws an Error.
   */
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit
  ) => Promise<Response>;
}

const STORAGE_KEY = "auth";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // bootstrap from storage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: AuthStorage = JSON.parse(raw);
          setUser(parsed.user);
          setToken(parsed.token);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async ({ user, token }: { user: User; token: string }) => {
    // normalize id to string if needed
    const normalizedUser: User = { ...user, id: String(user.id) };
    setUser(normalizedUser);
    setToken(token);
    const payload: AuthStorage = { user: normalizedUser, token };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const authFetch = useMemo<AuthContextType["authFetch"]>(
    () =>
      async (input, init = {}) => {
        const headers = new Headers(init.headers || {});
        // Always send JSON unless caller overrides
        if (!headers.has("Content-Type"))
          headers.set("Content-Type", "application/json");
        if (token && !headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        const res = await fetch(input, { ...init, headers });

        if (res.status === 401) {
          // Token invalid/expired → auto-logout and surface the error
          await logout();
          throw new Error(
            "Unauthorized (token expired or invalid). Logged out."
          );
        }

        return res;
      },
    [token]
  );

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, authFetch }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
