import { login as apiLogin } from "@/services/api/auth";
import { setAuthToken, setUnauthorizedHandler } from "@/services/api/config";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const TOKEN_KEY = "calimali_token";

interface AuthState {
  token: string | null;
  /** True while the persisted token is being read from SecureStore on launch. */
  isRestoring: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const signIn = useCallback(async (username: string, password: string) => {
    const { token: newToken } = await apiLogin(username, password);
    if (!newToken) {
      throw new Error("Login succeeded but no token was returned.");
    }
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setAuthToken(newToken);
    setToken(newToken);
  }, []);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setAuthToken(null);
    setToken(null);
  }, []);

  // Restore a persisted token on launch so the session survives app restarts.
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (stored) {
          setAuthToken(stored);
          setToken(stored);
        }
      } catch (e) {
        console.warn("Failed to restore auth token", e);
      } finally {
        setIsRestoring(false);
      }
    })();
  }, []);

  // Any 401 bubbling up from the API layer signs the user out (→ login screen).
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  return (
    <AuthContext.Provider value={{ token, isRestoring, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
