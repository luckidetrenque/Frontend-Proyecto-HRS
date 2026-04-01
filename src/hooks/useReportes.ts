/**
 * useReportes.ts
 * Hook que provee todos los datos estadísticos para la página de Reportes.
 * Obtiene clases, alumnos, instructores y caballos del backend y deriva
 * todas las métricas en el cliente, sin endpoints dedicados de reportes.
 */

import { useQuery } from "@tanstack/react-query";
import {
  endOfMonth,
  format,
  getDay,
  isValid,
  parseISO,
  startOfMonth,
} from "date-fns";
import { useMemo, useState } from "react";

import {
  Alumno,
  alumnosApi,
  Caballo,
  caballosApi,
  Clase,
  clasesApi,
  Instructor,
  instructoresApi,
  PageResponse,
} from "@/lib/api";

// ─── Colores exportados (usados en Reportes.tsx) ──────────────────────────────

export const CHART_COLORS: Record<string, string> = {
  equinoterapia: "#8B5CF6",
  equitacion: "#3B82F6",
  adiestramiento: "#10B981",
  monta: "#F59E0B",
  completada: "#10B981",
  cancelada: "#EF4444",
  programada: "#F59E0B",
  iniciada: "#3B82F6",
  reservada: "#8B5CF6",
  aca: "#7C3AED",
  asa: "#F97316",
  escuela: "#6366F1",
  privado: "#F59E0B",
};

export const ESTADO_COLORS: Record<string, string> = {
  PROGRAMADA: "#F59E0B",
  INICIADA: "#3B82F6",
  COMPLETADA: "#10B981",
  CANCELADA: "#EF4444",
  ACA: "#7C3AED",
  ASA: "#F97316",
  RESERVADA: "#8B5CF6",
};

export const ESPECIALIDAD_COLORS: Record<string, string> = {
  EQUINOTERAPIA: "#8B5CF6",
  EQUITACION: "#3B82F6",
  ADIESTRAMIENTO: "#10B981",
  MONTA: "#F59E0B",
};

// ─── Nombres de días ───────────────────────────────────────────────────────────

