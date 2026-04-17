import { useQuery } from "@tanstack/react-query";
import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";

import { Layout } from "@/components/Layout";
import {
  ESTADO_COLORS,
  ESTADO_LABELS,
  formatearConZona,
} from "@/components/calendar/clases.constants";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { alumnosApi, clasesApi, Clase } from "@/lib/api";

export default function MisClasesPage() {
  const { user } = useAuth();

  // 1. Obtener el perfil del alumno logueado
  const { data: miPerfil, isLoading: loadingPerfil } = useQuery({
    queryKey: ["alumno-me"],
    queryFn: alumnosApi.me,
    enabled: user?.rol === "ALUMNO",
  });

  // 2. Obtener las clases del alumno usando su ID
  const { data: misClases = [], isLoading: loadingClases } = useQuery({
    queryKey: ["clases-alumno", miPerfil?.id],
    queryFn: () => clasesApi.buscarPorAlumno(miPerfil!.id),
    enabled: !!miPerfil?.id,
  });

  const isLoading = loadingPerfil || loadingClases;

  // Calcular estadísticas
  const estadisticas = {
    total: misClases.length,
    completadas: misClases.filter((c) => c.estado === "COMPLETADA").length,
    programadas: misClases.filter((c) => c.estado === "PROGRAMADA").length,
    canceladas: misClases.filter((c) => c.estado === "CANCELADA").length,
  };

  const porcentajeCompletadas =
    estadisticas.total > 0
      ? ((estadisticas.completadas / estadisticas.total) * 100).toFixed(1)
      : "0";

  const columns = [
    {
      header: "Fecha",
      cell: (row: Clase) => {
        const [year, month, day] = row.dia.split("-");
        return `${day}/${month}/${year}`;
      },
    },
    {
      header: "Hora",
      cell: (row: Clase) => formatearConZona(row.diaHoraCompleto),
    },
    {
      header: "Especialidad",
      cell: (row: Clase) => (
        <span className="font-medium">{row.especialidad}</span>
      ),
    },
    {
      header: "Duración",
      cell: (row: Clase) => `${row.duracion} min`,
    },
    {
      header: "Estado",
      cell: (row: Clase) => {
        const variant = ESTADO_COLORS[row.estado];
        const label = ESTADO_LABELS[row.estado];
        return <StatusBadge status={variant}>{label}</StatusBadge>;
      },
    },
    {
      header: "Observaciones",
      cell: (row: Clase) => (
        <span className="text-sm text-muted-foreground">
          {row.observaciones || "—"}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando tus clases...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        title="Mis Clases"
        description={
          miPerfil
            ? `Historial de clases de ${miPerfil.nombre} ${miPerfil.apellido}`
            : "Historial de tus clases"
        }
      />

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total</p>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{estadisticas.total}</p>
            <p className="text-xs text-muted-foreground mt-1">Todas las clases</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-success">Completadas</p>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">
              {estadisticas.completadas}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {porcentajeCompletadas}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-primary">Próximas</p>
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">
              {estadisticas.programadas}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Programadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-destructive">Canceladas</p>
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-destructive">
              {estadisticas.canceladas}
            </p>
            <p className="text-xs text-muted-foreground mt-1">No realizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Info del plan si existe */}
      {miPerfil && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Mi Plan</CardTitle>
            <CardDescription>Información sobre tu inscripción</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Clases contratadas / mes
                </p>
                <p className="text-2xl font-bold">{miPerfil.cantidadClases}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Estado
                </p>
                <StatusBadge status={miPerfil.activo ? "success" : "default"}>
                  {miPerfil.activo ? "Activo" : "Inactivo"}
                </StatusBadge>
              </div>
              {miPerfil.tipoPension && miPerfil.tipoPension !== "SIN_CABALLO" && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Tipo de pensión
                  </p>
                  <p className="font-medium">
                    {miPerfil.tipoPension === "CABALLO_PROPIO"
                      ? "Caballo Propio"
                      : "Reserva Escuela"}
                    {miPerfil.cuotaPension && ` — ${miPerfil.cuotaPension}`}
                  </p>
                </div>
              )}
              {miPerfil.caballoNombre && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Caballo
                  </p>
                  <p className="font-medium">{miPerfil.caballoNombre}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de clases */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historial</CardTitle>
          <CardDescription>Todas tus clases registradas</CardDescription>
        </CardHeader>
        <CardContent>
          {misClases.length > 0 ? (
            <DataTable
              columns={columns}
              data={misClases}
              isLoading={false}
              emptyMessage="No hay clases registradas"
            />
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-medium mb-1">No hay clases registradas</p>
              <p className="text-sm text-muted-foreground">
                Aún no tenés clases programadas o completadas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
