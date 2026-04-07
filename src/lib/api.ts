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
  codigoArea: string;
  telefono: string;
  email: string;
  fechaInscripcion: string;
  cantidadClases: number;
  propietario: boolean;
  activo: boolean;
  tipoPension: TipoPension;
  cuotaPension?: CuotaPension | null;
  caballoId?: number | null;
  caballoNombre?: string | null;
  codigoInvitacion?: string | null;
  codigoUsado?: boolean;
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
  codigoArea: string;
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
  alumnoNombre?: string | null;
  alumnoApellido?: string | null;
  alumnoNombreCompleto?: string | null;
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
  cantidadClases?: number;
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
  nombreAlumno?: string;
  apellidoAlumno?: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  mensaje: string;
  path: string;
  errores?: Record<string, string>;
}

export interface ConfiguracionPrecios {
  cuota4Clases: number;
  cuota8Clases: number;
  cuota12Clases: number;
  cuota16Clases: number;
  pensionEntera: number;
  pensionMedia: number;
  pensionTercio: number;
  reservaEscuela: number;
  honorarioPorClase: number;
  honorarioBaseMensual: number;
}

export interface ConfiguracionOperativa {
  id: number;
  horasAnticipacionCancelacion: number;
  horasAnticipacionReserva: number;
  diasValidezInvitacion: number;
}

export interface DesglosePlan {
  cantidadClases: number;
  alumnosEnPlan: number;
  cuotaUnitaria: number;
  subtotal: number;
}

export interface PuntoEvolucion {
  mes: string;
  ingresos: number;
  egresos: number;
}

export interface ResumenFinanciero {
  ingresosCuotasProyectado: number;
  ingresosPensionesProyectado: number;
  ingresosTotalProyectado: number;
  egresoHonorarios: number;
  balanceProyectado: number;
  desglosePlanes: DesglosePlan[];
  evolucion: PuntoEvolucion[];
}

export interface FilaAlumnoFinanzas {
  alumnoId: number;
  nombre: string;
  apellido: string;
  plan: number;
  clasesCompletadas: number;
  montoCuota: number;
  tipoPension: string;
  montoPension: number;
  totalAlumno: number;
}

export interface CuotasAlumnos {
  totalProyectado: number;
  alumnosActivos: number;
  filas: FilaAlumnoFinanzas[];
}

export interface FilaPension {
  alumnoId: number;
  nombre: string;
  apellido: string;
  tipoPension: string;
  cuotaPension: string | null;
  caballoNombre: string | null;
  monto: number;
}

export interface Pensiones {
  totalMensual: number;
  filas: FilaPension[];
}

export interface FilaInstructor {
  instructorId: number;
  nombre: string;
  apellido: string;
  clasesCompletadas: number;
  honorarioBase: number;
  honorarioPorClases: number;
  totalHonorario: number;
}

