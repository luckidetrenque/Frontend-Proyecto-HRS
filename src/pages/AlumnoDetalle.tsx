import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChessKnight,
  ChevronRight,
  Clock,
  Edit,
  Mail,
  MessageCircle,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { AlumnoForm } from "@/components/forms/AlumnoForm";
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
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useEntityActions } from "@/hooks/useEntityActions";
import { useValidarDniDuplicado } from "@/hooks/useValidarDniDuplicado";
import { Alumno, alumnosApi, caballosApi, Clase, clasesApi } from "@/lib/api";

export default function AlumnoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const alumnoId = parseInt(id || "0");

  const {
    entityToDelete: alumnoToDelete,
    isDialogOpen: isEditOpen,
    openEdit,
    closeEdit,
    openDelete,
    closeDelete,
  } = useEntityActions<Alumno>();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Alumno> }) =>
      caballosApi.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caballo", alumnoId] });
      closeEdit();
      toast.success("Alumno actualizado correctamente");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: alumnosApi.eliminar,
    onSuccess: (data) => {
      const successMsg =
        data.__successMessage || "Alumno eliminado correctamente";
      toast.success(successMsg);
      navigate("/alumnos");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al eliminar el alumno"),
  });

  const { data: alumno, isLoading: loadingAlumno } = useQuery({
    queryKey: ["alumno", alumnoId],
    queryFn: () => alumnosApi.obtener(alumnoId),
    enabled: !!alumnoId && alumnoId !== 1,
  });

  const { data: clasesAlumnoData = [], isLoading: loadingData } = useQuery({
    queryKey: ["clases-alumno", alumnoId],
    queryFn: () => clasesApi.buscarPorAlumno(alumnoId),
    enabled: !!alumnoId && alumnoId !== 1,
  });

  const { data: caballos = [] } = useQuery({
    queryKey: ["caballos"],
    queryFn: caballosApi.listar,
  });

  const [dni, setDni] = useState<Alumno["dni"]>("");
  const [validacionHabilitada, setValidacionHabilitada] = useState(false);
  const { data: validacionDni } = useValidarDniDuplicado(
    "alumnos",
    dni,
    alumno?.id,
  );

  const validacionActiva =
    validacionHabilitada && dni.length >= 9
      ? validacionDni
      : { duplicado: false, mensaje: "" };

  useEffect(() => {
    if (isEditOpen && alumno) {
      setDni(alumno.dni);
      setValidacionHabilitada(false);
    }
  }, [isEditOpen, alumno]);

  const clasesAlumno = Array.isArray(clasesAlumnoData) ? clasesAlumnoData : [];

  // Calcular estadísticas
  const estadisticas = {
    total: clasesAlumno.length,
    completadas: clasesAlumno.filter((c) => c.estado === "COMPLETADA").length,
    programadas: clasesAlumno.filter((c) => c.estado === "PROGRAMADA").length,
    iniciada: clasesAlumno.filter((c) => c.estado === "INICIADA").length,
    canceladas: clasesAlumno.filter((c) => c.estado === "CANCELADA").length,
    aca: clasesAlumno.filter((c) => c.estado === "ACA").length,
    asa: clasesAlumno.filter((c) => c.estado === "ASA").length,
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

  if (loadingAlumno) {
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

  if (!alumno) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Alumno no encontrado</p>
            <Button onClick={() => navigate("/alumnos")}>
              Volver a Alumnos
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleContactWhatsApp = () => {
    window.open(
      encodeURI(
        `https://wa.me/${alumno.telefono}?text=Hola ${alumno.nombre}, te contactamos desde la Escuela para avisarte que... `,
      ),
      "_blank",
    );
  };

  const handleContactWEmail = () => {
    window.open(
      encodeURI(
        `mailto:${alumno.email}?subject=${encodeURIComponent(`Contacto para ${alumno.nombre} ${alumno.apellido}`)}`,
      ),
      "_blank",
    );
  };

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/alumnos")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title="Perfil de Alumno"
          description={`Información detallada de ${alumno.nombre} ${alumno.apellido}`}
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleContactWhatsApp}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Contactar
              </Button>
              <Button variant="outline" onClick={handleContactWEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Contactar por Email
              </Button>
              <EntityDetailActions
                onEdit={() => openEdit(alumno)}
                onDelete={() => openDelete(alumno)}
                entityName="alumno"
              />
            </div>
          }
        />
      </div>

      <div className="space-y-6">
        {/* Información Personal + Caballo */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card de Información Personal */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Información Personal
                  </CardTitle>
                  <CardDescription>Datos del alumno</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {" "}
              {/* Aumento el espacio entre secciones principales */}
              {/* Sección 1: Datos Principales (Grid 2x2) */}
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Nombre Completo">
                  {alumno.nombre} {alumno.apellido}
                </InfoField>
                <InfoField label="DNI">{alumno.dni}</InfoField>
                <InfoField label="Fecha de Nacimiento">
                  {new Date(alumno.fechaNacimiento).toLocaleDateString("es-AR")}
                </InfoField>
                <InfoField label="Edad">
                  {new Date().getFullYear() -
                    new Date(alumno.fechaNacimiento).getFullYear()}{" "}
                  años
                </InfoField>
              </div>
              {/* Sección 2: Contacto y Email (Grid 2x2) */}
              <div className="pt-4 border-t grid grid-cols-2 gap-4">
                <InfoField label="Teléfono">{alumno.telefono}</InfoField>
                <InfoField label="Email">
                  {alumno.email || "No especificado"}
                </InfoField>
              </div>
              {/* Sección 3: Clases e Inscripción (Grid 2x2) */}
              <div className="pt-4 border-t grid grid-cols-2 gap-4">
                <InfoField label="Fecha de Inscripción">
                  {new Date(alumno.fechaInscripcion).toLocaleDateString(
                    "es-AR",
                  )}
                </InfoField>
                <InfoField label="Clases por Mes">
                  <span className="text-lg">{alumno.cantidadClases}</span>
                </InfoField>
                {/* Muevo el estado aquí para que encaje en la cuadrícula */}
                <InfoField label="Estado">
                  <StatusBadge status={alumno.activo ? "success" : "default"}>
                    {alumno.activo ? "Activo" : "Inactivo"}
                  </StatusBadge>
                </InfoField>
              </div>
            </CardContent>
          </Card>
          {/* Card de Caballo Privado */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <ChessKnight className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">Caballo</CardTitle>
                  <CardDescription>
                    {alumno.tipoPension === "SIN_CABALLO" &&
                      "Se asigna caballo por clase"}
                    {alumno.tipoPension === "RESERVA_ESCUELA" &&
                      "Reserva caballo de escuela"}
                    {alumno.tipoPension === "CABALLO_PROPIO" &&
                      "Caballo propio"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {alumno.tipoPension === "SIN_CABALLO" ? (
                <div className="text-center py-8">
                  <div className="rounded-lg bg-muted/50 p-6">
                    <ChessKnight className="h-12 w-12 text-muted-foreground mx-auto mb-3" />

                    <p className="font-medium mb-1">Sin caballo asignado</p>
                    <p className="text-sm text-muted-foreground">
                      Se le asigna un caballo de la escuela en cada clase
                    </p>
                  </div>
                </div>
              ) : loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : alumno.caballoPropio &&
                typeof alumno.caballoPropio === "object" ? (
                <div className="space-y-4">
                  <div className="pt-2">
                    <InfoField label="Tipo de pensión">
                      <span>
                        {alumno.tipoPension === "RESERVA_ESCUELA" &&
                          "Reserva de escuela"}
                        {alumno.tipoPension === "CABALLO_PROPIO" &&
                          "Caballo propio"}
                      </span>
                    </InfoField>
                    {alumno.cuotaPension && (
                      <InfoField label="Cuota">
                        <StatusBadge status="info">
                          {alumno.cuotaPension.charAt(0) +
                            alumno.cuotaPension.slice(1).toLowerCase()}
                        </StatusBadge>
                      </InfoField>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Nombre del Caballo
                    </p>
                    <p className="font-medium text-lg">
                      {alumno.caballoPropio.nombre || "No asignado"}
                    </p>
                  </div>
                  <div className="pt-4 border-t grid grid-cols-2 gap-4">
                    <div>
                      <InfoField label="Tipo">
                        <StatusBadge status="success">
                          {alumno.tipoPension === "CABALLO_PROPIO"
                            ? "Privado"
                            : "Escuela"}
                        </StatusBadge>
                      </InfoField>
                    </div>
                    <div>
                      <InfoField label="Disponibilidad">
                        <StatusBadge
                          status={
                            alumno.caballoPropio.disponible
                              ? "success"
                              : "error"
                          }
                        >
                          {alumno.caballoPropio.disponible
                            ? "Disponible"
                            : "No Disponible"}
                        </StatusBadge>
                      </InfoField>
                    </div>
                  </div>

                  <div className="p-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        if (
                          alumno.caballoPropio &&
                          typeof alumno.caballoPropio === "object" &&
                          "id" in alumno.caballoPropio
                        ) {
                          navigate(`/caballos/${alumno.caballoPropio.id}`);
                        }
                      }}
                    >
                      {/* Se agrega un icono visible al botón */}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChessKnight className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {alumno.tipoPension === "RESERVA_ESCUELA"
                      ? "No hay caballo de escuela asignado aún"
                      : "No hay caballo privado asignado aún"}
                  </p>
                </div>
              )}
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
                  Resumen del desempeño del alumno
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
                  {estadisticas.aca + estadisticas.asa} ausencias
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
              Todas las clases registradas para este alumno
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : clasesAlumno.length > 0 ? (
              <DataTable
                columns={columnasClases}
                data={clasesAlumno}
                isLoading={false}
              />
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg font-medium mb-1">
                  No hay clases registradas
                </p>
                <p className="text-sm text-muted-foreground">
                  Este alumno aún no tiene clases programadas o completadas
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog para Editar Alumno */}
        <Dialog open={isEditOpen} onOpenChange={(open) => !open && closeEdit()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Editar Alumno</DialogTitle>
              <DialogDescription>
                Modifica los datos del alumno
              </DialogDescription>
            </DialogHeader>

            <AlumnoForm
              alumno={alumno}
              caballos={caballos}
              onSubmit={(data) => updateMutation.mutate({ id: alumnoId, data })}
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
        <Dialog open={!!alumnoToDelete} onOpenChange={closeDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar alumno</DialogTitle>
              <DialogDescription>
                ¿Seguro que deseas eliminar a {alumno.nombre} {alumno.apellido}?
                Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={closeDelete}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(alumno.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
