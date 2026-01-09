"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import nookies, { parseCookies, destroyCookie } from "nookies";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import axios from "axios";

type User = {
  username: string;
  name: string;
  email: string;
  photo?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (formData: FormData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    destroyCookie(null, "token");
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get(`/user/verify`);
      setUser(data.user);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true); // Ensure loading state is set to true at the start
      const { token } = parseCookies();
      if (token) {
        try {
          const { data } = await api.get(`/user/verify`);
          setUser(data.user);
          setIsAuthenticated(true);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            toast.error(error?.response?.data?.message);
          }
          logout();
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [logout]); // Added logout to the dependency array

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post(
        "/user/login",
        { email, password },
        {
          // Add flag to skip interceptor handling
          _skipAuthCheck: true,
        }
      );
      nookies.set(null, "token", data.data.token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      setUser(data.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (formData: FormData) => {
    const { data } = await api.post("/user/signup", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    nookies.set(null, "token", data.data.token, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    setUser(data.data.user);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        isLoading,
        signup,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
