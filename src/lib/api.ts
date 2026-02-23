import {
  CuotaPension,
  EspecialidadClase,
  EstadoClase,
  TipoCaballo,
  TipoPension,
} from "@/types/enums";
// API Configuration for HRS - Escuela de Equitación
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Definición de tipos para Alumnos, Instructores, Caballos y Clases
export interface Alumno {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
  fechaInscripcion: string;
  cantidadClases: number;
  propietario: boolean;
  activo: boolean;
  caballoPropio?: number | Caballo;
  tipoPension: TipoPension;
  cuotaPension?: CuotaPension | null;
}

export interface PersonaPrueba {
  id: number;
  nombre: string;
  apellido: string;
  fechaRegistro: string;
}

export interface Instructor {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
  activo: boolean;
  color: string;
}

export interface Caballo {
  id: number;
  nombre: string;
  tipo: TipoCaballo;
  disponible: boolean;
  propietarios?: Alumno[];
}

export interface Clase {
  id: number;
  especialidad: EspecialidadClase;
  dia: string;
  hora: string;
  duracion: number;
  estado: EstadoClase;
  observaciones?: string;
  alumnoId: number | null;
  personaPruebaId?: number | null;
  instructorId: number;
  caballoId: number;
  diaHoraCompleto?: string;
  esPrueba?: boolean;
  personaPruebaNombre?: string | null;
  personaPruebaApellido?: string | null;
  personaPruebaNombreCompleto?: string | null;
}

export interface ClaseDetallada extends Clase {
  alumno?: Alumno;
  personaPrueba?: PersonaPrueba;
  instructor?: Instructor;
  caballo?: Caballo;
  esPrueba?: boolean;
}

export interface AlumnoSearchFilters {
  dni?: string;
  nombre?: string;
  apellido?: string;
  activo?: boolean;
  propietario?: boolean;
  fechaInscripcion?: string;
  fechaNacimiento?: string;
}

export interface InstructorSearchFilters {
  nombre?: string;
  apellido?: string;
  activo?: boolean;
  fechaNacimiento?: string;
}

export interface CaballoSearchFilters {
  nombre?: string;
  tipo?: TipoCaballo;
  disponible?: boolean;
  propietarios?: Alumno[];
}

export interface ClaseSearchFilters {
  dia?: string;
  hora?: string;
  alumnoId?: number;
  instructorId?: number;
  caballoId?: number;
  especialidad?: EspecialidadClase;
  estado?: EstadoClase;
}

// Tipo para respuestas de búsqueda que pueden tener mensaje
interface SearchResponse<T> {
  mensaje?: string;
  alumnos?: T[];
  instructores?: T[];
  caballos?: T[];
  clases?: T[];
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  mensaje: string;
  path: string;
  errores?: Record<string, string>;
}

// Helper function to make API requests with authentication
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const credentials = sessionStorage.getItem("authCredentials");

  // Definimos los headers usando el tipo Record para evitar el 'any'
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>), // Mantenemos headers existentes si los hay
  };

  if (credentials) {
    headers["Authorization"] = `Basic ${credentials}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers, // Ahora headers es un objeto de tipo Record<string, string>
  });
}

// API Functions
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    sessionStorage.removeItem("authCredentials");
    sessionStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Sesión no autorizada");
  }

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
    // Si hay errores de validación (como el del teléfono), los unimos en un solo string
    if (errorData.errores) {
      const mensajesValidacion = Object.values(errorData.errores).join(". ");
      throw new Error(mensajesValidacion);
    }

    // Si no hay errores específicos, usamos el mensaje general o el estado
    const errorMessage =
      errorData.mensaje || errorData.error || `Error ${response.status}`;
    throw new Error(errorMessage);
  }

  // Parse response data
  const data = await response.json();

  const result = data as T & { __successMessage?: string };

  // Attach success message if present (para poder accederlo después)
  if (data.mensaje || data.message) {
    result.__successMessage = data.mensaje || data.message;
  }

  return result;
}

// Alumnos
export const alumnosApi = {
  listar: async (): Promise<Alumno[]> => {
    const response = await apiFetch("/alumnos");
    return handleResponse<Alumno[]>(response);
  },
  obtener: async (id: number): Promise<Alumno> => {
    const response = await apiFetch(`/alumnos/${id}`);
    return handleResponse<Alumno>(response);
  },
  crear: async (
    alumno: Omit<Alumno, "id">,
  ): Promise<Alumno & { __successMessage?: string }> => {
    const response = await apiFetch(`/alumnos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alumno),
    });
    return handleResponse<Alumno>(response);
  },
  actualizar: async (
    id: number,
    alumno: Partial<Alumno>,
  ): Promise<Alumno & { __successMessage?: string }> => {
    const response = await apiFetch(`/alumnos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alumno),
    });
    return handleResponse<Alumno>(response);
  },
  eliminar: async (
    id: number,
  ): Promise<void & { __successMessage?: string }> => {
    const response = await apiFetch(`/alumnos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error al eliminar");
  },
  buscar: async (filters: AlumnoSearchFilters): Promise<Alumno[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const response = await apiFetch(`/alumnos/buscar?${params.toString()}`);
    const data = await handleResponse<Alumno[] | SearchResponse<Alumno>>(
      response,
    );

    // Si el backend devuelve un objeto con mensaje y alumnos
    if (Array.isArray(data)) {
      return data;
    }
    return data.alumnos || [];
  },
};