export interface Honorarios {
  totalHonorarios: number;
  filas: FilaInstructor[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página actual 0-indexed
  size: number;
  first: boolean;
  last: boolean;
}

export interface PageParams {
  page: number; // 0-indexed
  size: number;
  sort?: string; // ej: "apellido,asc"
}

// Helper function to make API requests with authentication
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const credentials = sessionStorage.getItem("authCredentials");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (credentials) {
    headers["Authorization"] = `Basic ${credentials}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
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

  if (response.status === 403) {
    throw new Error("No tienes permisos para realizar esta acción (403 Forbidden)");
  }

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
    if (errorData.errores) {
      const mensajesValidacion = Object.values(errorData.errores).join(". ");
      throw new Error(mensajesValidacion);
    }
    const errorMessage =
      errorData.mensaje || errorData.error || `Error ${response.status}`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const result = data as T & { __successMessage?: string };

  if (data.mensaje || data.message) {
    result.__successMessage = data.mensaje || data.message;
  }

  return result;
}

// Alumnos
export const alumnosApi = {
  listar: async (
    params: PageParams & AlumnoSearchFilters,
  ): Promise<PageResponse<Alumno>> => {
    const query = new URLSearchParams();
    query.append("page", String(params.page));
    query.append("size", String(params.size));
    if (params.sort) query.append("sort", params.sort);
    if (params.activo !== undefined)
      query.append("activo", String(params.activo));
    if (params.propietario !== undefined)
      query.append("propietario", String(params.propietario));
    if (params.cantidadClases !== undefined)
      query.append("cantidadClases", String(params.cantidadClases));
    if (params.nombre) query.append("nombre", params.nombre);
    if (params.apellido) query.append("apellido", params.apellido);
    const response = await apiFetch(`/alumnos?${query.toString()}`);
    return handleResponse<PageResponse<Alumno>>(response);
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
  obtenerMiPerfil: async (): Promise<Alumno> => {
  const response = await apiFetch(`/alumnos/me`);
  return handleResponse<Alumno>(response);
},
  buscar: async (filters: AlumnoSearchFilters): Promise<Alumno[]> => {
    const query = new URLSearchParams();
    if (filters.dni) query.append("dni", filters.dni);
    if (filters.nombre) query.append("nombre", filters.nombre);
    if (filters.apellido) query.append("apellido", filters.apellido);
    const response = await apiFetch(`/alumnos?${query.toString()}&page=0&size=10`);
    const page = await handleResponse<PageResponse<Alumno>>(response);
    return page.content;
  },
  invitar: async (id: number): Promise<{ codigo: string; email: string; nombre: string }> => {
    const response = await apiFetch(`/alumnos/${id}/invitar`, {
      method: "POST",
    });
    return handleResponse<{ codigo: string; email: string; nombre: string }>(response);
  },
};

// Instructores
export const instructoresApi = {
  listar: async (
    params: PageParams & InstructorSearchFilters,
  ): Promise<PageResponse<Instructor>> => {
    const query = new URLSearchParams();
    query.append("page", String(params.page));
    query.append("size", String(params.size));
    if (params.sort) query.append("sort", params.sort);
    if (params.activo !== undefined)
      query.append("activo", String(params.activo));
    if (params.nombre) query.append("nombre", params.nombre);
    if (params.apellido) query.append("apellido", params.apellido);
    const response = await apiFetch(`/instructores?${query.toString()}`);
    return handleResponse<PageResponse<Instructor>>(response);
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
  obtenerMiPerfil: async (): Promise<Instructor> => {
  const response = await apiFetch(`/instructores/me`);
  return handleResponse<Instructor>(response);
},
buscar: async (filters: InstructorSearchFilters): Promise<Instructor[]> => {
  const query = new URLSearchParams();
  if (filters.nombre) query.append("nombre", filters.nombre);
  if (filters.apellido) query.append("apellido", filters.apellido);
  const response = await apiFetch(`/instructores?${query.toString()}&page=0&size=10`);
  const page = await handleResponse<PageResponse<Instructor>>(response);
  return page.content;
},
};

// Caballos
export const caballosApi = {
  listar: async (
    params: PageParams & CaballoSearchFilters,
  ): Promise<PageResponse<Caballo>> => {
    const query = new URLSearchParams();
    query.append("page", String(params.page));
    query.append("size", String(params.size));
    if (params.sort) query.append("sort", params.sort);
    if (params.tipo) query.append("tipo", params.tipo);
    if (params.disponible !== undefined)
      query.append("disponible", String(params.disponible));
    if (params.nombre) query.append("nombre", params.nombre);
    const response = await apiFetch(`/caballos?${query.toString()}`);
    return handleResponse<PageResponse<Caballo>>(response);
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
};

// Clases
export const clasesApi = {
  listar: async (
    params: PageParams & ClaseSearchFilters,
  ): Promise<PageResponse<ClaseDetallada>> => {
    const query = new URLSearchParams();
    query.append("page", String(params.page));
    query.append("size", String(params.size));
    if (params.sort) query.append("sort", params.sort);
    if (params.estado) query.append("estado", params.estado);
    if (params.especialidad) query.append("especialidad", params.especialidad);
    if (params.nombreAlumno) query.append("nombreAlumno", params.nombreAlumno);
    if (params.apellidoAlumno)
      query.append("apellidoAlumno", params.apellidoAlumno);
    if (params.alumnoId) query.append("alumnoId", String(params.alumnoId));
    if (params.instructorId) query.append("instructorId", String(params.instructorId));
    const response = await apiFetch(`/clases?${query.toString()}`);
    return handleResponse<PageResponse<ClaseDetallada>>(response);
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
  buscarPorAlumno: async (alumnoId: number): Promise<Clase[]> => {
    const response = await apiFetch(`/clases/alumno/${alumnoId}/detalles`);
    const data = await handleResponse<Clase[]>(response);
    return data || [];
  },
  buscarPorInstructor: async (instructorId: number): Promise<Clase[]> => {
    const response = await apiFetch(
      `/clases/instructor/${instructorId}/detalles`,
    );
    const data = await handleResponse<Clase[]>(response);
    return data || [];
  },
  buscarPorCaballo: async (caballoId: number): Promise<Clase[]> => {
    const response = await apiFetch(`/clases/caballo/${caballoId}/detalles`);
    const data = await handleResponse<Clase[]>(response);
    return data || [];
  },
  cambiarEstado: async (
    id: number,
    estado: Clase["estado"],
    observaciones: string,
  ): Promise<Clase> => {
    const response = await apiFetch(`/clases/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado, observaciones }),
    });
    return handleResponse<Clase>(response);
  },
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
  reservar: async (
    clase: Omit<Clase, "id">,
  ): Promise<Clase & { __successMessage?: string }> => {
    const response = await apiFetch(`/clases/reservar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clase),
    });
    return handleResponse<Clase>(response);
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

export const finanzasApi = {
  getResumen: async (
    inicio: string,
    fin: string,
    instructorId?: number,
  ): Promise<ResumenFinanciero> => {
    const query = new URLSearchParams({ inicio, fin });
    if (instructorId) query.append("instructorId", String(instructorId));
    const response = await apiFetch(`/finanzas/resumen?${query.toString()}`);
    return handleResponse<ResumenFinanciero>(response);
  },
  getCuotasAlumnos: async (
    inicio: string,
    fin: string,
    instructorId?: number,
  ): Promise<CuotasAlumnos> => {
    const query = new URLSearchParams({ inicio, fin });
    if (instructorId) query.append("instructorId", String(instructorId));
    const response = await apiFetch(`/finanzas/alumnos?${query.toString()}`);
    return handleResponse<CuotasAlumnos>(response);
  },
  getPensiones: async (): Promise<Pensiones> => {
    const response = await apiFetch(`/finanzas/pensiones`);
    return handleResponse<Pensiones>(response);
  },
  getHonorarios: async (
    inicio: string,
    fin: string,
    instructorId?: number,
  ): Promise<Honorarios> => {
    const query = new URLSearchParams({ inicio, fin });
    if (instructorId) query.append("instructorId", String(instructorId));
    const response = await apiFetch(`/finanzas/honorarios?${query.toString()}`);
    return handleResponse<Honorarios>(response);
  },
  getConfiguracion: async (): Promise<ConfiguracionPrecios> => {
    const response = await apiFetch(`/finanzas/configuracion`);
    return handleResponse<ConfiguracionPrecios>(response);
  },
  updateConfiguracion: async (
    config: ConfiguracionPrecios,
  ): Promise<ConfiguracionPrecios> => {
    const response = await apiFetch(`/finanzas/configuracion`, {
      method: "PUT",
      body: JSON.stringify(config),
    });
    return handleResponse<ConfiguracionPrecios>(response);
  },
};

export const configuracionOperativaApi = {
  get: async (): Promise<ConfiguracionOperativa> => {
    const response = await apiFetch("/operativa");
    return handleResponse<ConfiguracionOperativa>(response);
  },
  update: async (config: Partial<ConfiguracionOperativa>): Promise<ConfiguracionOperativa> => {
    const response = await apiFetch("/operativa", {
      method: "PUT",
      body: JSON.stringify(config),
    });
    return handleResponse<ConfiguracionOperativa>(response);
  },
};
