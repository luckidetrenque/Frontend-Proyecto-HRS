import { useQuery } from "@tanstack/react-query";
import { endOfMonth, format, parseISO,startOfMonth } from "date-fns";
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
import { useMemo,useState } from "react";

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
      .map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
        tipo:
          caballos.find((c: Caballo) => c.nombre === nombre)?.tipo || "ESCUELA",
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [clasesFiltradas, caballos]);

  // 📥 EXPORTAR A EXCEL CON FORMATO

  // ==========================================
  // NUEVA FUNCIÓN exportarReporteCompleto
  // Copiar y pegar completa desde aquí hasta el final
  // ==========================================

  const exportarReporteCompleto = async () => {
    try {
      const ExcelJS = await import("exceljs");
      const { saveAs } = await import("file-saver");
      const workbook = new ExcelJS.Workbook();

      // HOJA 1: ESTADÍSTICAS
      const statsSheet = workbook.addWorksheet("Estadísticas");
      statsSheet.addRow(["ESTADÍSTICAS GENERALES"]);
      statsSheet.mergeCells("A1:B1");
      statsSheet.getRow(1).font = {
        size: 14,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      statsSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      statsSheet.getRow(1).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      statsSheet.getRow(1).height = 25;

      const statsHeader = statsSheet.addRow(["Métrica", "Valor"]);
      statsHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
      statsHeader.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF5B9BD5" },
      };

      [
        ["Alumnos Activos", estadisticasGenerales.alumnosActivos],
        ["Alumnos Inactivos", estadisticasGenerales.alumnosInactivos],
        ["Instructores Activos", estadisticasGenerales.totalInstructores],
        ["Caballos Totales", estadisticasGenerales.totalCaballos],
        ["Caballos Disponibles", estadisticasGenerales.caballosDisponibles],
        ["Total Clases (Período)", estadisticasGenerales.totalClases],
        ["Clases Completadas", estadisticasGenerales.clasesCompletadas],
        ["Clases Canceladas", estadisticasGenerales.clasesCanceladas],
        ["Tasa Completado (%)", estadisticasGenerales.tasaCompletado],
        ["Ingresos Estimados ($)", estadisticasGenerales.ingresosEstimados],
      ].forEach(([metrica, valor], idx) => {
        const row = statsSheet.addRow([metrica, valor]);
        if (idx % 2 === 0)
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8F9FA" },
          };
        row.getCell(2).alignment = { horizontal: "right" };
      });

      statsSheet.getColumn(1).width = 30;
      statsSheet.getColumn(2).width = 20;

      // HOJA 2: ALUMNOS
      const alumnosSheet = workbook.addWorksheet("Alumnos");
      alumnosSheet.addRow(["LISTA DE ALUMNOS"]);
      alumnosSheet.mergeCells("A1:I1");
      alumnosSheet.getRow(1).font = {
        size: 14,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      alumnosSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2E7D32" },
      };
      alumnosSheet.getRow(1).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      alumnosSheet.getRow(1).height = 25;

      const alumnosHeader = alumnosSheet.addRow([
        "Nombre",
        "Apellido",
        "DNI",
        "Email",
        "Teléfono",
        "Clases/Mes",
        "Propietario",
        "Estado",
        "Fecha Inscripción",
      ]);
      alumnosHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
      alumnosHeader.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF66BB6A" },
      };

      alumnos.forEach((a: Alumno, idx) => {
        const row = alumnosSheet.addRow([
          a.nombre,
          a.apellido,
          a.dni,
          a.email,
          a.telefono,
          a.cantidadClases,
          a.propietario ? "Sí" : "No",
          a.activo ? "Activo" : "Inactivo",
          a.fechaInscripcion,
        ]);
        if (idx % 2 === 0)
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8F9FA" },
          };
      });

      alumnosSheet.columns.forEach((col) => {
        col.width = 18;
      });

      // HOJA 3: CLASES
      const clasesSheet = workbook.addWorksheet("Clases");
      clasesSheet.addRow([
        `CLASES - ${format(new Date(dateRange.inicio), "dd/MM/yyyy")} al ${format(new Date(dateRange.fin), "dd/MM/yyyy")}`,
      ]);
      clasesSheet.mergeCells("A1:G1");
      clasesSheet.getRow(1).font = {
        size: 14,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      clasesSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      clasesSheet.getRow(1).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      clasesSheet.getRow(1).height = 25;

      const clasesHeader = clasesSheet.addRow([
        "Fecha",
        "Hora",
        "Especialidad",
        "Estado",
        "Alumno",
        "Instructor",
        "Caballo",
      ]);
      clasesHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
      clasesHeader.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF5B9BD5" },
      };

      clasesFiltradas.forEach((c: Clase, idx) => {
        const row = clasesSheet.addRow([
          c.dia,
          c.hora,
          c.especialidad,
          c.estado,
          alumnos.find((a: Alumno) => a.id === c.alumnoId)?.nombre || "",
          instructores.find((i: Instructor) => i.id === c.instructorId)
            ?.nombre || "",
          caballos.find((cab: Caballo) => cab.id === c.caballoId)?.nombre || "",
        ]);
        if (idx % 2 === 0)
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8F9FA" },
          };
      });

      clasesSheet.columns.forEach((col) => {
        col.width = 18;
      });

      // HOJA 4: INSTRUCTORES
      const instructoresSheet = workbook.addWorksheet("Instructores");
      instructoresSheet.addRow(["CARGA DE INSTRUCTORES"]);
      instructoresSheet.mergeCells("A1:E1");
      instructoresSheet.getRow(1).font = {
        size: 14,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      instructoresSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF7B1FA2" },
      };
      instructoresSheet.getRow(1).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      instructoresSheet.getRow(1).height = 25;

      const instructoresHeader = instructoresSheet.addRow([
        "Nombre",
        "Total",
        "Completadas",
        "Canceladas",
        "Eficiencia",
      ]);
      instructoresHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
      instructoresHeader.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF9C27B0" },
      };

      cargaInstructores.forEach((inst, idx) => {
        const row = instructoresSheet.addRow([
          inst.nombre,
          inst.total,
          inst.completadas,
          inst.canceladas,
          `${inst.eficiencia}%`,
        ]);
        if (idx % 2 === 0)
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8F9FA" },
          };
      });

      instructoresSheet.columns.forEach((col) => {
        col.width = 18;
      });

      // HOJA 5: CABALLOS
      const caballosSheet = workbook.addWorksheet("Caballos");
      caballosSheet.addRow(["USO DE CABALLOS"]);
      caballosSheet.mergeCells("A1:C1");
      caballosSheet.getRow(1).font = {
        size: 14,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      caballosSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD4A017" },
      };
      caballosSheet.getRow(1).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      caballosSheet.getRow(1).height = 25;

      const caballosHeader = caballosSheet.addRow([
        "Nombre",
        "Tipo",
        "Cantidad",
      ]);
      caballosHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
      caballosHeader.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE4B429" },
      };

      usoCaballos.forEach((cab, idx) => {
        const row = caballosSheet.addRow([cab.nombre, cab.tipo, cab.cantidad]);
        if (idx % 2 === 0)
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8F9FA" },
          };
      });

      caballosSheet.columns.forEach((col) => {
        col.width = 18;
      });

      // GENERAR Y DESCARGAR
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `Reporte_Completo_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    } catch (error) {
      console.error("Error al exportar reporte completo:", error);
    }
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