// Instructores
export const instructoresApi = {
  listar: async (): Promise<Instructor[]> => {
    const response = await apiFetch("/instructores");
    return handleResponse<Instructor[]>(response);
  },
  obtener: async (id: number): Promise<Instructor> => {
    const response = await apiFetch(`/instructores/${id}`);
    return handleResponse<Instructor>(response);
  },
  crear: async (
    instructor: Omit<Instructor, "id">,
  ): Promise<Instructor & { __successMessage?: string }> => {
    const response = await apiFetch(`/instructores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(instructor),
    });
    return handleResponse<Instructor>(response);
  },
  actualizar: async (
    id: number,
    instructor: Partial<Instructor>,
  ): Promise<Instructor & { __successMessage?: string }> => {
    const response = await apiFetch(`/instructores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(instructor),
    });
    return handleResponse<Instructor>(response);
  },
  eliminar: async (
    id: number,
  ): Promise<void & { __successMessage?: string }> => {
    const response = await apiFetch(`/instructores/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error al eliminar");
  },
  buscar: async (filters: InstructorSearchFilters): Promise<Instructor[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const response = await apiFetch(
      `/instructores/buscar?${params.toString()}`,
    );
    const data = await handleResponse<
      Instructor[] | SearchResponse<Instructor>
    >(response);

    if (Array.isArray(data)) {
      return data;
    }
    return data.instructores || [];
  },
};

// Caballos
export const caballosApi = {
  listar: async (): Promise<Caballo[]> => {
    const response = await apiFetch("/caballos");
    return handleResponse<Caballo[]>(response);
  },
  obtener: async (id: number): Promise<Caballo> => {
    const response = await apiFetch(`/caballos/${id}`);
    return handleResponse<Caballo>(response);
  },
  crear: async (
    caballo: Omit<Caballo, "id">,
  ): Promise<Caballo & { __successMessage?: string }> => {
    const response = await apiFetch(`/caballos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(caballo),
    });
    return handleResponse<Caballo>(response);
  },
  actualizar: async (
    id: number,
    caballo: Partial<Caballo>,
  ): Promise<Caballo & { __successMessage?: string }> => {
    const response = await apiFetch(`/caballos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(caballo),
    });
    return handleResponse<Caballo>(response);
  },
  eliminar: async (
    id: number,
  ): Promise<void & { __successMessage?: string }> => {
    const response = await apiFetch(`/caballos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error al eliminar");
  },
  buscar: async (filters: CaballoSearchFilters): Promise<Caballo[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const response = await apiFetch(`/caballos/buscar?${params.toString()}`);
    const data = await handleResponse<Caballo[] | SearchResponse<Caballo>>(
      response,
    );

    if (Array.isArray(data)) {
      return data;
    }
    return data.caballos || [];
  },
};

