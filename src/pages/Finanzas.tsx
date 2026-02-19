import { useQuery } from "@tanstack/react-query";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChessKnight,
  Download,
  GraduationCap,
  NotebookPen,
  TrendingUp,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { exportarExcel } from "@/utils/exportReportesToExcel";

// ─── Paleta de colores compartida para recharts ───────────────────────────────
const CHART_COLORS = {
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

const ESTADO_COLORS: Record<string, string> = {
  PROGRAMADA: CHART_COLORS.programada,
  INICIADA: CHART_COLORS.iniciada,
  COMPLETADA: CHART_COLORS.completada,
  CANCELADA: CHART_COLORS.cancelada,
  ACA: CHART_COLORS.aca,
  ASA: CHART_COLORS.asa,
};

const ESPECIALIDAD_COLORS: Record<string, string> = {
  EQUITACION: CHART_COLORS.equitacion,
  ADIESTRAMIENTO: CHART_COLORS.adiestramiento,
  EQUINOTERAPIA: CHART_COLORS.equinoterapia,
  MONTA: CHART_COLORS.monta,
};

export default function ReportesPage() {
  const [dateRange, setDateRange] = useState({
    inicio: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    fin: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  // ── Queries ──────────────────────────────────────────────────────────────────
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

  // ── Clases filtradas por período ─────────────────────────────────────────────
  const clasesFiltradas = useMemo(
    () =>
      clases.filter(
        (clase: Clase) =>
          clase.dia >= dateRange.inicio && clase.dia <= dateRange.fin,
      ),
    [clases, dateRange],
  );

  // ── Estadísticas generales ───────────────────────────────────────────────────
  const estadisticasGenerales = useMemo(() => {
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

  // ── Alumnos por plan (para gráfico) ─────────────────────────────────────────
  const alumnosPorClases = useMemo(() => {
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

  // ── Estados de clases (para gráfico pie) ────────────────────────────────────
  const estadosClases = useMemo(() => {
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

  // ── Especialidades más demandadas ────────────────────────────────────────────
  const especialidadesDemanda = useMemo(() => {
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

  // ── Distribución por día de semana ───────────────────────────────────────────
  const distribucionDias = useMemo(() => {
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

  // ── Distribución por horario ─────────────────────────────────────────────────
  const distribucionHorarios = useMemo(() => {
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

  // ── Asistencia por alumno — ACA/ASA separados ────────────────────────────────
  const asistenciaPorAlumno = useMemo(() => {
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

  // ── Ranking alumnos por clases completadas ───────────────────────────────────
  const rankingAlumnos = useMemo(() => {
    return asistenciaPorAlumno
      .filter((a) => a.completadas > 0)
      .sort((a, b) => b.completadas - a.completadas)
      .slice(0, 10);
  }, [asistenciaPorAlumno]);

  // ── Carga por instructor ─────────────────────────────────────────────────────
  const cargaInstructores = useMemo(() => {
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

  // ── Uso de caballos ──────────────────────────────────────────────────────────
  const usoCaballos = useMemo(() => {
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

  // ── Caballos sin uso en el período ──────────────────────────────────────────
  const caballosSinUso = useMemo(() => {
    const nombresConUso = new Set(usoCaballos.map((u) => u.nombre));
    return caballos.filter((c: Caballo) => !nombresConUso.has(c.nombre));
  }, [caballos, usoCaballos]);

  // ── Clases de prueba ─────────────────────────────────────────────────────────
  const estadisticasPrueba = useMemo(() => {
    const pruebas = clasesFiltradas.filter((c: Clase) => c.esPrueba);
    const porEspecialidad: Record<string, number> = {};
    pruebas.forEach((c: Clase) => {
      porEspecialidad[c.especialidad] =
        (porEspecialidad[c.especialidad] || 0) + 1;
    });

    // Conversión: alumnos activos que tuvieron clase de prueba en CUALQUIER momento
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

  // ── Helpers UI ───────────────────────────────────────────────────────────────
  interface TooltipPayload {
    name: string;
    value: number | string;
    color?: string;
    fill?: string;
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string | number;
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-border bg-background p-3 shadow-md text-sm">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p: TooltipPayload, i: number) => (
          <p key={i} style={{ color: p.color || p.fill }}>
            {p.name}: <span className="font-medium">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Reportes y Estadísticas"
          description="Análisis detallado de la actividad del club ecuestre"
        />

        {/* FILTROS DE FECHA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <NotebookPen className="h-5 w-5" />
              Período de Análisis
            </CardTitle>
            <CardDescription>
              Selecciona el rango de fechas para el reporte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
                <Input
                  id="fecha-inicio"
                  type="date"
                  value={dateRange.inicio}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, inicio: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha-fin">Fecha Fin</Label>
                <Input
                  id="fecha-fin"
                  type="date"
                  value={dateRange.fin}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, fin: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TARJETAS RESUMEN */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alumnos Activos
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estadisticasGenerales.alumnosActivos}
              </div>
              <p className="text-xs text-muted-foreground">
                {estadisticasGenerales.alumnosInactivos} inactivos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clases
              </CardTitle>
              <NotebookPen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estadisticasGenerales.totalClases}
              </div>
              <p className="text-xs text-muted-foreground">
                {estadisticasGenerales.tasaCompletado}% completadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Instructores
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estadisticasGenerales.totalInstructores}
              </div>
              <p className="text-xs text-muted-foreground">Activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clases de Prueba
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estadisticasPrueba.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {estadisticasPrueba.convertidos} conversiones
              </p>
            </CardContent>
          </Card>
        </div>

        {/* TABS */}
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="alumnos">Alumnos</TabsTrigger>
            <TabsTrigger value="clases">Clases</TabsTrigger>
            <TabsTrigger value="instructores">Instructores</TabsTrigger>
            <TabsTrigger value="caballos">Caballos</TabsTrigger>
            <TabsTrigger value="pruebas">Clases de Prueba</TabsTrigger>
          </TabsList>

          {/* ── TAB GENERAL ──────────────────────────────────────────────────── */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Distribución por plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Plan</CardTitle>
                  <CardDescription>
                    Alumnos por cantidad de clases mensuales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={alumnosPorClases}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis dataKey="plan" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="cantidad"
                        name="Alumnos"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Estados de clases — pie */}
              <Card>
                <CardHeader>
                  <CardTitle>Estados de Clases</CardTitle>
                  <CardDescription>
                    Distribución por estado en el período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {estadosClases.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={estadosClases}
                          dataKey="cantidad"
                          nameKey="estado"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ estado, porcentaje }) =>
                            `${estado} ${porcentaje}%`
                          }
                          labelLine={false}
                        >
                          {estadosClases.map((entry) => (
                            <Cell
                              key={entry.estado}
                              fill={ESTADO_COLORS[entry.estado] || "#8884d8"}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      Sin datos en el período
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Especialidades más demandadas */}
              <Card>
                <CardHeader>
                  <CardTitle>Especialidades más Demandadas</CardTitle>
                  <CardDescription>
                    Clases por tipo de especialidad en el período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {especialidadesDemanda.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={especialidadesDemanda}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 12 }}
                          allowDecimals={false}
                        />
                        <YAxis
                          dataKey="especialidad"
                          type="category"
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="cantidad"
                          name="Clases"
                          radius={[0, 4, 4, 0]}
                        >
                          {especialidadesDemanda.map((entry) => (
                            <Cell
                              key={entry.especialidad}
                              fill={
                                ESPECIALIDAD_COLORS[entry.especialidad] ||
                                "#8884d8"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      Sin datos en el período
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Distribución por día */}
              <Card>
                <CardHeader>
                  <CardTitle>Clases por Día de la Semana</CardTitle>
                  <CardDescription>
                    Distribución semanal en el período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={distribucionDias}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="cantidad"
                        name="Clases"
                        fill={CHART_COLORS.equinoterapia}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── TAB ALUMNOS ──────────────────────────────────────────────────── */}
          <TabsContent value="alumnos" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                  <CardDescription>
                    Estadísticas generales de alumnos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {estadisticasGenerales.alumnosActivos}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Alumnos Activos
                      </p>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                      <User className="h-8 w-8 text-success" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {estadisticasGenerales.alumnosInactivos}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Alumnos Inactivos
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {alumnos.length > 0
                        ? (
                            (estadisticasGenerales.alumnosInactivos /
                              alumnos.length) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ranking alumnos */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Alumnos — Clases Completadas</CardTitle>
                  <CardDescription>
                    Los más activos en el período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {rankingAlumnos.length > 0 ? (
                    <div className="space-y-2">
                      {rankingAlumnos.map((a, i) => (
                        <div key={a.nombre} className="flex items-center gap-3">
                          <span className="w-5 text-xs font-bold text-muted-foreground text-right">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {a.nombre}
                            </p>
                            <div className="h-1.5 mt-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{
                                  width: `${rankingAlumnos[0].completadas > 0 ? (a.completadas / rankingAlumnos[0].completadas) * 100 : 0}%`,
                                }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-bold tabular-nums w-6 text-right">
                            {a.completadas}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      Sin clases completadas en el período
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tabla asistencia — ACA/ASA separados */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Asistencia por Alumno</CardTitle>
                  <CardDescription>
                    Detalle de asistencia y ausencias en el período
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportarExcel(asistenciaPorAlumno, "Asistencia")
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-semibold text-sm">
                          Alumno
                        </th>
                        <th className="text-center p-3 font-semibold text-sm">
                          Total
                        </th>
                        <th className="text-center p-3 font-semibold text-sm text-success">
                          Completadas
                        </th>
                        <th className="text-center p-3 font-semibold text-sm text-destructive">
                          Canceladas
                        </th>
                        <th
                          className="text-center p-3 font-semibold text-sm"
                          style={{ color: CHART_COLORS.aca }}
                        >
                          ACA
                        </th>
                        <th
                          className="text-center p-3 font-semibold text-sm"
                          style={{ color: CHART_COLORS.asa }}
                        >
                          ASA
                        </th>
                        <th className="text-center p-3 font-semibold text-sm">
                          % Asistencia
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {asistenciaPorAlumno.map((item) => (
                        <tr
                          key={item.nombre}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-3 text-sm font-medium">
                            {item.nombre}
                          </td>
                          <td className="p-3 text-sm text-center">
                            {item.total}
                          </td>
                          <td className="p-3 text-sm text-center text-success font-medium">
                            {item.completadas}
                          </td>
                          <td className="p-3 text-sm text-center text-destructive">
                            {item.canceladas}
                          </td>
                          <td
                            className="p-3 text-sm text-center font-medium"
                            style={{ color: CHART_COLORS.aca }}
                          >
                            {item.aca}
                          </td>
                          <td
                            className="p-3 text-sm text-center font-medium"
                            style={{ color: CHART_COLORS.asa }}
                          >
                            {item.asa}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-success transition-all"
                                  style={{
                                    width: `${item.porcentajeAsistencia}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground tabular-nums">
                                {item.porcentajeAsistencia}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {asistenciaPorAlumno.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No hay datos de asistencia en este período
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB CLASES ───────────────────────────────────────────────────── */}
          <TabsContent value="clases" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total</CardTitle>
                  <CardDescription>En el período</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {estadisticasGenerales.totalClases}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Clases registradas
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Completadas</CardTitle>
                  <CardDescription>Finalizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-success">
                    {estadisticasGenerales.clasesCompletadas}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {estadisticasGenerales.tasaCompletado}% del total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Canceladas</CardTitle>
                  <CardDescription>No realizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-destructive">
                    {estadisticasGenerales.clasesCanceladas}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {estadisticasGenerales.totalClases > 0
                      ? (
                          (estadisticasGenerales.clasesCanceladas /
                            estadisticasGenerales.totalClases) *
                          100
                        ).toFixed(1)
                      : "0"}
                    % del total
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Estados (pie) */}
              <Card>
                <CardHeader>
                  <CardTitle>Por Estado</CardTitle>
                  <CardDescription>
                    Distribución de todos los estados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {estadosClases.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={estadosClases}
                          dataKey="cantidad"
                          nameKey="estado"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                        >
                          {estadosClases.map((entry) => (
                            <Cell
                              key={entry.estado}
                              fill={ESTADO_COLORS[entry.estado] || "#8884d8"}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      Sin datos
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Días (barras) */}
              <Card>
                <CardHeader>
                  <CardTitle>Por Día de Semana</CardTitle>
                  <CardDescription>Clases según el día</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={distribucionDias}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="cantidad"
                        name="Clases"
                        fill={CHART_COLORS.equitacion}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── TAB INSTRUCTORES ─────────────────────────────────────────────── */}
          <TabsContent value="instructores" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Carga por Instructor</CardTitle>
                  <CardDescription>
                    Clases asignadas en el período
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportarExcel(cargaInstructores, "Instructores")
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </CardHeader>
              <CardContent>
                {cargaInstructores.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={cargaInstructores}
                        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                          dataKey="completadas"
                          name="Completadas"
                          fill={CHART_COLORS.completada}
                          radius={[4, 4, 0, 0]}
                          stackId="a"
                        />
                        <Bar
                          dataKey="canceladas"
                          name="Canceladas"
                          fill={CHART_COLORS.cancelada}
                          radius={[4, 4, 0, 0]}
                          stackId="a"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="overflow-x-auto mt-4">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-3 font-semibold text-sm">
                              Instructor
                            </th>
                            <th className="text-center p-3 font-semibold text-sm">
                              Total
                            </th>
                            <th className="text-center p-3 font-semibold text-sm text-success">
                              Completadas
                            </th>
                            <th className="text-center p-3 font-semibold text-sm text-destructive">
                              Canceladas
                            </th>
                            <th className="text-center p-3 font-semibold text-sm">
                              Eficiencia
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {cargaInstructores.map((inst) => (
                            <tr
                              key={inst.nombre}
                              className="border-b hover:bg-muted/30 transition-colors"
                            >
                              <td className="p-3 text-sm font-medium">
                                {inst.nombre}
                              </td>
                              <td className="p-3 text-sm text-center">
                                {inst.total}
                              </td>
                              <td className="p-3 text-sm text-center text-success font-medium">
                                {inst.completadas}
                              </td>
                              <td className="p-3 text-sm text-center text-destructive">
                                {inst.canceladas}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2 justify-center">
                                  <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                                    <div
                                      className="h-full rounded-full bg-success transition-all"
                                      style={{ width: `${inst.eficiencia}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-muted-foreground tabular-nums">
                                    {inst.eficiencia}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No hay datos de instructores en este período
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB CABALLOS ─────────────────────────────────────────────────── */}
          <TabsContent value="caballos" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Disponibilidad</CardTitle>
                  <CardDescription>
                    Estado actual de los caballos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Disponibles",
                            value: estadisticasGenerales.caballosDisponibles,
                          },
                          {
                            name: "No disponibles",
                            value:
                              estadisticasGenerales.totalCaballos -
                              estadisticasGenerales.caballosDisponibles,
                          },
                        ]}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                      >
                        <Cell fill={CHART_COLORS.completada} />
                        <Cell fill={CHART_COLORS.cancelada} />
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Caballos sin uso */}
              <Card>
                <CardHeader>
                  <CardTitle>Sin Actividad en el Período</CardTitle>
                  <CardDescription>
                    {caballosSinUso.length === 0
                      ? "Todos los caballos tuvieron clases"
                      : `${caballosSinUso.length} caballo${caballosSinUso.length > 1 ? "s" : ""} sin clases`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {caballosSinUso.length > 0 ? (
                    <div className="space-y-2">
                      {caballosSinUso.map((c: Caballo) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                        >
                          <div className="flex items-center gap-2">
                            <ChessKnight className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {c.nombre}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge
                              status={c.tipo === "ESCUELA" ? "info" : "warning"}
                            >
                              {c.tipo === "ESCUELA" ? "Escuela" : "Privado"}
                            </StatusBadge>
                            <StatusBadge
                              status={c.disponible ? "success" : "error"}
                            >
                              {c.disponible ? "Disponible" : "No disp."}
                            </StatusBadge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ChessKnight className="h-10 w-10 text-success mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Todos activos en el período
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Uso de caballos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Uso de Caballos</CardTitle>
                  <CardDescription>
                    Clases realizadas por caballo en el período
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportarExcel(usoCaballos, "Caballos")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </CardHeader>
              <CardContent>
                {usoCaballos.length > 0 ? (
                  <>
                    <ResponsiveContainer
                      width="100%"
                      height={Math.max(200, usoCaballos.length * 35)}
                    >
                      <BarChart
                        data={usoCaballos}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 12 }}
                          allowDecimals={false}
                        />
                        <YAxis
                          dataKey="nombre"
                          type="category"
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="cantidad"
                          name="Clases"
                          radius={[0, 4, 4, 0]}
                        >
                          {usoCaballos.map((entry) => (
                            <Cell
                              key={entry.nombre}
                              fill={
                                entry.tipo === "PRIVADO"
                                  ? CHART_COLORS.privado
                                  : CHART_COLORS.escuela
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-2 justify-center">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          className="w-3 h-3 rounded-sm inline-block"
                          style={{ background: CHART_COLORS.escuela }}
                        />
                        Escuela
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          className="w-3 h-3 rounded-sm inline-block"
                          style={{ background: CHART_COLORS.privado }}
                        />
                        Privado
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No hay datos de uso en este período
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB CLASES DE PRUEBA ─────────────────────────────────────────── */}
          <TabsContent value="pruebas" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Pruebas</CardTitle>
                  <CardDescription>En el período</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {estadisticasPrueba.total}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Clases de prueba registradas
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Personas Nuevas</CardTitle>
                  <CardDescription>Sin cuenta de alumno</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {estadisticasPrueba.personasNuevas}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Primera vez en el sistema
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tasa de Conversión</CardTitle>
                  <CardDescription>Prueba → Alumno activo</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-success">
                    {estadisticasPrueba.convertidos}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Alumnos activos con prueba previa
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pruebas por Especialidad</CardTitle>
                <CardDescription>
                  Qué especialidades generan más interés
                </CardDescription>
              </CardHeader>
              <CardContent>
                {estadisticasPrueba.porEspecialidad.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={estadisticasPrueba.porEspecialidad}
                      margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis dataKey="especialidad" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="cantidad"
                        name="Pruebas"
                        radius={[4, 4, 0, 0]}
                      >
                        {estadisticasPrueba.porEspecialidad.map((entry) => (
                          <Cell
                            key={entry.especialidad}
                            fill={
                              ESPECIALIDAD_COLORS[entry.especialidad] ||
                              "#8884d8"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No hay clases de prueba en el período seleccionado
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