const NOMBRES_DIA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useReportes() {
  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isInstructor = user?.rol === "ROLE_INSTRUCTOR";
  const isAlumno = user?.rol === "ROLE_ALUMNO";

  const [dateRange, setDateRange] = useState({
    inicio: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    fin: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  const [filters, setFilters] = useState({
    instructorId: isInstructor ? String(user.instructorId) : "",
    alumnoId: isAlumno ? String(user.alumnoId) : "",
  });

  // ── Queries ─────────────────────────────────────────────────────────────────

  const { data: clasesData } = useQuery<PageResponse<Clase>, Error>({
    queryKey: ["clases-reportes", filters],
    queryFn: () =>
      clasesApi.listar({
        page: 0,
        size: 2000,
        sort: "dia,desc",
        instructorId: filters.instructorId ? Number(filters.instructorId) : undefined,
        alumnoId: filters.alumnoId ? Number(filters.alumnoId) : undefined,
      }),
  });
  const todasLasClases: Clase[] = useMemo(
    () => clasesData?.content ?? [],
    [clasesData?.content],
  );

  const { data: alumnosData } = useQuery<PageResponse<Alumno>, Error>({
    queryKey: ["alumnos-reportes"],
    queryFn: () =>
      alumnosApi.listar({ page: 0, size: 500, sort: "apellido,asc" }),
  });
  const alumnos: Alumno[] = useMemo(
    () => alumnosData?.content ?? [],
    [alumnosData?.content],
  );

  const { data: instructoresData } = useQuery<PageResponse<Instructor>, Error>({
    queryKey: ["instructores-reportes"],
    queryFn: () =>
      instructoresApi.listar({ page: 0, size: 50, sort: "apellido,asc" }),
  });
  const instructores: Instructor[] = useMemo(
    () => instructoresData?.content ?? [],
    [instructoresData?.content],
  );

  const { data: caballosData } = useQuery<PageResponse<Caballo>, Error>({
    queryKey: ["caballos-reportes"],
    queryFn: () =>
      caballosApi.listar({ page: 0, size: 100, sort: "nombre,asc" }),
  });
  const caballos: Caballo[] = useMemo(
    () => caballosData?.content ?? [],
    [caballosData?.content],
  );

  // ── Clases filtradas por rango de fechas ────────────────────────────────────

  const clases: Clase[] = useMemo(() => {
    const inicioDate = parseISO(dateRange.inicio);
    const finDate = parseISO(dateRange.fin);

    if (!isValid(inicioDate) || !isValid(finDate)) return [];

    return todasLasClases.filter((c) => {
      if (!c.dia) return false;
      const claseDate = parseISO(c.dia);
      if (!isValid(claseDate)) return false;
      return claseDate >= inicioDate && claseDate <= finDate;
    });
  }, [todasLasClases, dateRange]);

  // ── Estadísticas generales ──────────────────────────────────────────────────

  const estadisticasGenerales = useMemo(() => {
    const alumnosActivos = alumnos.filter((a) => a.activo).length;
    const alumnosInactivos = alumnos.filter((a) => !a.activo).length;
    const totalClases = clases.length;
    const clasesCompletadas = clases.filter(
      (c) => c.estado === "COMPLETADA",
    ).length;
    const clasesCanceladas = clases.filter(
      (c) => c.estado === "CANCELADA" || c.estado === "ACA" || c.estado === "ASA",
    ).length;
    const desgloseCanceladas = {
      cancelada: clases.filter((c) => c.estado === "CANCELADA").length,
      aca: clases.filter((c) => c.estado === "ACA").length,
      asa: clases.filter((c) => c.estado === "ASA").length,
    };
    const tasaCompletado =
      totalClases > 0
        ? Number(((clasesCompletadas / totalClases) * 100).toFixed(1))
        : 0;
    const totalInstructores = instructores.length;
    const totalCaballos = caballos.length;
    const caballosDisponibles = caballos.filter((c) => c.disponible).length;

    return {
      alumnosActivos,
      alumnosInactivos,
      totalClases,
      clasesCompletadas,
      clasesCanceladas,
      desgloseCanceladas,
      tasaCompletado,
      totalInstructores,
      totalCaballos,
      caballosDisponibles,
    };
  }, [alumnos, clases, instructores, caballos]);

  // ── Alumnos por cantidad de clases (plan) ───────────────────────────────────

  const alumnosPorClases = useMemo(() => {
    const conteo: Record<string, number> = {
      "4 clases": 0,
      "8 clases": 0,
      "12 clases": 0,
      "16 clases": 0,
      Otro: 0,
    };
    alumnos.forEach((a) => {
      const n = a.cantidadClases ?? 0;
      if (n === 4) conteo["4 clases"]++;
      else if (n === 8) conteo["8 clases"]++;
      else if (n === 12) conteo["12 clases"]++;
      else if (n === 16) conteo["16 clases"]++;
      else conteo["Otro"]++;
    });
    return Object.entries(conteo).map(([plan, cantidad]) => ({
      plan,
      cantidad,
    }));
  }, [alumnos]);

  // ── Estados de clases (para pie chart) ─────────────────────────────────────

  const estadosClases = useMemo(() => {
    const conteo: Record<string, number> = {};
    clases.forEach((c) => {
      conteo[c.estado] = (conteo[c.estado] ?? 0) + 1;
    });
    const total = clases.length;
    return Object.entries(conteo).map(([estado, cantidad]) => ({
      estado,
      cantidad,
      porcentaje: total > 0 ? Number(((cantidad / total) * 100).toFixed(1)) : 0,
    }));
  }, [clases]);

  // ── Especialidades más demandadas ───────────────────────────────────────────

  const especialidadesDemanda = useMemo(() => {
    const conteo: Record<string, number> = {};
    clases.forEach((c) => {
      if (c.especialidad) {
        conteo[c.especialidad] = (conteo[c.especialidad] ?? 0) + 1;
      }
    });
    return Object.entries(conteo)
      .map(([especialidad, cantidad]) => ({ especialidad, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [clases]);

  // ── Distribución por día de la semana ───────────────────────────────────────

  const distribucionDias = useMemo(() => {
    const conteo: Record<string, number> = {
      Lun: 0,
      Mar: 0,
      Mié: 0,
      Jue: 0,
      Vie: 0,
      Sáb: 0,
      Dom: 0,
    };
    clases.forEach((c) => {
      const fecha = new Date(c.dia + "T12:00:00"); // noon para evitar TZ issues
      const nombreDia = NOMBRES_DIA[getDay(fecha)];
      conteo[nombreDia] = (conteo[nombreDia] ?? 0) + 1;
    });
    // Orden Lun→Dom
    return ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((dia) => ({
      dia,
      cantidad: conteo[dia] ?? 0,
    }));
  }, [clases]);

  // ── Asistencia por alumno ────────────────────────────────────────────────────

  const asistenciaPorAlumno = useMemo(() => {
    const mapa: Record<
      number,
      {
        total: number;
        completadas: number;
        canceladas: number;
      }
    > = {};

    clases.forEach((c) => {
      if (!c.alumnoId) return;
      if (!mapa[c.alumnoId]) {
        mapa[c.alumnoId] = {
          total: 0,
          completadas: 0,
          canceladas: 0,
        };
      }
      mapa[c.alumnoId].total++;
      if (c.estado === "COMPLETADA") mapa[c.alumnoId].completadas++;
      else if (c.estado === "CANCELADA" || c.estado === "ACA" || c.estado === "ASA") mapa[c.alumnoId].canceladas++;
    });

    return Object.entries(mapa)
      .map(([id, stats]) => {
        const alumno = alumnos.find((a) => a.id === Number(id));
        const nombre = alumno
          ? `${alumno.nombre} ${alumno.apellido}`
          : `Alumno #${id}`;
        const porcentajeAsistencia =
          stats.total > 0
            ? Number(((stats.completadas / stats.total) * 100).toFixed(1))
            : 0;
        return { nombre, ...stats, porcentajeAsistencia };
      })
      .sort((a, b) => b.total - a.total);
  }, [clases, alumnos]);

  // ── Ranking top alumnos ──────────────────────────────────────────────────────

  const rankingAlumnos = useMemo(() => {
    return [...asistenciaPorAlumno]
      .sort((a, b) => b.completadas - a.completadas)
      .slice(0, 10);
  }, [asistenciaPorAlumno]);

  // ── Uso de caballos ──────────────────────────────────────────────────────────

  const usoCaballos = useMemo(() => {
    const mapa: Record<number, number> = {};
    clases.forEach((c) => {
      if (!c.caballoId) return;
      mapa[c.caballoId] = (mapa[c.caballoId] ?? 0) + 1;
    });

    return caballos
      .map((cab) => ({
        nombre: cab.nombre,
        tipo: cab.tipo,
        cantidad: mapa[cab.id] ?? 0,
      }))
      .filter((c) => c.cantidad > 0)
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [clases, caballos]);

  // ── Estadísticas de clases de prueba ────────────────────────────────────────

  const estadisticasPrueba = useMemo(() => {
    const pruebas = clases.filter((c) => c.esPrueba);
    const total = pruebas.length;

    // Personas nuevas: clases de prueba sin alumnoId registrado
    const personasNuevas = pruebas.filter(
      (c) => !c.alumnoId || c.alumnoId === 1,
    ).length;

    // Convertidos: alumnos activos que tuvieron al menos una clase de prueba
    const alumnosConPrueba = new Set(
      pruebas
        .filter((c) => c.alumnoId && c.alumnoId !== 1)
        .map((c) => c.alumnoId),
    );
    const convertidos = alumnos.filter(
      (a) => a.activo && alumnosConPrueba.has(a.id),
    ).length;

    // Por especialidad
    const conteoEsp: Record<string, number> = {};
    pruebas.forEach((c) => {
      if (c.especialidad) {
        conteoEsp[c.especialidad] = (conteoEsp[c.especialidad] ?? 0) + 1;
      }
    });
    const porEspecialidad = Object.entries(conteoEsp)
      .map(([especialidad, cantidad]) => ({ especialidad, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    return { total, personasNuevas, convertidos, porEspecialidad };
  }, [clases, alumnos]);

  // ─── Return ──────────────────────────────────────────────────────────────────

  return {
    dateRange,
    setDateRange,
    filters,
    setFilters,
    user,
    alumnos,
    instructores,
    estadisticasGenerales,
    alumnosPorClases,
    estadosClases,
    especialidadesDemanda,
    distribucionDias,
    asistenciaPorAlumno,
    rankingAlumnos,
    usoCaballos,
    estadisticasPrueba,
  };
}
