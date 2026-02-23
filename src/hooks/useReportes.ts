import { useQuery } from "@tanstack/react-query";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
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
} from "@/lib/api";

// ─── Paleta de colores compartida para recharts ───────────────────────────────
export const CHART_COLORS = {
  programada: "#F59E0B",
  iniciada: "#3B82F6",
  completada: "#22C55E",
  cancelada: "#EF4444",
  aca: "#8B5CF6",
  asa: "#EC4899",
  equitacion: "#4472C4",
  adiestramiento: "#ED7D31",
  equinoterapia: "#A9D18E",
  monta: "#FF0000",
  escuela: "#4472C4",
  privado: "#D4A017",
};

export const ESTADO_COLORS: Record<string, string> = {
  PROGRAMADA: CHART_COLORS.programada,
  INICIADA: CHART_COLORS.iniciada,
  COMPLETADA: CHART_COLORS.completada,
  CANCELADA: CHART_COLORS.cancelada,
  ACA: CHART_COLORS.aca,
  ASA: CHART_COLORS.asa,
};

export const ESPECIALIDAD_COLORS: Record<string, string> = {
  EQUITACION: CHART_COLORS.equitacion,
  ADIESTRAMIENTO: CHART_COLORS.adiestramiento,
  EQUINOTERAPIA: CHART_COLORS.equinoterapia,
  MONTA: CHART_COLORS.monta,
};

// ─── Tipos de retorno ─────────────────────────────────────────────────────────
export interface DateRange {
  inicio: string;
  fin: string;
}

export interface EstadisticasGenerales {
  alumnosActivos: number;
  alumnosInactivos: number;
  totalInstructores: number;
  totalClases: number;
  clasesCompletadas: number;
  clasesCanceladas: number;
  tasaCompletado: string;
  totalCaballos: number;
  caballosDisponibles: number;
}

export interface AlumnoPorClases {
  plan: string;
  cantidad: number;
  porcentaje: number;
}

export interface EstadoClase {
  estado: string;
  cantidad: number;
  porcentaje: number;
}

export interface EspecialidadDemanda {
  especialidad: string;
  cantidad: number;
  porcentaje: number;
}

export interface DistribucionDia {
  dia: string;
  cantidad: number;
}

export interface DistribucionHorario {
  horario: string;
  cantidad: number;
}

export interface AsistenciaAlumno {
  nombre: string;
  total: number;
  completadas: number;
  canceladas: number;
  aca: number;
  asa: number;
  porcentajeAsistencia: number;
}

export interface CargaInstructor {
  nombre: string;
  total: number;
  completadas: number;
  canceladas: number;
  eficiencia: number;
}

export interface UsoCaballo {
  nombre: string;
  cantidad: number;
  tipo: string;
  porcentaje: number;
}

export interface EstadisticasPrueba {
  total: number;
  porEspecialidad: { especialidad: string; cantidad: number }[];
  personasNuevas: number;
  alumnosExistentes: number;
  convertidos: number;
}

