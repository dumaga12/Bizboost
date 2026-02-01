import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/api/axios";

interface Business {
  id: string;
  business_name: string;
  verification_status: string;
}

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  points?: number;
}

interface AuthContextType {
  user: User | null;
  business: Business | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      if (token && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (parsedUser.role === "business") {
          fetchBusiness(parsedUser.id);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const fetchBusiness = async (userId: number) => {
    try {
      const { data } = await api.get("/business/me");
      setBusiness(data);
    } catch (err) {
      console.error("Fetch business error:", err);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      await api.post("/auth/register", { email, password, name });
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      if (data.user.role === "business") {
        fetchBusiness(data.user.id);
      }
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || error.message };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setBusiness(null);
  };

  return (
    <AuthContext.Provider value={{ user, business, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
