// src/pages/InstructorDetalle.tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  GraduationCap,
  Mail,
  MessageCircle,
  Phone,
  Presentation,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { InstructorForm } from "@/components/forms/InstructorForm";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EntityDetailActions } from "@/components/ui/entity-detail-actions";
import { InfoField } from "@/components/ui/InfoField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { PRESET_COLORS } from "@/constants/instructor.constants";
import { useEntityActions } from "@/hooks/useEntityActions";
import { useValidarDniDuplicado } from "@/hooks/useValidarDniDuplicado";
import { Clase, clasesApi, Instructor, instructoresApi } from "@/lib/api";

export default function InstructorDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const instructorId = parseInt(id || "0");

  const queryClient = useQueryClient();
  const {
    entityToDelete: instructorToDelete,
    isDialogOpen: isEditOpen,
    openEdit,
    closeEdit,
    openDelete,
    closeDelete,
  } = useEntityActions<Instructor>();

  // Query para obtener el instructor
  const { data: instructor, isLoading: loadingInstructor } = useQuery({
    queryKey: ["instructor", instructorId],
    queryFn: () => instructoresApi.obtener(instructorId),
    enabled: !!instructorId,
  });

  const [dni, setDni] = useState<Instructor["dni"]>("");
  const [validacionHabilitada, setValidacionHabilitada] = useState(false);
  const { data: validacionDni } = useValidarDniDuplicado(
    "instructores",
    dni,
    instructor?.id,
  );
  const validacionActiva =
    validacionHabilitada && dni.length >= 9
      ? validacionDni
      : { duplicado: false, mensaje: "" };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Instructor> }) =>
      instructoresApi.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", instructorId] });
      queryClient.invalidateQueries({ queryKey: ["instructores"] });
      closeEdit();
      toast.success("Instructor actualizado correctamente");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al actualizar el instructor"),
  });

  const deleteMutation = useMutation({
    mutationFn: instructoresApi.eliminar,
    onSuccess: (data) => {
      const successMsg =
        data.__successMessage || "Instructor eliminado correctamente";
      toast.success(successMsg);
      navigate("/instructores");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al eliminar el instructor"),
  });

  useEffect(() => {
    if (isEditOpen && instructor) {
      setDni(instructor.dni);
      setValidacionHabilitada(false);
    }
  }, [isEditOpen, instructor]);

  // Query para obtener las clases del instructor
  const { data: clasesInstructorData = [], isLoading: loadingClases } =
    useQuery({
      queryKey: ["clases-instructor", instructorId],
      queryFn: () => clasesApi.buscarPorInstructor(instructorId),
      enabled: !!instructorId,
    });

  const clasesInstructor = Array.isArray(clasesInstructorData)
    ? clasesInstructorData
    : [];

  // Calcular estadísticas
  const estadisticas = {
    total: clasesInstructor.length,
    completadas: clasesInstructor.filter((c) => c.estado === "COMPLETADA")
      .length,
    programadas: clasesInstructor.filter((c) => c.estado === "PROGRAMADA")
      .length,
    iniciada: clasesInstructor.filter((c) => c.estado === "INICIADA").length,
    canceladas: clasesInstructor.filter((c) => c.estado === "CANCELADA").length,
  };

  // Calcular distribución por especialidad
  const especialidades = {
    EQUITACION: clasesInstructor.filter((c) => c.especialidad === "EQUITACION")
      .length,
    ADIESTRAMIENTO: clasesInstructor.filter(
      (c) => c.especialidad === "ADIESTRAMIENTO",
    ).length,
    EQUINOTERAPIA: clasesInstructor.filter(
      (c) => c.especialidad === "EQUINOTERAPIA",
    ).length,
    MONTA: clasesInstructor.filter((c) => c.especialidad === "MONTA").length,
  };

  const porcentajeCompletadas =
    estadisticas.total > 0
      ? ((estadisticas.completadas / estadisticas.total) * 100).toFixed(1)
      : "0";

  // Columnas para la tabla de clases
  const columnasClases = [
    {
      header: "Fecha",
      cell: (row: Clase) => {
        const [year, month, day] = row.dia.split("-");
        return `${day}/${month}/${year}`;
      },
    },
    { header: "Hora", accessorKey: "hora" as keyof Clase },
    {
      header: "Especialidad",
      cell: (row: Clase) => (
        <span className="font-medium">{row.especialidad}</span>
      ),
    },
    {
      header: "Estado",
      cell: (row: Clase) => {
        const statusMap = {
          COMPLETADA: { variant: "success" as const, label: "Completada" },
          PROGRAMADA: { variant: "warning" as const, label: "Programada" },
          INICIADA: { variant: "info" as const, label: "Iniciada" },
          CANCELADA: { variant: "error" as const, label: "Cancelada" },
          ACA: { variant: "info" as const, label: "ACA" },
          ASA: { variant: "info" as const, label: "ASA" },
        };
        const status = statusMap[row.estado] || statusMap.PROGRAMADA;
        return (
          <StatusBadge status={status.variant}>{status.label}</StatusBadge>
        );
      },
    },
    {
      header: "Observaciones",
      cell: (row: Clase) => (
        <span className="text-sm text-muted-foreground">
          {row.observaciones || "-"}
        </span>
      ),
    },
  ];

  if (loadingInstructor) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando información...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!instructor) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">
              Instructor no encontrado
            </p>
            <Button onClick={() => navigate("/instructores")}>
              Volver a Instructores
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleContactWhatsApp = () => {
    window.open(
      encodeURI(
        `https://wa.me/${instructor.telefono}?text=Hola ${instructor.nombre}, te contactamos desde la Escuela para avisarte que... `,
      ),
      "_blank",
    );
  };

  return (
    <>
      <Layout>
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/instructores")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <PageHeader
            title="Perfil de Instructor"
            description={`Información detallada de ${instructor.nombre} ${instructor.apellido}`}
            action={
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleContactWhatsApp}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contactar
                </Button>
                <EntityDetailActions
                  onEdit={() => openEdit(instructor)}
                  onDelete={() => openDelete(instructor)}
                  entityName="instructor"
                />
              </div>
            }
          />
        </div>

        <div className="space-y-6">
          {/* Información Personal + Especialidades */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Card de Información Personal */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Información Personal
                    </CardTitle>
                    <CardDescription>Datos del instructor</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Primera fila: Nombre y DNI */}
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Nombre Completo">
                    {instructor.nombre} {instructor.apellido}
                  </InfoField>
                  <InfoField label="DNI">{instructor.dni}</InfoField>
                </div>

                {/* Segunda fila: Fecha y Edad */}
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Fecha de Nacimiento">
                    {new Date(instructor.fechaNacimiento).toLocaleDateString(
                      "es-AR",
                    )}
                  </InfoField>
                  <InfoField label="Edad">
                    {new Date().getFullYear() -
                      new Date(instructor.fechaNacimiento).getFullYear()}{" "}
                    años
                  </InfoField>
                </div>

                {/* Tercera fila: Teléfono y Email */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <InfoField label="Teléfono">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{instructor.telefono}</span>
                    </div>
                  </InfoField>
                  <InfoField label="Email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{instructor.email || "No especificado"}</span>
                    </div>
                  </InfoField>
                </div>

                {/* Cuarta fila: Estado y Color */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <InfoField label="Estado">
                    <StatusBadge
                      status={instructor.activo ? "success" : "default"}
                    >
                      {instructor.activo ? "Activo" : "Inactivo"}
                    </StatusBadge>
                  </InfoField>

                  {instructor.color && (
                    <InfoField label="Color Asignado">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-md border border-gray-300"
                          style={{ backgroundColor: instructor.color }}
                        />
                        <span className="font-mono text-xs text-muted-foreground">
                          {instructor.color}
                        </span>
                      </div>
                    </InfoField>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card de Especialidades */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Presentation className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Especialidades</CardTitle>
                    <CardDescription>
                      Distribución de clases por especialidad
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(especialidades).map(
                    ([especialidad, cantidad]) =>
                      cantidad > 0 && (
                        <div
                          key={especialidad}
                          className="rounded-lg border border-border bg-muted/30 p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">{especialidad}</p>
                            <span className="text-2xl font-bold text-primary">
                              {cantidad}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{
                                width: `${
                                  (cantidad / estadisticas.total) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {((cantidad / estadisticas.total) * 100).toFixed(1)}
                            % del total
                          </p>
                        </div>
                      ),
                  )}

                  {estadisticas.total === 0 && (
                    <div className="text-center py-8">
                      <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No hay clases registradas aún
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas de Clases */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Estadísticas de Clases
                  </CardTitle>
                  <CardDescription>
                    Resumen de clases impartidas por este instructor
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{estadisticas.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Todas las clases
                  </p>
                </div>

                <div className="rounded-lg border border-success/50 bg-success/5 p-4">
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
                </div>

                <div className="rounded-lg border border-primary/50 bg-primary/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-primary">Programadas</p>
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {estadisticas.programadas}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Próximas clases
                  </p>
                </div>

                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-destructive">Canceladas</p>
                    <XCircle className="h-4 w-4 text-destructive" />
                  </div>
                  <p className="text-2xl font-bold text-destructive">
                    {estadisticas.canceladas}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Clases canceladas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historial de Clases */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de Clases</CardTitle>
              <CardDescription>
                Todas las clases impartidas por este instructor
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingClases ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : clasesInstructor.length > 0 ? (
                <DataTable
                  columns={columnasClases}
                  data={clasesInstructor}
                  isLoading={false}
                />
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-lg font-medium mb-1">
                    No hay clases registradas
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Este instructor aún no tiene clases programadas o
                    completadas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={isEditOpen} onOpenChange={(open) => !open && closeEdit()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">
                Editar Instructor
              </DialogTitle>
              <DialogDescription>
                Modifica los datos del instructor
              </DialogDescription>
            </DialogHeader>

            <InstructorForm
              instructor={instructor}
              onSubmit={(data) =>
                updateMutation.mutate({ id: instructorId, data })
              }
              isPending={updateMutation.isPending}
              validacionDni={validacionActiva}
              onDniChange={(dni) => {
                setDni(dni);
                setValidacionHabilitada(true);
              }}
              onCancel={closeEdit}
            />
          </DialogContent>
        </Dialog>
        <Dialog open={!!instructorToDelete} onOpenChange={closeDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar instructor</DialogTitle>
              <DialogDescription>
                ¿Seguro que deseas eliminar a {instructor.nombre}{" "}
                {instructor.apellido}? Esta acción no se puede deshacer y el
                instructor será removido del sistema.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={closeDelete}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(instructor.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
    </>
  );
}
