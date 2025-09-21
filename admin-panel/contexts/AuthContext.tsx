"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api"; 
import Cookies from "js-cookie";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  cnic: string;
  roles: string[];
  createdAt: string;
  registeredAt: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedToken = Cookies.get("access_token");
    if (savedToken) {
      setToken(savedToken);
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      console.log("[LOGIN] ", res.data);
      const accessToken = res.data.access_token;

      // Save in cookie instead of localStorage
      Cookies.set("access_token", accessToken, { secure: true, sameSite: "strict" });

      setToken(accessToken);
      await fetchProfile();
    } catch (err) {
      console.error("[LOGIN ERROR]", err);
      throw err;
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/me");
      const fetchedUser: User = res.data;

      if (fetchedUser.roles.includes("ADMIN")) {
        setUser(fetchedUser);
        setIsAuthenticated(true);
      } else {
        console.warn("[AUTH] Non-admin detected → logout");
        logout();
      }
    } catch (err) {
      console.error("[PROFILE ERROR]", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove("access_token");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, loading, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
