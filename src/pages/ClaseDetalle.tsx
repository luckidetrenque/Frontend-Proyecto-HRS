import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChessKnight,
  Clock,
  Edit,
  GraduationCap,
  Info,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  ESTADO_COLORS,
  ESTADO_LABELS,
  formatearConZona,
  MOTIVOS_CANCELACION,
} from "@/components/calendar/clases.constants";
import { ClaseForm } from "@/components/forms/ClaseForm";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { useEntityActions } from "@/hooks/useEntityActions";
import {
  Alumno,
  alumnosApi,
  caballosApi,
  Clase,
  clasesApi,
  instructoresApi,
  personasPruebaApi,
} from "@/lib/api";

export default function ClaseDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const claseId = parseInt(id || "0");

  const {
    entityToDelete: claseToDelete,
    isDialogOpen: isEditOpen,
    openEdit,
    closeEdit,
    openDelete,
    closeDelete,
  } = useEntityActions<Clase>();

  // Queries adicionales para los selectores
  const { data: alumnos = [] } = useQuery({
    queryKey: ["alumnos"],
    queryFn: alumnosApi.listar,
  });

  // Filtrar solo objetos válidos de Alumno
  const alumnosValidos = useMemo(() => {
    return alumnos.filter((alumno: unknown): alumno is Alumno => {
      return (
        typeof alumno === "object" &&
        alumno !== null &&
        "id" in alumno &&
        "nombre" in alumno
      );
    });
  }, [alumnos]);

  const { data: instructores = [] } = useQuery({
    queryKey: ["instructores"],
    queryFn: instructoresApi.listar,
  });

  const { data: caballos = [] } = useQuery({
    queryKey: ["caballos"],
    queryFn: caballosApi.listar,
  });

  const { data: clases = [] } = useQuery({
    queryKey: ["clases-page"],
    queryFn: clasesApi.listarDetalladas,
  });

  const { data: personasPrueba = [] } = useQuery({
    queryKey: ["personas-prueba"],
    queryFn: personasPruebaApi.listar,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Clase> }) =>
      clasesApi.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clase", claseId] });
      queryClient.invalidateQueries({ queryKey: ["clases"] });
      queryClient.invalidateQueries({ queryKey: ["clases-page"] });
      closeEdit();
      toast.success("Clase actualizada correctamente");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al actualizar la clase"),
  });

  const deleteMutation = useMutation({
    mutationFn: clasesApi.eliminar,
    onSuccess: (data) => {
      const successMsg =
        data.__successMessage || "Clase eliminada correctamente";
      toast.success(successMsg);
      navigate("/clases");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al eliminar la clase"),
  });

  const [nuevoEstado, setNuevoEstado] = useState<Clase["estado"] | null>(null);
  // Estados para el formulario de cancelación
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<string>("");
  const [observacionesPersonalizadas, setObservacionesPersonalizadas] =
    useState<string>("");

  // Query para obtener la clase
  const { data: clase, isLoading: loadingClase } = useQuery({
    queryKey: ["clase", claseId],
    queryFn: () => clasesApi.obtenerDetallada(claseId),
    enabled: !!claseId,
  });

  // Queries para obtener datos relacionados
  const { data: alumno } = useQuery({
    queryKey: ["alumno", clase?.alumnoId],
    queryFn: () => alumnosApi.obtener(clase!.alumnoId),
    enabled: !!clase?.alumnoId,
  });

  const { data: instructor } = useQuery({
    queryKey: ["instructor", clase?.instructorId],
    queryFn: () => instructoresApi.obtener(clase!.instructorId),
    enabled: !!clase?.instructorId,
  });

  const { data: caballo } = useQuery({
    queryKey: ["caballo", clase?.caballoId],
    queryFn: () => caballosApi.obtener(clase!.caballoId),
    enabled: !!clase?.caballoId,
  });

  // Mutation para cambiar el estado
  const cambiarEstadoMutation = useMutation({
    mutationFn: ({
      estado,
      observaciones,
    }: {
      estado: Clase["estado"];
      observaciones?: string;
    }) => clasesApi.actualizar(claseId, { estado, observaciones }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clase", claseId] });
      queryClient.invalidateQueries({ queryKey: ["clases-page"] });
      toast.success("Estado de la clase actualizado correctamente");
      setNuevoEstado(null);
      setShowCancelDialog(false);
      setMotivoSeleccionado("");
      setObservacionesPersonalizadas("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al cambiar el estado");
    },
  });

  const handleCambiarEstado = () => {
    if (!nuevoEstado) return;

    // Si el estado es CANCELADA, mostrar el diálogo
    if (nuevoEstado === "CANCELADA") {
      setShowCancelDialog(true);
      return;
    }

    // Para otros estados, cambiar directamente
    cambiarEstadoMutation.mutate({ estado: nuevoEstado });
  };

  const handleConfirmCancel = () => {
    const observacionFinal =
      motivoSeleccionado === "Otro"
        ? observacionesPersonalizadas
        : motivoSeleccionado;

    cambiarEstadoMutation.mutate({
      estado: "CANCELADA",
      observaciones: observacionFinal,
    });
  };

  const handleCancelDialog = () => {
    setShowCancelDialog(false);
    setMotivoSeleccionado("");
    setObservacionesPersonalizadas("");
    setNuevoEstado(null);
  };

  if (loadingClase) {
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

  if (!clase) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Clase no encontrada</p>
            <Button onClick={() => navigate("/clases")}>Volver a Clases</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const getAlumnoNombreCompleto = (id: number) => {
    const alumno = alumnos.find((a: Alumno) => a.id === id);
    return alumno ? `${alumno.nombre} ${alumno.apellido}` : "-";
  };

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/clases")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title="Detalle de Clase"
          description={`Información completa de la clase de ${clase.especialidad}`}
          action={
            <EntityDetailActions
              onEdit={() => openEdit(clase)}
              onDelete={() => openDelete(clase)}
              entityName="clase"
            />
          }
        />
      </div>

      <div className="space-y-6">
        {/* Información General de la Clase */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Información de la Clase
                  </CardTitle>
                  <CardDescription>Detalles generales</CardDescription>
                </div>
              </div>
              <StatusBadge status={ESTADO_COLORS[clase.estado] || "default"}>
                {ESTADO_LABELS[clase.estado] || clase.estado}
              </StatusBadge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3 text-center">
              <InfoField label="Fecha">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(parseISO(clase.dia), "EEEE, d 'de' MMMM", {
                      locale: es,
                    })}
                  </span>
                </div>
              </InfoField>

              <InfoField label="Hora">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatearConZona(clase.diaHoraCompleto)}</span>
                </div>
              </InfoField>

              <InfoField label="Especialidad">
                <span className="text-lg">{clase.especialidad}</span>
              </InfoField>
            </div>

            {clase.observaciones && (
              <div className="mt-6 pt-6 border-t">
                <InfoField label="Observaciones">
                  <div className="rounded-lg bg-muted/50 p-4 text-left font-normal mt-2">
                    <p className="text-sm">{clase.observaciones}</p>
                  </div>
                </InfoField>
              </div>
            )}

            {clase.esPrueba && (
              <div className="mt-6 pt-6 border-t">
                <div className="rounded-lg border border-orange-300 bg-orange-50 p-4 text-left">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-900 mb-1">
                        Clase de Prueba
                      </p>
                      <p className="text-sm text-orange-700">
                        {clase.alumnoId
                          ? "Esta es una clase de prueba de un alumno existente en otra especialidad."
                          : "Esta es una clase de prueba para una persona sin cuenta de alumno."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Participantes */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card del Alumno / Persona de Prueba */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {clase.esPrueba && !clase.alumnoId
                        ? "Persona de Prueba"
                        : "Alumno"}
                    </CardTitle>
                    <CardDescription>Participante</CardDescription>
                  </div>
                </div>
                {/* Botón Ver Perfil solo para alumnos registrados */}
                {alumno && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/alumnos/${alumno.id}`)}
                    className="h-8 px-2 text-xs"
                  >
                    Ver Perfil
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {clase.esPrueba && !clase.alumnoId ? (
                // Clase de prueba con persona nueva — datos vienen directo en clase
                <InfoField label="Nombre">
                  {clase.personaPruebaNombreCompleto ?? "-"}
                </InfoField>
              ) : alumno ? (
                // Alumno registrado
                <InfoField label="Nombre">
                  {alumno.nombre} {alumno.apellido}
                </InfoField>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Cargando...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card del Instructor */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <GraduationCap className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Instructor</CardTitle>
                    <CardDescription>A cargo</CardDescription>
                  </div>
                </div>
                {instructor && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/instructores/${instructor.id}`)}
                    className="h-8 px-2 text-xs"
                  >
                    Ver Perfil
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {instructor ? (
                <InfoField label="Nombre">
                  {instructor.nombre} {instructor.apellido}
                </InfoField>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Cargando...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card del Caballo */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <ChessKnight className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Caballo</CardTitle>
                    <CardDescription>Asignado</CardDescription>
                  </div>
                </div>
                {caballo && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/caballos/${caballo.id}`)}
                    className="h-8 px-2 text-xs"
                  >
                    Ver Perfil
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {caballo ? (
                <>
                  <InfoField label="Nombre">{caballo.nombre}</InfoField>
                  {alumno?.caballoPropio &&
                    (typeof alumno.caballoPropio === "number"
                      ? alumno.caballoPropio === caballo.id
                      : alumno.caballoPropio.id === caballo.id) && (
                      <div className="mt-2 text-xs font-medium text-success">
                        ✓ Predeterminado
                      </div>
                    )}
                </>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Cargando...
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cambio de Estado */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <CheckCircle2 className="h-5 w-5 text-warning" />
              </div>
              <div>
                <CardTitle className="text-lg">Cambiar Estado</CardTitle>
                <CardDescription>
                  Actualiza el estado de la clase según su progreso
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 w-full space-y-2">
                <label className="text-sm font-medium">Nuevo Estado</label>
                <Select
                  value={nuevoEstado || clase.estado}
                  onValueChange={(value) =>
                    setNuevoEstado(value as Clase["estado"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROGRAMADA">Programada</SelectItem>
                    <SelectItem value="INICIADA">Iniciada</SelectItem>
                    <SelectItem value="COMPLETADA">Completada</SelectItem>
                    <SelectItem value="CANCELADA">Cancelada</SelectItem>
                    <SelectItem value="ACA">ACA (Ausente con Aviso)</SelectItem>
                    <SelectItem value="ASA">ASA (Ausente sin Aviso)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCambiarEstado}
                disabled={
                  !nuevoEstado ||
                  nuevoEstado === clase.estado ||
                  cambiarEstadoMutation.isPending
                }
                className="w-full sm:w-auto"
              >
                {cambiarEstadoMutation.isPending
                  ? "Actualizando..."
                  : "Actualizar Estado"}
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-xs text-yellow-700 mb-1">PROGRAMADA</p>
                <p className="text-xs text-yellow-600">Clase agendada</p>
              </div>
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <p className="text-xs text-blue-700 mb-1">INICIADA</p>
                <p className="text-xs text-blue-600">En progreso</p>
              </div>
              <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                <p className="text-xs text-green-700 mb-1">COMPLETADA</p>
                <p className="text-xs text-green-600">
                  Finalizada exitosamente
                </p>
              </div>
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-xs text-red-700 mb-1">CANCELADA</p>
                <p className="text-xs text-red-600">Clase cancelada</p>
              </div>
              <div className="rounded-lg bg-purple-50 border border-purple-200 p-3">
                <p className="text-xs text-purple-700 mb-1">ACA</p>
                <p className="text-xs text-purple-600">Ausente con aviso</p>
              </div>
              <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
                <p className="text-xs text-orange-700 mb-1">ASA</p>
                <p className="text-xs text-orange-600">Ausente sin aviso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditOpen} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Editar Clase</DialogTitle>
            <DialogDescription>
              Modifica los datos de la clase
            </DialogDescription>
          </DialogHeader>

          <ClaseForm
            clase={clase}
            alumnos={alumnos}
            instructores={instructores}
            caballos={caballos}
            clases={clases}
            personasPrueba={personasPrueba}
            onSubmit={(data) => updateMutation.mutate({ id: claseId, data })}
            isPending={updateMutation.isPending}
            onCancel={closeEdit}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={!!claseToDelete} onOpenChange={closeDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar clase</DialogTitle>
            <DialogDescription>
              ¿Seguro que deseas eliminar la clase de{" "}
              {alumno ? `${alumno.nombre} ${alumno.apellido}` : "cargando..."}{" "}
              del día {clase.dia.split("-")[2]}/{clase.dia.split("-")[1]}/
              {clase.dia.split("-")[0]} a las{" "}
              {formatearConZona(clase.diaHoraCompleto)} horas? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDelete}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(clase.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Diálogo de Cancelación con Motivo */}
      <Dialog open={showCancelDialog} onOpenChange={handleCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Cancelar Clase
            </DialogTitle>
            <DialogDescription>
              Selecciona el motivo de la cancelación de esta clase.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="motivo-cancelacion">Motivo de cancelación</Label>
              <Select
                value={motivoSeleccionado}
                onValueChange={setMotivoSeleccionado}
              >
                <SelectTrigger id="motivo-cancelacion">
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  {MOTIVOS_CANCELACION.map((motivo) => (
                    <SelectItem key={motivo} value={motivo}>
                      {motivo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {motivoSeleccionado === "Otro" && (
              <div className="space-y-2">
                <Label htmlFor="observaciones-personalizadas">
                  Observaciones personalizadas
                </Label>
                <Textarea
                  id="observaciones-personalizadas"
                  placeholder="Ingrese el motivo de cancelación..."
                  value={observacionesPersonalizadas}
                  onChange={(e) =>
                    setObservacionesPersonalizadas(e.target.value)
                  }
                  rows={3}
                />
              </div>
            )}

            {motivoSeleccionado && motivoSeleccionado !== "Otro" && (
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                <strong>Observaciones:</strong> {motivoSeleccionado}
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelDialog}
            >
              Volver
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={
                !motivoSeleccionado ||
                (motivoSeleccionado === "Otro" &&
                  !observacionesPersonalizadas.trim()) ||
                cambiarEstadoMutation.isPending
              }
            >
              {cambiarEstadoMutation.isPending
                ? "Cancelando..."
                : "Confirmar Cancelación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
