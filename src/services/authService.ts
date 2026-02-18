import { ApiErrorResponse } from "@/lib/api";

export const API_BASE_URL = "http://localhost:8080/api/v1/auth";

export interface User {
  id: number;
  username: string;
  email: string;
  // nombre?: string;
  // apellido?: string;
  password: string;
  rol?: string;
  activo: boolean;
  fechaCreacion: string;
  // personaDni?: string;
  // personaTipoDni?: string;
  avatarUrl?: string;
}

export type SafeUser = Omit<User, "password">;

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  id: number;
  username: string;
  email: string;
  password: string;
  // nombre?: string;
  // apellido?: string;
  rol?: string;
  activo: true;
  fechaCreacion: string;
  // personaDni?: string;
  // personaTipoDni?: string;
}

export interface UpdateData {
  id: number;
  username: string;
  email: string;
  // nombre?: string;
  // apellido?: string;
  rol?: string;
  activo: boolean;
  fechaCreacion: string;
  // personaDni?: string;
  // personaTipoDni?: string;
}

// Codifica credenciales en Base64 para Basic Auth
export const encodeCredentials = (
  username: string,
  password: string,
): string => {
  return btoa(`${username}:${password}`);
};

// Obtiene las credenciales guardadas
export const getStoredCredentials = (): string | null => {
  return sessionStorage.getItem("authCredentials");
};

// Guarda las credenciales
export const storeCredentials = (credentials: string, user: User): void => {
  sessionStorage.setItem("authCredentials", credentials);
  const { password, ...safeUser } = user;
  sessionStorage.setItem("user", JSON.stringify(safeUser));
};

// Limpia las credenciales
export const clearCredentials = (): void => {
  sessionStorage.removeItem("authCredentials");
  sessionStorage.removeItem("user");
};

// ✅ Helper para parsear errores del backend de forma consistente
const parseApiError = async (response: Response): Promise<never> => {
  try {
    const errorData: ApiErrorResponse = await response.json();

    // Si hay errores de validación de campos (@Valid)
    if (errorData.errores) {
      throw new Error(Object.values(errorData.errores).join(". "));
    }
    // Mensaje de negocio (ConflictException, UnauthorizedException, etc.)
    if (errorData.mensaje) {
      throw new Error(errorData.mensaje);
    }
    // Fallback al campo error
    throw new Error(errorData.error || `Error ${response.status}`);
  } catch (e) {
    if (e instanceof SyntaxError) {
      // Si no era JSON
      throw new Error(`Error ${response.status}`);
    }
    throw e;
  }
};

// Login con Basic Auth
export const login = async (credentials: LoginCredentials): Promise<User> => {
  const encoded = encodeCredentials(credentials.username, credentials.password);

  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${encoded}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  const user = await response.json();
  storeCredentials(encoded, user);

  const { password, ...safeUser } = user;
  return safeUser as User;
};

// Registro de usuario
export const register = async (data: RegisterData): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  return response.json();
};

// Actualizar usuario
export const update = async (data: UpdateData): Promise<User> => {
  const credentials = getStoredCredentials();

  const response = await fetch(`${API_BASE_URL}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(credentials && { Authorization: `Basic ${credentials}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  const updatedUser = await response.json();
  const { password, ...safeUser } = updatedUser;
  sessionStorage.setItem("user", JSON.stringify(safeUser));

  return safeUser as User;
};

// Logout
export const logout = async (): Promise<void> => {
  const credentials = getStoredCredentials();

  try {
    await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      headers: {
        ...(credentials && { Authorization: `Basic ${credentials}` }),
      },
    });
  } finally {
    clearCredentials();
  }
};

// Update user profile
export const updateProfile = async (
  id: number,
  data: Partial<UpdateData>,
): Promise<User> => {
  const credentials = getStoredCredentials();

  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(credentials && { Authorization: `Basic ${credentials}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  const updatedUser = await response.json();
  const { password, ...safeUser } = updatedUser;
  sessionStorage.setItem("user", JSON.stringify(safeUser));

  return safeUser as User;
};

// Helper para hacer peticiones autenticadas
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const credentials = getStoredCredentials();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(credentials && { Authorization: `Basic ${credentials}` }),
    },
  });
};