export interface UseReportesReturn {
  // Estado
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  // Datos crudos
  alumnos: Alumno[];
  clases: Clase[];
  // Datos derivados
  clasesFiltradas: Clase[];
  estadisticasGenerales: EstadisticasGenerales;
  alumnosPorClases: AlumnoPorClases[];
  estadosClases: EstadoClase[];
  especialidadesDemanda: EspecialidadDemanda[];
  distribucionDias: DistribucionDia[];
  distribucionHorarios: DistribucionHorario[];
  asistenciaPorAlumno: AsistenciaAlumno[];
  rankingAlumnos: AsistenciaAlumno[];
  cargaInstructores: CargaInstructor[];
  usoCaballos: UsoCaballo[];
  caballosSinUso: Caballo[];
  estadisticasPrueba: EstadisticasPrueba;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useReportes(): UseReportesReturn {
  const [dateRange, setDateRange] = useState<DateRange>({
    inicio: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    fin: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: alumnos = [] } = useQuery({
    queryKey: ["alumnos"],
    queryFn: alumnosApi.listar,
  });

  const { data: clases = [] } = useQuery({
    queryKey: ["clases"],
    queryFn: clasesApi.listarDetalladas,
  });

  const { data: instructores = [] } = useQuery({
    queryKey: ["instructores"],
    queryFn: instructoresApi.listar,
  });

  const { data: caballos = [] } = useQuery({
    queryKey: ["caballos"],
    queryFn: caballosApi.listar,
  });

  // ── Clases filtradas por período ───────────────────────────────────────────
  const clasesFiltradas = useMemo(
    () =>
      clases.filter(
        (clase: Clase) =>
          clase.dia >= dateRange.inicio && clase.dia <= dateRange.fin,
      ),
    [clases, dateRange],
  );

  // ── Estadísticas generales ─────────────────────────────────────────────────
  const estadisticasGenerales = useMemo((): EstadisticasGenerales => {
    const alumnosActivos = alumnos.filter((a: Alumno) => a.activo).length;
    const totalClases = clasesFiltradas.length;
    const clasesCompletadas = clasesFiltradas.filter(
      (c: Clase) => c.estado === "COMPLETADA",
    ).length;
    const clasesCanceladas = clasesFiltradas.filter(
      (c: Clase) => c.estado === "CANCELADA",
    ).length;
    const tasaCompletado =
      totalClases > 0
        ? ((clasesCompletadas / totalClases) * 100).toFixed(1)
        : "0";

    return {
      alumnosActivos,
      alumnosInactivos: alumnos.filter((a: Alumno) => !a.activo).length,
      totalInstructores: instructores.filter((i: Instructor) => i.activo)
        .length,
      totalClases,
      clasesCompletadas,
      clasesCanceladas,
      tasaCompletado,
      totalCaballos: caballos.length,
      caballosDisponibles: caballos.filter((c: Caballo) => c.disponible).length,
    };
  }, [alumnos, clasesFiltradas, instructores, caballos]);

  // ── Alumnos por plan ───────────────────────────────────────────────────────
  const alumnosPorClases = useMemo((): AlumnoPorClases[] => {
    const grupos: Record<number, number> = { 4: 0, 8: 0, 12: 0, 16: 0 };
    alumnos.forEach((a: Alumno) => {
      if (grupos[a.cantidadClases] !== undefined) grupos[a.cantidadClases]++;
    });
    return [4, 8, 12, 16].map((n) => ({
      plan: `${n} clases`,
      cantidad: grupos[n],
      porcentaje:
        alumnos.length > 0
          ? parseFloat(((grupos[n] / alumnos.length) * 100).toFixed(1))
          : 0,
    }));
  }, [alumnos]);

  // ── Estados de clases ──────────────────────────────────────────────────────
  const estadosClases = useMemo((): EstadoClase[] => {
    const estados: Record<string, number> = {};
    clasesFiltradas.forEach((c: Clase) => {
      estados[c.estado] = (estados[c.estado] || 0) + 1;
    });
    return Object.entries(estados).map(([estado, cantidad]) => ({
      estado,
      cantidad,
      porcentaje:
        clasesFiltradas.length > 0
          ? parseFloat(((cantidad / clasesFiltradas.length) * 100).toFixed(1))
          : 0,
    }));
  }, [clasesFiltradas]);

  // ── Especialidades más demandadas ──────────────────────────────────────────
  const especialidadesDemanda = useMemo((): EspecialidadDemanda[] => {
    const conteo: Record<string, number> = {};
    clasesFiltradas.forEach((c: Clase) => {
      conteo[c.especialidad] = (conteo[c.especialidad] || 0) + 1;
    });
    return Object.entries(conteo)
      .map(([especialidad, cantidad]) => ({
        especialidad,
        cantidad,
        porcentaje:
          clasesFiltradas.length > 0
            ? parseFloat(((cantidad / clasesFiltradas.length) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [clasesFiltradas]);

  // ── Distribución por día de semana ─────────────────────────────────────────
  const distribucionDias = useMemo((): DistribucionDia[] => {
    const dias: Record<string, number> = {
      Lunes: 0,
      Martes: 0,
      Miércoles: 0,
      Jueves: 0,
      Viernes: 0,
      Sábado: 0,
      Domingo: 0,
    };
    clasesFiltradas.forEach((c: Clase) => {
      const dia = format(parseISO(c.dia), "EEEE", { locale: es });
      const diaC = dia.charAt(0).toUpperCase() + dia.slice(1);
      if (dias[diaC] !== undefined) dias[diaC]++;
    });
    return Object.entries(dias).map(([dia, cantidad]) => ({ dia, cantidad }));
  }, [clasesFiltradas]);

  // ── Distribución por horario ───────────────────────────────────────────────
  const distribucionHorarios = useMemo((): DistribucionHorario[] => {
    const h = { Mañana: 0, Tarde: 0, Noche: 0 };
    clasesFiltradas.forEach((c: Clase) => {
      const hora = parseInt(c.hora.split(":")[0]);
      if (hora < 12) h.Mañana++;
      else if (hora < 18) h.Tarde++;
      else h.Noche++;
    });
    return Object.entries(h).map(([horario, cantidad]) => ({
      horario,
      cantidad,
    }));
  }, [clasesFiltradas]);

  // ── Asistencia por alumno ──────────────────────────────────────────────────
  const asistenciaPorAlumno = useMemo((): AsistenciaAlumno[] => {
    const mapa: Record<
      string,
      {
        total: number;
        completadas: number;
        canceladas: number;
        aca: number;
        asa: number;
      }
    > = {};

    clasesFiltradas.forEach((c: Clase) => {
      const alumno = alumnos.find((a: Alumno) => a.id === c.alumnoId);
      if (!alumno) return;
      const nombre = `${alumno.nombre} ${alumno.apellido}`;
      if (!mapa[nombre])
        mapa[nombre] = {
          total: 0,
          completadas: 0,
          canceladas: 0,
          aca: 0,
          asa: 0,
        };
      mapa[nombre].total++;
      if (c.estado === "COMPLETADA") mapa[nombre].completadas++;
      if (c.estado === "CANCELADA") mapa[nombre].canceladas++;
      if (c.estado === "ACA") mapa[nombre].aca++;
      if (c.estado === "ASA") mapa[nombre].asa++;
    });

    return Object.entries(mapa)
      .map(([nombre, d]) => ({
        nombre,
        ...d,
        porcentajeAsistencia:
          d.total > 0
            ? parseFloat(((d.completadas / d.total) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [clasesFiltradas, alumnos]);

  // ── Ranking alumnos ────────────────────────────────────────────────────────
  const rankingAlumnos = useMemo(
    () =>
      asistenciaPorAlumno
        .filter((a) => a.completadas > 0)
        .sort((a, b) => b.completadas - a.completadas)
        .slice(0, 10),
    [asistenciaPorAlumno],
  );

  // ── Carga por instructor ───────────────────────────────────────────────────
  const cargaInstructores = useMemo((): CargaInstructor[] => {
    const carga: Record<
      string,
      { total: number; completadas: number; canceladas: number }
    > = {};
    clasesFiltradas.forEach((c: Clase) => {
      const inst = instructores.find(
        (i: Instructor) => i.id === c.instructorId,
      );
      if (!inst) return;
      const nombre = `${inst.nombre} ${inst.apellido}`;
      if (!carga[nombre])
        carga[nombre] = { total: 0, completadas: 0, canceladas: 0 };
      carga[nombre].total++;
      if (c.estado === "COMPLETADA") carga[nombre].completadas++;
      if (c.estado === "CANCELADA") carga[nombre].canceladas++;
    });
    return Object.entries(carga).map(([nombre, d]) => ({
      nombre,
      ...d,
      eficiencia:
        d.total > 0
          ? parseFloat(((d.completadas / d.total) * 100).toFixed(1))
          : 0,
    }));
  }, [clasesFiltradas, instructores]);

  // ── Uso de caballos ────────────────────────────────────────────────────────
  const usoCaballos = useMemo((): UsoCaballo[] => {
    const uso: Record<string, number> = {};
    clasesFiltradas.forEach((c: Clase) => {
      const cab = caballos.find((x: Caballo) => x.id === c.caballoId);
      if (cab) uso[cab.nombre] = (uso[cab.nombre] || 0) + 1;
    });
    return Object.entries(uso)
      .map(([nombre, cantidad]) => {
        const cab = caballos.find((c: Caballo) => c.nombre === nombre);
        return {
          nombre,
          cantidad,
          tipo: cab?.tipo || "ESCUELA",
          porcentaje:
            clasesFiltradas.length > 0
              ? parseFloat(
                  ((cantidad / clasesFiltradas.length) * 100).toFixed(1),
                )
              : 0,
        };
      })
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [clasesFiltradas, caballos]);

  // ── Caballos sin uso ───────────────────────────────────────────────────────
  const caballosSinUso = useMemo(() => {
    const nombresConUso = new Set(usoCaballos.map((u) => u.nombre));
    return caballos.filter((c: Caballo) => !nombresConUso.has(c.nombre));
  }, [caballos, usoCaballos]);

  // ── Clases de prueba ───────────────────────────────────────────────────────
  const estadisticasPrueba = useMemo((): EstadisticasPrueba => {
    const pruebas = clasesFiltradas.filter((c: Clase) => c.esPrueba);
    const porEspecialidad: Record<string, number> = {};
    pruebas.forEach((c: Clase) => {
      porEspecialidad[c.especialidad] =
        (porEspecialidad[c.especialidad] || 0) + 1;
    });

    const alumnosIds = new Set(
      clases
        .filter((c: Clase) => c.esPrueba && c.alumnoId)
        .map((c: Clase) => c.alumnoId),
    );
    const convertidos = alumnos.filter(
      (a: Alumno) => a.activo && alumnosIds.has(a.id),
    ).length;

    return {
      total: pruebas.length,
      porEspecialidad: Object.entries(porEspecialidad).map(
        ([especialidad, cantidad]) => ({ especialidad, cantidad }),
      ),
      personasNuevas: pruebas.filter((c: Clase) => !c.alumnoId).length,
      alumnosExistentes: pruebas.filter((c: Clase) => !!c.alumnoId).length,
      convertidos,
    };
  }, [clasesFiltradas, clases, alumnos]);

  return {
    dateRange,
    setDateRange,
    alumnos,
    clases,
    clasesFiltradas,
    estadisticasGenerales,
    alumnosPorClases,
    estadosClases,
    especialidadesDemanda,
    distribucionDias,
    distribucionHorarios,
    asistenciaPorAlumno,
    rankingAlumnos,
    cargaInstructores,
    usoCaballos,
    caballosSinUso,
    estadisticasPrueba,
  };
}
