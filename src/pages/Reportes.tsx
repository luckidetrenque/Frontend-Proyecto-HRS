import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  TrendingUp,
  Users,
  DollarSign,
  UserCheck,
  Calendar,
  Landmark,
  PieChart as PieIcon,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  alumnosApi,
  clasesApi,
  instructoresApi,
  caballosApi,
  Alumno,
  Clase,
  Instructor,
  Caballo,
} from "@/lib/api";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import * as XLSX from "xlsx";

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
      .map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
        tipo:
          caballos.find((c: Caballo) => c.nombre === nombre)?.tipo || "ESCUELA",
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [clasesFiltradas, caballos]);

  // 📥 EXPORTAR A EXCEL CON FORMATO
  const exportarExcel = (data: unknown[], nombreHoja: string) => {
    const ws = XLSX.utils.json_to_sheet(data);

    // Aplicar ancho de columnas
    const maxWidth = 20;
    const cols = Object.keys(data[0] || {}).map(() => ({ wch: maxWidth }));
    ws["!cols"] = cols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    XLSX.writeFile(
      wb,
      `Reporte_${nombreHoja}_${format(new Date(), "yyyy-MM-dd")}.xlsx`,
    );
  };

  const exportarReporteCompleto = () => {
    const wb = XLSX.utils.book_new();

    // Hoja 1: Estadísticas Generales
    const stats = [
      {
        Métrica: "Alumnos Activos",
        Valor: estadisticasGenerales.alumnosActivos,
      },
      {
        Métrica: "Alumnos Inactivos",
        Valor: estadisticasGenerales.alumnosInactivos,
      },
      {
        Métrica: "Instructores Activos",
        Valor: estadisticasGenerales.totalInstructores,
      },
      {
        Métrica: "Caballos Totales",
        Valor: estadisticasGenerales.totalCaballos,
      },
      {
        Métrica: "Caballos Disponibles",
        Valor: estadisticasGenerales.caballosDisponibles,
      },
      {
        Métrica: "Total Clases (Período)",
        Valor: estadisticasGenerales.totalClases,
      },
      {
        Métrica: "Clases Completadas",
        Valor: estadisticasGenerales.clasesCompletadas,
      },
      {
        Métrica: "Clases Canceladas",
        Valor: estadisticasGenerales.clasesCanceladas,
      },
      {
        Métrica: "Tasa Completado (%)",
        Valor: estadisticasGenerales.tasaCompletado,
      },
      {
        Métrica: "Ingresos Estimados ($)",
        Valor: estadisticasGenerales.ingresosEstimados,
      },
    ];
    const ws1 = XLSX.utils.json_to_sheet(stats);
    ws1["!cols"] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Estadísticas");

    // Hoja 2: Alumnos
    const alumnosExport = alumnos.map((a: Alumno) => ({
      Nombre: a.nombre,
      Apellido: a.apellido,
      DNI: a.dni,
      Email: a.email,
      Teléfono: a.telefono,
      "Clases/Mes": a.cantidadClases,
      Propietario: a.propietario ? "Sí" : "No",
      Estado: a.activo ? "Activo" : "Inactivo",
      "Fecha Inscripción": a.fechaInscripcion,
    }));
    const ws2 = XLSX.utils.json_to_sheet(alumnosExport);
    ws2["!cols"] = Array(9).fill({ wch: 18 });
    XLSX.utils.book_append_sheet(wb, ws2, "Alumnos");

    // Hoja 3: Clases
    const clasesExport = clasesFiltradas.map((c: Clase) => ({
      Fecha: c.dia,
      Hora: c.hora,
      Especialidad: c.especialidad,
      Estado: c.estado,
      Alumno: alumnos.find((a: Alumno) => a.id === c.alumnoId)?.nombre || "",
      Instructor:
        instructores.find((i: Instructor) => i.id === c.instructorId)?.nombre ||
        "",
      Caballo:
        caballos.find((cab: Caballo) => cab.id === c.caballoId)?.nombre || "",
    }));
    const ws3 = XLSX.utils.json_to_sheet(clasesExport);
    ws3["!cols"] = Array(7).fill({ wch: 18 });
    XLSX.utils.book_append_sheet(wb, ws3, "Clases");

    // Hoja 4: Instructores
    const ws4 = XLSX.utils.json_to_sheet(cargaInstructores);
    ws4["!cols"] = Array(5).fill({ wch: 18 });
    XLSX.utils.book_append_sheet(wb, ws4, "Instructores");

    // Hoja 5: Caballos
    const ws5 = XLSX.utils.json_to_sheet(usoCaballos);
    ws5["!cols"] = Array(3).fill({ wch: 18 });
    XLSX.utils.book_append_sheet(wb, ws5, "Caballos");

    XLSX.writeFile(
      wb,
      `Reporte_Completo_${format(new Date(), "yyyy-MM-dd")}.xlsx`,
    );
  };

  return (
    <Layout>
      <PageHeader
        title="Reportes y Estadísticas"
        description="Análisis completo de la operación de la escuela"
        action={
          <Button onClick={exportarReporteCompleto} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Todo
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Filtros de Fecha */}
        <Card>
          <CardHeader>
            <CardTitle>Período de Análisis</CardTitle>
            <CardDescription>
              Selecciona el rango de fechas para los reportes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Fecha Inicio</Label>
                <Input
                  type="date"
                  value={dateRange.inicio}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      inicio: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha Fin</Label>
                <Input
                  type="date"
                  value={dateRange.fin}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, fin: e.target.value }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
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
                Instructores
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estadisticasGenerales.totalInstructores}
              </div>
              <p className="text-xs text-muted-foreground">Equipo activo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tasa Completado
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estadisticasGenerales.tasaCompletado}%
              </div>
              <p className="text-xs text-muted-foreground">
                {estadisticasGenerales.clasesCompletadas} de{" "}
                {estadisticasGenerales.totalClases} clases
              </p>
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
              <p className="text-xs text-muted-foreground">
                Mensuales proyectados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Reportes */}
        <Tabs defaultValue="alumnos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="alumnos">Alumnos</TabsTrigger>
            <TabsTrigger value="clases">Clases</TabsTrigger>
            <TabsTrigger value="instructores">Instructores</TabsTrigger>
            <TabsTrigger value="caballos">Caballos</TabsTrigger>
          </TabsList>

          {/* REPORTE ALUMNOS */}
          <TabsContent value="alumnos" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Distribución por Plan</CardTitle>
                    <CardDescription>
                      Clases mensuales contratadas
                    </CardDescription>
                  </div>
                  <PieIcon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alumnosPorClases.map((item, index) => (
                      <div key={item.plan} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.plan}</span>
                          <span className="text-muted-foreground">
                            {item.cantidad} alumnos ({item.porcentaje}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${item.porcentaje}%`,
                              backgroundColor: Object.values(COLORS)[index],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Propietarios</CardTitle>
                  <CardDescription>Alumnos con caballo propio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">
                          {alumnos.filter((a: Alumno) => a.propietario).length}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Con caballo propio
                        </p>
                      </div>
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Landmark className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">
                          {alumnos.filter((a: Alumno) => !a.propietario).length}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Sin caballo propio
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {alumnos.length > 0
                          ? (
                              (alumnos.filter((a: Alumno) => !a.propietario)
                                .length /
                                alumnos.length) *
                              100
                            ).toFixed(1)
                          : "0"}
                        %
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Listado de Alumnos</CardTitle>
                  <CardDescription>
                    {alumnos.length} alumnos registrados
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportarExcel(
                      alumnos.map((a: Alumno) => ({
                        Nombre: `${a.nombre} ${a.apellido}`,
                        DNI: a.dni,
                        Email: a.email,
                        Teléfono: a.telefono,
                        "Clases/Mes": a.cantidadClases,
                        Propietario: a.propietario ? "Sí" : "No",
                        Estado: a.activo ? "Activo" : "Inactivo",
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
                          Clases/Mes
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
                            {format(
                              parseISO(alumno.fechaInscripcion),
                              "dd/MM/yyyy",
                              { locale: es },
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {alumnos.length > 10 && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Mostrando 10 de {alumnos.length} alumnos
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REPORTE CLASES */}
          <TabsContent value="clases" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Estados de Clases</CardTitle>
                  <CardDescription>
                    Distribución por estado en el período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {estadosClases.map((item) => (
                      <div key={item.estado} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.estado}</span>
                          <span className="text-muted-foreground">
                            {item.cantidad} ({item.porcentaje}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all bg-primary"
                            style={{ width: `${item.porcentaje}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen del Período</CardTitle>
                  <CardDescription>
                    {format(parseISO(dateRange.inicio), "dd/MM/yyyy")} -{" "}
                    {format(parseISO(dateRange.fin), "dd/MM/yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total de clases
                    </span>
                    <span className="text-2xl font-bold">
                      {estadisticasGenerales.totalClases}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Completadas
                    </span>
                    <span className="text-lg font-semibold text-success">
                      {estadisticasGenerales.clasesCompletadas}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Canceladas
                    </span>
                    <span className="text-lg font-semibold text-destructive">
                      {estadisticasGenerales.clasesCanceladas}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Detalle de Clases</CardTitle>
                  <CardDescription>
                    {clasesFiltradas.length} clases en el período
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportarExcel(
                      clasesFiltradas.map((c: Clase) => ({
                        Fecha: c.dia,
                        Hora: c.hora,
                        Alumno:
                          alumnos.find((a: Alumno) => a.id === c.alumnoId)
                            ?.nombre || "",
                        Instructor:
                          instructores.find(
                            (i: Instructor) => i.id === c.instructorId,
                          )?.nombre || "",
                        Caballo:
                          caballos.find(
                            (cab: Caballo) => cab.id === c.caballoId,
                          )?.nombre || "",
                        Estado: c.estado,
                      })),
                      "Clases",
                    )
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </CardHeader>
            </Card>
          </TabsContent>

          {/* REPORTE INSTRUCTORES */}
          <TabsContent value="instructores" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Carga de Trabajo</CardTitle>
                  <CardDescription>
                    Clases por instructor en el período
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
                          Total Clases
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
                          <td className="p-3 text-sm">
                            <span className="font-semibold">
                              {instructor.eficiencia}%
                            </span>
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