// Clases
export const clasesApi = {
  listar: async (): Promise<Clase[]> => {
    const response = await apiFetch("/clases");
    return handleResponse<Clase[]>(response);
  },
  listarDetalladas: async (): Promise<ClaseDetallada[]> => {
    const response = await apiFetch(`/clases/detalles`);
    return handleResponse<ClaseDetallada[]>(response);
  },
  obtener: async (
    id: number,
  ): Promise<Clase & { __successMessage?: string }> => {
    const response = await apiFetch(`/clases/${id}`);
    return handleResponse<Clase>(response);
  },
  obtenerDetallada: async (
    id: number,
  ): Promise<ClaseDetallada & { __successMessage?: string }> => {
    const response = await apiFetch(`/clases/${id}/detalles`);
    return handleResponse<ClaseDetallada>(response);
  },
  crear: async (
    clase: Omit<Clase, "id">,
  ): Promise<Clase & { __successMessage?: string }> => {
    const response = await apiFetch(`/clases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clase),
    });
    return handleResponse<Clase>(response);
  },
  actualizar: async (
    id: number,
    clase: Partial<Clase>,
  ): Promise<Clase & { __successMessage?: string }> => {
    const response = await apiFetch(`/clases/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clase),
    });
    return handleResponse<Clase>(response);
  },
  eliminar: async (
    id: number,
  ): Promise<void & { __successMessage?: string }> => {
    const response = await apiFetch(`/clases/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error al eliminar");
  },
  buscar: async (filters: ClaseSearchFilters): Promise<Clase[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const response = await apiFetch(`/clases/buscar?${params.toString()}`);
    const data = await handleResponse<Clase[] | SearchResponse<Clase>>(
      response,
    );

    if (Array.isArray(data)) {
      return data;
    }
    return data.clases || [];
  },

  buscarPorAlumno: async (alumnoId: number): Promise<Clase[]> => {
    // Realiza la petición usando el ID directamente en la URL
    const response = await apiFetch(`/clases/alumno/${alumnoId}/detalles`);

    // Maneja la respuesta (ajusta el tipo si ClaseResponseDto es distinto a Clase)
    const data = await handleResponse<Clase[]>(response);

    return data || [];
  },

  buscarPorInstructor: async (instructorId: number): Promise<Clase[]> => {
    // Realiza la petición usando el ID directamente en la URL
    const response = await apiFetch(
      `/clases/instructor/${instructorId}/detalles`,
    );

    // Maneja la respuesta (ajusta el tipo si ClaseResponseDto es distinto a Clase)
    const data = await handleResponse<Clase[]>(response);

    return data || [];
  },

  buscarPorCaballo: async (caballoId: number): Promise<Clase[]> => {
    // Realiza la petición usando el ID directamente en la URL
    const response = await apiFetch(`/clases/caballo/${caballoId}/detalles`);

    // Maneja la respuesta (ajusta el tipo si ClaseResponseDto es distinto a Clase)
    const data = await handleResponse<Clase[]>(response);

    return data || [];
  },

  cambiarEstado: async (
    id: number,
    estado: Clase["estado"],
  ): Promise<Clase> => {
    const response = await apiFetch(`/clases/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    return handleResponse<Clase>(response);
  },

  // Calendario
  copiarClases: async (
    payload?: unknown,
  ): Promise<unknown & { __successMessage?: string }> => {
    const response = await apiFetch(`/calendario/copiar-clases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : undefined,
    });
    return handleResponse<unknown>(response);
  },

  eliminarClases: async (
    payload?: unknown,
  ): Promise<unknown & { __successMessage?: string }> => {
    const response = await apiFetch(`/calendario/eliminar-clases`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : undefined,
    });
    return handleResponse<unknown>(response);
  },
};

// API para Personas de Prueba
export const personasPruebaApi = {
  crear: async (data: {
    nombre: string;
    apellido: string;
  }): Promise<PersonaPrueba> => {
    const response = await apiFetch("/personas-prueba", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return handleResponse<PersonaPrueba>(response);
  },
  listar: async (): Promise<PersonaPrueba[]> => {
    const response = await apiFetch("/personas-prueba");
    return handleResponse<PersonaPrueba[]>(response);
  },
};
