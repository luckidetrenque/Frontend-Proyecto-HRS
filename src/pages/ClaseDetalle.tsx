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
import { Switch } from "@/components/ui/switch";
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
      dia: new Date(formData.get("dia") as string).toISOString().split("T")[0],
      hora: parsearHoraParaApi(formData.get("hora") as string),
      estado: formData.get("estado") as Clase["estado"],
      observaciones: formData.get("observaciones") as string,
      alumnoId: Number(formData.get("alumnoId")),
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
                        Esta es una clase de prueba para un alumno nuevo.
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
          {/* Card del Alumno */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Alumno</CardTitle>
                    <CardDescription>Participante</CardDescription>
                  </div>
                </div>
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
              {alumno ? (
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
                <InfoField label="Nombre">{caballo.nombre}</InfoField>
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
                Modifica los datos de la clase
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                  <Label htmlFor="hora">Hora</Label>
                  <Input
                    id="hora"
                    name="hora"
                    type="time"
                    defaultValue={obtenerHoraArgentina(clase?.diaHoraCompleto)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alumnoId">Alumno</Label>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caballoId">Caballo</Label>
                  <Select
                    name="caballoId"
                    defaultValue={String(clase?.caballoId || "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar caballo" />
                    </SelectTrigger>
                    <SelectContent>
                      {caballos.map((caballo: Caballo) => (
                        <SelectItem key={caballo.id} value={String(caballo.id)}>
                          {caballo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                      <SelectItem value="EQUITACION">EQUITACION</SelectItem>
                      <SelectItem value="ADIESTRAMIENTO">
                        ADIESTRAMIENTO
                      </SelectItem>
                      <SelectItem value="EQUINOTERAPIA">
                        EQUINOTERAPIA
                      </SelectItem>
                      <SelectItem value="MONTA">MONTA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    name="estado"
                    defaultValue={clase?.estado || "PROGRAMADA"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROGRAMADA">Programada</SelectItem>
                      <SelectItem value="INICIADA">Iniciada</SelectItem>
                      <SelectItem value="COMPLETADA">Completada</SelectItem>
                      <SelectItem value="CANCELADA">Cancelada</SelectItem>
                      <SelectItem value="ACA">ACA</SelectItem>
                      <SelectItem value="ASA">ASA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
