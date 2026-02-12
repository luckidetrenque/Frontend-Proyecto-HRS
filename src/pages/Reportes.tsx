import { useQuery } from "@tanstack/react-query";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  DollarSign,
  Download,
  Landmark,
  PieChart as PieIcon,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

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

const COLORS = {
  primary: "hsl(150, 35%, 25%)",
  accent: "hsl(38, 70%, 50%)",
  success: "hsl(150, 45%, 40%)",
  warning: "hsl(38, 85%, 55%)",
  info: "hsl(200, 60%, 50%)",
  muted: "hsl(35, 20%, 88%)",
};

export default function ReportesPage() {
  const [dateRange, setDateRange] = useState({
    inicio: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    fin: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  // Cargar datos desde la API
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

  // Filtrar clases por rango de fechas
  const clasesFiltradas = useMemo(() => {
    return clases.filter((clase: Clase) => {
      const fechaClase = clase.dia;
      return fechaClase >= dateRange.inicio && fechaClase <= dateRange.fin;
    });
  }, [clases, dateRange]);

  // 📊 ESTADÍSTICAS GENERALES
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

    const ingresosEstimados = alumnos.reduce((sum: number, a: Alumno) => {
      return sum + a.cantidadClases * 5000;
    }, 0);

    return {
      alumnosActivos,
      alumnosInactivos: alumnos.filter((a: Alumno) => !a.activo).length,
      totalInstructores: instructores.filter((i: Instructor) => i.activo)
        .length,
      totalClases,
      clasesCompletadas,
      clasesCanceladas,
      tasaCompletado,
      ingresosEstimados,
      totalCaballos: caballos.length,
      caballosDisponibles: caballos.filter((c: Caballo) => c.disponible).length,
    };
  }, [alumnos, clasesFiltradas, instructores, caballos]);

  // 📈 ALUMNOS POR CANTIDAD DE CLASES
  const alumnosPorClases = useMemo(() => {
    const grupos: Record<number, number> = { 4: 0, 8: 0, 12: 0, 16: 0 };
    alumnos.forEach((a: Alumno) => {
      if (grupos[a.cantidadClases] !== undefined) {
        grupos[a.cantidadClases]++;
      }
    });
    return [
      {
        plan: "4 clases",
        cantidad: grupos[4],
        porcentaje:
          alumnos.length > 0
            ? ((grupos[4] / alumnos.length) * 100).toFixed(1)
            : "0",
      },
      {
        plan: "8 clases",
        cantidad: grupos[8],
        porcentaje:
          alumnos.length > 0
            ? ((grupos[8] / alumnos.length) * 100).toFixed(1)
            : "0",
      },
      {
        plan: "12 clases",
        cantidad: grupos[12],
        porcentaje:
          alumnos.length > 0
            ? ((grupos[12] / alumnos.length) * 100).toFixed(1)
            : "0",
      },
      {
        plan: "16 clases",
        cantidad: grupos[16],
        porcentaje:
          alumnos.length > 0
            ? ((grupos[16] / alumnos.length) * 100).toFixed(1)
            : "0",
      },
    ];
  }, [alumnos]);

  // 📊 ESTADOS DE CLASES
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
          ? ((cantidad / clasesFiltradas.length) * 100).toFixed(1)
          : "0",
    }));
  }, [clasesFiltradas]);

  // 👨‍🏫 CARGA POR INSTRUCTOR
  const cargaInstructores = useMemo(() => {
    const carga: Record<
      string,
      { total: number; completadas: number; canceladas: number }
    > = {};

    clasesFiltradas.forEach((c: Clase) => {
      const instructor = instructores.find(
        (i: Instructor) => i.id === c.instructorId,
      );
      if (instructor) {
        const nombre = `${instructor.nombre} ${instructor.apellido}`;
        if (!carga[nombre]) {
          carga[nombre] = { total: 0, completadas: 0, canceladas: 0 };
        }
        carga[nombre].total++;
        if (c.estado === "COMPLETADA") carga[nombre].completadas++;
        if (c.estado === "CANCELADA") carga[nombre].canceladas++;
      }
    });

    return Object.entries(carga).map(([nombre, datos]) => ({
      nombre,
      ...datos,
      eficiencia:
        datos.total > 0
          ? ((datos.completadas / datos.total) * 100).toFixed(1)
          : "0",
    }));
  }, [clasesFiltradas, instructores]);

  // 🐴 USO DE CABALLOS
  const usoCaballos = useMemo(() => {
    const uso: Record<string, number> = {};

    clasesFiltradas.forEach((c: Clase) => {
      const caballo = caballos.find((cab: Caballo) => cab.id === c.caballoId);
      if (caballo) {
        uso[caballo.nombre] = (uso[caballo.nombre] || 0) + 1;
      }
    });

    return Object.entries(uso)
      .map(([nombre, cantidad]) => {
        const caballo = caballos.find((c: Caballo) => c.nombre === nombre);
        return {
          nombre,
          cantidad,
          tipo: caballo?.tipo || "ESCUELA",
        };
      })
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [clasesFiltradas, caballos]);

  // 📅 DISTRIBUCIÓN POR DÍA DE SEMANA
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
      const fecha = parseISO(c.dia);
      const diaNombre = format(fecha, "EEEE", { locale: es });
      const diaCapitalizado =
        diaNombre.charAt(0).toUpperCase() + diaNombre.slice(1);
      if (dias[diaCapitalizado] !== undefined) {
        dias[diaCapitalizado]++;
      }
    });

    return Object.entries(dias).map(([dia, cantidad]) => ({
      dia,
      cantidad,
      porcentaje:
        clasesFiltradas.length > 0
          ? ((cantidad / clasesFiltradas.length) * 100).toFixed(1)
          : "0",
    }));
  }, [clasesFiltradas]);

  // 🕐 DISTRIBUCIÓN POR HORARIO
  const distribucionHorarios = useMemo(() => {
    const horarios: Record<string, number> = {
      Mañana: 0,
      Tarde: 0,
      Noche: 0,
    };

    clasesFiltradas.forEach((c: Clase) => {
      const hora = parseInt(c.hora.split(":")[0]);
      if (hora < 12) {
        horarios.Mañana++;
      } else if (hora < 18) {
        horarios.Tarde++;
      } else {
        horarios.Noche++;
      }
    });

    return Object.entries(horarios).map(([horario, cantidad]) => ({
      horario,
      cantidad,
      porcentaje:
        clasesFiltradas.length > 0
          ? ((cantidad / clasesFiltradas.length) * 100).toFixed(1)
          : "0",
    }));
  }, [clasesFiltradas]);

  // 📊 ASISTENCIA POR ALUMNO
  const asistenciaPorAlumno = useMemo(() => {
    const asistencia: Record<
      string,
      { total: number; asistidas: number; faltas: number }
    > = {};

    clasesFiltradas.forEach((c: Clase) => {
      const alumno = alumnos.find((a: Alumno) => a.id === c.alumnoId);
      if (alumno) {
        const nombre = `${alumno.nombre} ${alumno.apellido}`;
        if (!asistencia[nombre]) {
          asistencia[nombre] = { total: 0, asistidas: 0, faltas: 0 };
        }
        asistencia[nombre].total++;
        if (c.estado === "COMPLETADA") asistencia[nombre].asistidas++;
        if (c.estado === "CANCELADA") asistencia[nombre].faltas++;
      }
    });

    return Object.entries(asistencia).map(([nombre, datos]) => ({
      nombre,
      ...datos,
      porcentajeAsistencia:
        datos.total > 0
          ? ((datos.asistidas / datos.total) * 100).toFixed(1)
          : "0",
    }));
  }, [clasesFiltradas, alumnos]);

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
              <Calendar className="h-5 w-5" />
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

        {/* TARJETAS DE ESTADÍSTICAS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alumnos Activos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
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
              <Calendar className="h-4 w-4 text-muted-foreground" />
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
              <UserCheck className="h-4 w-4 text-muted-foreground" />
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
                Ingresos Estimados
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${estadisticasGenerales.ingresosEstimados.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Mensual</p>
            </CardContent>
          </Card>
        </div>

        {/* TABS DE REPORTES */}
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="alumnos">Alumnos</TabsTrigger>
            <TabsTrigger value="clases">Clases</TabsTrigger>
            <TabsTrigger value="instructores">Instructores</TabsTrigger>
            <TabsTrigger value="caballos">Caballos</TabsTrigger>
          </TabsList>

          {/* REPORTE GENERAL */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Plan</CardTitle>
                  <CardDescription>
                    Cantidad de alumnos por plan mensual
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {alumnosPorClases.map((item) => (
                    <div key={item.plan} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.plan}</span>
                        <span className="font-medium">{item.cantidad}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${item.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estados de Clases</CardTitle>
                  <CardDescription>
                    Distribución por estado en el período
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {estadosClases.map((item) => (
                    <div key={item.estado} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.estado}</span>
                        <span className="font-medium">{item.cantidad}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${item.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Día</CardTitle>
                  <CardDescription>Clases por día de la semana</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {distribucionDias.map((item) => (
                    <div key={item.dia} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.dia}</span>
                        <span className="font-medium">{item.cantidad}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${item.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Horario</CardTitle>
                  <CardDescription>Clases por franja horaria</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {distribucionHorarios.map((item) => (
                    <div key={item.horario} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.horario}</span>
                        <span className="font-medium">{item.cantidad}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${item.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* REPORTE ALUMNOS */}
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
                      <Users className="h-8 w-8 text-success" />
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

              <Card>
                <CardHeader>
                  <CardTitle>Por Plan</CardTitle>
                  <CardDescription>Distribución de planes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {alumnosPorClases.map((item) => (
                    <div
                      key={item.plan}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.plan}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.porcentaje}% del total
                        </p>
                      </div>
                      <div className="text-2xl font-bold">{item.cantidad}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Listado de Alumnos</CardTitle>
                  <CardDescription>Primeros 10 alumnos</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportarExcel(
                      alumnos.map((a: Alumno) => ({
                        Nombre: `${a.nombre} ${a.apellido}`,
                        Email: a.email,
                        Teléfono: a.telefono,
                        "Cantidad Clases": a.cantidadClases,
                        Estado: a.activo ? "Activo" : "Inactivo",
                        Propietario: a.propietario ? "Sí" : "No",
                        "Fecha Inscripción": a.fechaInscripcion || "N/A",
                      })),
                      "Alumnos",
                    )
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
                          Nombre
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          Clases
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          Estado
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          Propietario
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          Inscripción
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {alumnos.slice(0, 10).map((alumno: Alumno) => (
                        <tr
                          key={alumno.id}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-3 text-sm">
                            {alumno.nombre} {alumno.apellido}
                          </td>
                          <td className="p-3 text-sm font-medium">
                            {alumno.cantidadClases}
                          </td>
                          <td className="p-3">
                            <StatusBadge
                              status={alumno.activo ? "success" : "default"}
                            >
                              {alumno.activo ? "Activo" : "Inactivo"}
                            </StatusBadge>
                          </td>
                          <td className="p-3 text-sm">
                            {alumno.propietario ? "Sí" : "No"}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {alumno.fechaInscripcion
                              ? format(
                                  parseISO(alumno.fechaInscripcion),
                                  "dd/MM/yyyy",
                                  { locale: es },
                                )
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {alumnos.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No hay alumnos registrados
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REPORTE CLASES */}
          <TabsContent value="clases" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total</CardTitle>
                  <CardDescription>Clases en el período</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-3xl font-bold">
                        {estadisticasGenerales.totalClases}
                      </p>
                      <p className="text-sm text-muted-foreground">Clases</p>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completadas</CardTitle>
                  <CardDescription>Clases finalizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-3xl font-bold">
                        {estadisticasGenerales.clasesCompletadas}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {estadisticasGenerales.tasaCompletado}% del total
                      </p>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Canceladas</CardTitle>
                  <CardDescription>Clases no realizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-3xl font-bold">
                        {estadisticasGenerales.clasesCanceladas}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {estadisticasGenerales.totalClases > 0
                          ? (
                              (estadisticasGenerales.clasesCanceladas /
                                estadisticasGenerales.totalClases) *
                              100
                            ).toFixed(1)
                          : "0"}
                        % del total
                      </p>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                      <PieIcon className="h-8 w-8 text-destructive" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Por Estado</CardTitle>
                  <CardDescription>Distribución de estados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {estadosClases.map((item) => (
                    <div key={item.estado} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.estado}</span>
                        <span className="font-medium">{item.cantidad}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${item.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Por Día de Semana</CardTitle>
                  <CardDescription>Distribución semanal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {distribucionDias.map((item) => (
                    <div key={item.dia} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.dia}</span>
                        <span className="font-medium">{item.cantidad}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${item.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Asistencia por Alumno</CardTitle>
                  <CardDescription>
                    Porcentaje de asistencia en el período
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
                        <th className="text-left p-3 font-semibold text-sm">
                          Total
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          Asistidas
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          Faltas
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
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
                          <td className="p-3 text-sm">{item.total}</td>
                          <td className="p-3 text-sm text-success">
                            {item.asistidas}
                          </td>
                          <td className="p-3 text-sm text-destructive">
                            {item.faltas}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-success transition-all"
                                  style={{
                                    width: `${item.porcentajeAsistencia}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
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

          {/* REPORTE INSTRUCTORES */}
          <TabsContent value="instructores" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
                <CardDescription>Estadísticas de instructores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-3xl font-bold">
                      {estadisticasGenerales.totalInstructores}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Instructores Activos
                    </p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCheck className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-semibold text-sm">
                          Instructor
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          Total
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          Completadas
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          Canceladas
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          Eficiencia
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cargaInstructores.map((instructor) => (
                        <tr
                          key={instructor.nombre}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-3 text-sm font-medium">
                            {instructor.nombre}
                          </td>
                          <td className="p-3 text-sm">{instructor.total}</td>
                          <td className="p-3 text-sm text-success">
                            {instructor.completadas}
                          </td>
                          <td className="p-3 text-sm text-destructive">
                            {instructor.canceladas}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-success transition-all"
                                  style={{
                                    width: `${instructor.eficiencia}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {instructor.eficiencia}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {cargaInstructores.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No hay datos de instructores en este período
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REPORTE CABALLOS */}
          <TabsContent value="caballos" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Disponibilidad</CardTitle>
                  <CardDescription>
                    Estado actual de los caballos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {estadisticasGenerales.caballosDisponibles}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Disponibles
                      </p>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                      <Landmark className="h-8 w-8 text-success" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {estadisticasGenerales.totalCaballos -
                          estadisticasGenerales.caballosDisponibles}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        No disponibles
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {estadisticasGenerales.totalCaballos > 0
                        ? (
                            ((estadisticasGenerales.totalCaballos -
                              estadisticasGenerales.caballosDisponibles) /
                              estadisticasGenerales.totalCaballos) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Por Tipo</CardTitle>
                  <CardDescription>
                    Distribución por tipo de caballo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {
                          caballos.filter((c: Caballo) => c.tipo === "ESCUELA")
                            .length
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Caballos de Escuela
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {caballos.length > 0
                        ? (
                            (caballos.filter(
                              (c: Caballo) => c.tipo === "ESCUELA",
                            ).length /
                              caballos.length) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {
                          caballos.filter((c: Caballo) => c.tipo === "PRIVADO")
                            .length
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Caballos Privados
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {caballos.length > 0
                        ? (
                            (caballos.filter(
                              (c: Caballo) => c.tipo === "PRIVADO",
                            ).length /
                              caballos.length) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-semibold text-sm">
                          Caballo
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          Tipo
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          Clases
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          Uso
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {usoCaballos.map((caballo) => {
                        const porcentajeUso =
                          clasesFiltradas.length > 0
                            ? (
                                (caballo.cantidad / clasesFiltradas.length) *
                                100
                              ).toFixed(1)
                            : "0";
                        return (
                          <tr
                            key={caballo.nombre}
                            className="border-b hover:bg-muted/30 transition-colors"
                          >
                            <td className="p-3 text-sm font-medium">
                              {caballo.nombre}
                            </td>
                            <td className="p-3">
                              <StatusBadge
                                status={
                                  caballo.tipo === "ESCUELA"
                                    ? "info"
                                    : "warning"
                                }
                              >
                                {caballo.tipo === "ESCUELA"
                                  ? "Escuela"
                                  : "Privado"}
                              </StatusBadge>
                            </td>
                            <td className="p-3 text-sm">{caballo.cantidad}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${porcentajeUso}%` }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {porcentajeUso}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {usoCaballos.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No hay datos de uso de caballos en este período
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
