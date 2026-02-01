// src/pages/InstructorDetalle.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Mail,
  Phone,
  User,
  XCircle,
  TrendingUp,
  AlertCircle,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import { instructoresApi, clasesApi, Clase, Instructor } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

const PRESET_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
  "#84CC16",
];

export default function InstructorDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const instructorId = parseInt(id || "0");

  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Query para obtener el instructor
  const { data: instructor, isLoading: loadingInstructor } = useQuery({
    queryKey: ["instructor", instructorId],
    queryFn: () => instructoresApi.obtener(instructorId),
    enabled: !!instructorId,
  });

  const [instructorColor, setInstructorColor] = useState<string>(
    instructor?.color || PRESET_COLORS[0],
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Instructor> }) =>
      instructoresApi.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", instructorId] });
      queryClient.invalidateQueries({ queryKey: ["instructores"] });
      setIsEditOpen(false);
      toast.success("Instructor actualizado correctamente");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al actualizar el instructor"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      dni: formData.get("dni") as string,
      nombre: formData.get("nombre") as string,
      apellido: formData.get("apellido") as string,
      fechaNacimiento: new Date(formData.get("fechaNacimiento") as string)
        .toISOString()
        .split("T")[0],
      telefono: formData.get("telefono") as string,
      email: formData.get("email") as string,
      activo: formData.get("activo") === "on",
      color: instructorColor,
    };

    updateMutation.mutate({ id: instructorId, data });
  };

  useEffect(() => {
    if (isEditOpen && instructor) {
      setInstructorColor(instructor.color || PRESET_COLORS[0]);
    }
  }, [isEditOpen, instructor]);

  // Query para obtener las clases del instructor
  const { data: clasesInstructor = [], isLoading: loadingClases } = useQuery({
    queryKey: ["clases-instructor", instructorId],
    queryFn: () => clasesApi.buscar({ instructorId }),
    enabled: !!instructorId,
  });

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
                <Button onClick={() => setIsEditOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
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
                    <User className="h-5 w-5 text-primary" />
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Nombre Completo
                    </p>
                    <p className="font-medium">
                      {instructor.nombre} {instructor.apellido}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">DNI</p>
                    <p className="font-medium">{instructor.dni}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Fecha de Nacimiento
                    </p>
                    <p className="font-medium">
                      {new Date(instructor.fechaNacimiento).toLocaleDateString(
                        "es-AR",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Edad</p>
                    <p className="font-medium">
                      {new Date().getFullYear() -
                        new Date(instructor.fechaNacimiento).getFullYear()}{" "}
                      años
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                  </div>
                  <p className="font-medium">{instructor.telefono}</p>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Email</p>
                  </div>
                  <p className="font-medium">
                    {instructor.email || "No especificado"}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Estado</p>
                  <StatusBadge
                    status={instructor.activo ? "success" : "default"}
                  >
                    {instructor.activo ? "Activo" : "Inactivo"}
                  </StatusBadge>
                </div>

                {instructor.color && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Color Asignado
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg border-2 border-gray-300"
                        style={{ backgroundColor: instructor.color }}
                      />
                      <span className="font-mono text-sm text-muted-foreground">
                        {instructor.color}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card de Especialidades */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <GraduationCap className="h-5 w-5 text-accent" />
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

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="font-display">
                  Editar Instructor
                </DialogTitle>
                <DialogDescription>
                  Modifica los datos del instructor
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre/s</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      defaultValue={instructor?.nombre}
                      placeholder="Nombre/s del instructor"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido/s</Label>
                    <Input
                      id="apellido"
                      name="apellido"
                      defaultValue={instructor?.apellido}
                      placeholder="Apellido/s del instructor"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dni">DNI</Label>
                    <Input
                      id="dni"
                      name="dni"
                      type="string"
                      defaultValue={instructor?.dni}
                      placeholder="Solo números sin puntos"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                    <Input
                      id="fechaNacimiento"
                      name="fechaNacimiento"
                      type="date"
                      defaultValue={instructor?.fechaNacimiento}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      defaultValue={instructor?.telefono}
                      placeholder="Sin el 0 ni el 15"
                      pattern="\+?[0-9]*"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={instructor?.email}
                      placeholder="instructor@correo.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color del Instructor</Label>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map((color) => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setInstructorColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          instructorColor === color
                            ? "border-primary ring-2 ring-primary/20 scale-110"
                            : "border-gray-300 hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2 p-2 border rounded-md bg-muted/30">
                    <div
                      className="w-6 h-6 rounded border-2 border-gray-300"
                      style={{ backgroundColor: instructorColor }}
                    />
                    <span className="text-sm font-mono text-muted-foreground">
                      {instructorColor}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="activo"
                    name="activo"
                    defaultChecked={instructor?.activo}
                  />
                  <Label htmlFor="activo">Instructor activo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending
                    ? "Guardando..."
                    : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Layout>
    </>
  );
}
