"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthResponse, AuthUser, loginUser, signupUser } from "@/lib/api";

const AUTH_STORAGE_KEY = "commerce-checkout-auth";

type StoredAuth = {
  user: AuthUser;
  token: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isHydrated: boolean;
  login: (input: { email: string; password: string }) => Promise<AuthResponse>;
  signup: (input: { name: string; email: string; password: string }) => Promise<AuthResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);

      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth) as StoredAuth;
        setUser(parsedAuth.user);
        setToken(parsedAuth.token);
      }
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!user || !token) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        user,
        token,
      }),
    );
  }, [isHydrated, token, user]);

  const value = useMemo<AuthContextValue>(() => {
    const login = async (input: { email: string; password: string }) => {
      const response = await loginUser(input);
      setUser(response.user);
      setToken(response.token);
      return response;
    };

    const signup = async (input: { name: string; email: string; password: string }) => {
      const response = await signupUser(input);
      setUser(response.user);
      setToken(response.token);
      return response;
    };

    const logout = () => {
      setUser(null);
      setToken(null);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    };

    return {
      user,
      token,
      isHydrated,
      login,
      signup,
      logout,
    };
  }, [isHydrated, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
