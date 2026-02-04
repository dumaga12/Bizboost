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
  isFetchingBusiness: boolean;
  signUp: (email: string, password: string, name: string, role?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateToken: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetchingBusiness, setIsFetchingBusiness] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      if (token && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (parsedUser.role === "business") {
          setIsFetchingBusiness(true);
          await fetchBusiness(parsedUser.id);
          setIsFetchingBusiness(false);
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

  const signUp = async (email: string, password: string, name: string, role?: string) => {
    try {
      await api.post("/auth/register", { email, password, name, role });
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
        setIsFetchingBusiness(true);
        await fetchBusiness(data.user.id);
        setIsFetchingBusiness(false);
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

  const updateToken = (token: string, updatedUser: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    if (updatedUser.role === "business") {
      fetchBusiness(updatedUser.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, business, loading, isFetchingBusiness, signUp, signIn, signOut, updateToken }}>
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
