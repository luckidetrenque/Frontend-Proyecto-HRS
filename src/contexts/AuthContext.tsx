import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getStoredCredentials,
  login as loginService,
  LoginCredentials,
  logout as logoutService,
  register as registerService,
  RegisterData,
  User,
} from "@/services/authService";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Recuperar usuario de sessionStorage al cargar la app
    const storedUser = sessionStorage.getItem("user");
    const credentials = getStoredCredentials();

    if (storedUser && credentials) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const userData = await loginService(credentials);
    setUser(userData); // loginService ya guarda en sessionStorage
  };

  const register = async (data: RegisterData) => {
    const userData = await registerService(data);
    setUser(userData);
  };

  const logout = async () => {
    await logoutService();
    setUser(null); // logoutService ya limpia sessionStorage
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
