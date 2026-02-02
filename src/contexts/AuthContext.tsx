import { createContext, useContext } from "react";

import { LoginCredentials, RegisterData, User } from "@/services/authService";

// 1. La interfaz de lo que el contexto ofrece
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

// 2. El objeto contexto en sí
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// 3. El Hook para usar el contexto en tus componentes
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
