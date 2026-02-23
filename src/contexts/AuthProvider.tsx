import { ReactNode, useEffect, useState } from "react";

import {
  clearCredentials,
  getStoredCredentials,
  login as loginService,
  LoginCredentials,
  logout as logoutService,
  register as registerService,
  RegisterData,
  User,
} from "@/services/authService";

import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = () => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  };

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const credentials = getStoredCredentials();

    if (!storedUser || !credentials) {
      setIsLoading(false);
      return;
    }

    // Verificar sesión con el backend
    fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/validate`, {
      headers: { Authorization: `Basic ${credentials}` },
    })
      .then((res) => {
        if (res.ok) {
          setUser(JSON.parse(storedUser));
        } else {
          // Sesión inválida o expirada — limpiar
          clearCredentials();
        }
      })
      .catch(() => {
        // Error de red — mantener sesión para evitar logout accidental
        setUser(JSON.parse(storedUser));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const userData = await loginService(credentials);
    setUser(userData);
  };

  const register = async (data: RegisterData) => {
    const userData = await registerService(data);
    setUser(userData);
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
