// src/pages/ClaseDetalle.tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Accessibility,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  GraduationCap,
  Info,
  User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  ESPECIALIDADES,
  ESTADO_COLORS,
  ESTADO_LABELS,
  ESTADOS,
  formatearConZona,
  obtenerHoraArgentina,
  parsearHoraParaApi,
} from "@/components/calendar/clases.constants";
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
import { InfoField } from "@/components/ui/InfoField";
import { Input } from "@/components/ui/input";
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

export default function ClaseDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const claseId = parseInt(id || "0");

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Queries adicionales para los selectores
  const { data: alumnos = [] } = useQuery({
    queryKey: ["alumnos"],
    queryFn: alumnosApi.listar,
    enabled: isDialogOpen,
  });

  const { data: instructores = [] } = useQuery({
    queryKey: ["instructores"],
    queryFn: instructoresApi.listar,
    enabled: isDialogOpen,
  });

  const { data: caballos = [] } = useQuery({
    queryKey: ["caballos"],
    queryFn: caballosApi.listar,
    enabled: isDialogOpen,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Clase> }) =>
      clasesApi.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clase", claseId] });
      queryClient.invalidateQueries({ queryKey: ["clases"] });
      queryClient.invalidateQueries({ queryKey: ["clases-page"] });
      setIsDialogOpen(false);
      toast.success("Clase actualizada correctamente");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al actualizar la clase"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      especialidad: formData.get("especialidad") as Clase["especialidad"],
      dia: formData.get("dia") as string,
      hora: parsearHoraParaApi(formData.get("hora") as string),
      duracion: Number(formData.get("duracion")) || 60,
      estado: formData.get("estado") as Clase["estado"],
      observaciones: formData.get("observaciones") as string,
      // Si es clase de prueba con persona nueva, no enviar alumnoId
      ...(clase?.esPrueba && !clase?.alumnoId
        ? { personaPruebaId: clase.personaPruebaId }
        : { alumnoId: Number(formData.get("alumnoId")) }),
      instructorId: Number(formData.get("instructorId")),
      caballoId: Number(formData.get("caballoId")),
    };

    updateMutation.mutate({ id: claseId, data });
  };

  const [nuevoEstado, setNuevoEstado] = useState<Clase["estado"] | null>(null);

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
    mutationFn: (estado: Clase["estado"]) =>
      clasesApi.actualizar(claseId, { estado }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clase", claseId] });
      queryClient.invalidateQueries({ queryKey: ["clases-page"] });
      toast.success("Estado de la clase actualizado correctamente");
      setNuevoEstado(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al cambiar el estado");
    },
  });

  const handleCambiarEstado = () => {
    if (nuevoEstado) {
      cambiarEstadoMutation.mutate(nuevoEstado);
    }
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => setIsDialogOpen(false);

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
            <Button onClick={() => setIsDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
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
                    {new Date(clase.dia).toLocaleDateString("es-AR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
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
                    <Accessibility className="h-5 w-5 text-success" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="font-display">Editar Clase</DialogTitle>
              <DialogDescription>
                Editando clase de {getAlumnoNombreCompleto(clase.alumnoId)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {clase?.esPrueba && (
                <div className="flex items-center gap-2 ml-4">
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-orange-300 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-800">
                    <Info className="h-3 w-3 text-orange-600" />
                    Clase de Prueba
                  </span>
                </div>
              )}
              {/* FILA 1: Día + Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dia">Día</Label>
                  <Input
                    id="dia"
                    name="dia"
                    type="date"
                    defaultValue={clase?.dia}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora">Hora de Inicio</Label>
                  <Input
                    id="hora"
                    name="hora"
                    type="time"
                    defaultValue={obtenerHoraArgentina(clase?.diaHoraCompleto)}
                    required
                  />
                </div>
              </div>

              {/* FILA 2: Alumno + Caballo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {/* TODO: label dinámico "Alumno" vs "Persona de Prueba" según
                  corresponda, y mostrar campos de nombre/apellido en caso de
                  ser clase de prueba sin alumno asignado */}
                  <Label htmlFor="alumnoId">
                    Alumno
                    {clase?.esPrueba && !clase?.alumnoId && (
                      <span className="ml-2 text-xs text-orange-600">
                        (Clase de prueba)
                      </span>
                    )}
                  </Label>
                  {clase?.esPrueba && !clase?.alumnoId ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={clase.personaPruebaNombre ?? ""}
                        // disabled
                        // className="bg-muted text-muted-foreground"
                        placeholder="Nombre"
                      />
                      <Input
                        value={clase.personaPruebaApellido ?? ""}
                        // disabled
                        // className="bg-muted text-muted-foreground"
                        placeholder="Apellido"
                      />
                    </div>
                  ) : (
                    <Select
                      name="alumnoId"
                      defaultValue={String(clase?.alumnoId || "")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar alumno" />
                      </SelectTrigger>
                      <SelectContent>
                        {alumnos.map((alumno: Alumno) => (
                          <SelectItem key={alumno.id} value={String(alumno.id)}>
                            {alumno.nombre} {alumno.apellido}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caballoId">
                    Caballo
                    {(() => {
                      // Usar el alumno cargado de la clase actual
                      if (alumno?.caballoPropio) {
                        const caballoPredeterminado = caballos.find(
                          (c: Caballo) =>
                            c.id ===
                            (typeof alumno.caballoPropio === "number"
                              ? alumno.caballoPropio
                              : alumno.caballoPropio.id),
                        );
                        return caballoPredeterminado ? (
                          <span className="ml-2 text-xs font-medium text-success">
                            ✓ Predeterminado: {caballoPredeterminado.nombre}
                          </span>
                        ) : null;
                      }
                      return null;
                    })()}
                  </Label>
                  <Select
                    name="caballoId"
                    defaultValue={String(clase?.caballoId || "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar caballo" />
                    </SelectTrigger>
                    <SelectContent>
                      {caballos
                        .filter((c: Caballo) => c.disponible)
                        .map((caballo: Caballo) => (
                          <SelectItem
                            key={caballo.id}
                            value={String(caballo.id)}
                          >
                            {caballo.nombre} (
                            {caballo.tipo === "ESCUELA" ? "Escuela" : "Privado"}
                            )
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* FILA 3: Instructor + Especialidad */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instructorId">Instructor</Label>
                  <Select
                    name="instructorId"
                    defaultValue={String(clase?.instructorId || "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructores.map((instructor: Instructor) => (
                        <SelectItem
                          key={instructor.id}
                          value={String(instructor.id)}
                        >
                          {instructor.nombre} {instructor.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="especialidad">Especialidad</Label>
                  <Select
                    name="especialidad"
                    defaultValue={clase?.especialidad || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESPECIALIDADES.map((esp) => (
                        <SelectItem key={esp} value={esp}>
                          {esp.charAt(0).toUpperCase() +
                            esp.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* FILA 4: Estado + Observaciones (siempre edición) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    name="estado"
                    required
                    defaultValue={clase?.estado || "PROGRAMADA"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado.charAt(0).toUpperCase() +
                            estado.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* FILA 6: Observaciones (span completo) */}
                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Input
                    id="observaciones"
                    name="observaciones"
                    defaultValue={clase?.observaciones || ""}
                    placeholder="Ej. Lluvia, Feriado, etc"
                  />
                </div>
              </div>

              {/* FILA 5: Duración + Fin estimado */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duracion">Duración</Label>
                  <Select
                    name="duracion"
                    required
                    defaultValue={String(clase?.duracion || 60)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar duración" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Fin estimado
                  </Label>
                  <p className="flex h-10 items-center text-sm text-muted-foreground">
                    {clase?.diaHoraCompleto
                      ? (() => {
                          const horaInicio = obtenerHoraArgentina(
                            clase.diaHoraCompleto,
                          );
                          const [h, m] = horaInicio.split(":").map(Number);
                          const durMin = clase.duracion || 60;
                          const totalMin = h * 60 + m + durMin;
                          return `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
                        })()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
