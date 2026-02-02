import React, { ReactNode, useEffect, useState } from "react";

// Importamos la estructura desde el otro archivo
import { AuthContext, AuthContextType } from "@/contexts/AuthContext";
import {
  clearCredentials,
  login as loginService,
  LoginCredentials,
  logout as logoutService,
  register as registerService,
  RegisterData,
  User,
} from "@/services/authService";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const storedCredentials = sessionStorage.getItem("authCredentials");

    if (storedUser && storedCredentials) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error al recuperar sesión:", error);
        clearCredentials();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const loggedUser = await loginService(credentials);
      setUser(loggedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      await registerService(data);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await logoutService();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !!sessionStorage.getItem("authCredentials"),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
