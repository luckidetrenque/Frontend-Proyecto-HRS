import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Accessibility,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Mail,
  MessageCircle,
  Phone,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate,useParams } from "react-router-dom";
import { toast } from "sonner";

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
} from "@/lib/api";

export default function AlumnoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const alumnoId = parseInt(id || "0");

  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Agregar mutation para actualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Alumno> }) =>
      alumnosApi.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumno", alumnoId] });
      queryClient.invalidateQueries({ queryKey: ["alumnos"] });
      setIsEditOpen(false);
      toast.success("Alumno actualizado correctamente");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al actualizar el alumno"),
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
      fechaInscripcion: new Date(formData.get("fechaInscripcion") as string)
        .toISOString()
        .split("T")[0],
      cantidadClases: Number(formData.get("cantidadClases")),
      propietario: formData.get("propietario") === "on",
      activo: formData.get("activo") === "on",
    };

    updateMutation.mutate({ id: alumnoId, data });
  };

  // Query para obtener el alumno
  const { data: alumno, isLoading: loadingAlumno } = useQuery({
    queryKey: ["alumno", alumnoId],
    queryFn: () => alumnosApi.obtener(alumnoId),
    enabled: !!alumnoId,
  });

  // Query para obtener las clases del alumno
  const { data: clasesAlumnoData = [], isLoading: loadingClases } = useQuery({
    queryKey: ["clases-alumno", alumnoId],
    queryFn: () => clasesApi.obtenerPorAlumnoConDetalles(alumnoId),
    enabled: !!alumnoId,
  });

  const clasesAlumno = Array.isArray(clasesAlumnoData) ? clasesAlumnoData : [];

  // Query para obtener todos los caballos (solo si es propietario)
  const { data: todosCaballos = [], isLoading: loadingCaballo } = useQuery({
    queryKey: ["caballos"],
    queryFn: caballosApi.listar,
    enabled: !!alumno?.propietario,
  });

  // Filtrar el caballo privado de este alumno
  const caballoPrivado = todosCaballos.find(
    (c) => c.tipo === "PRIVADO" && c.alumnoId === alumnoId,
  );

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
              <Button onClick={() => setIsEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Nombre Completo
                  </p>
                  <p className="font-medium">
                    {alumno.nombre} {alumno.apellido}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">DNI</p>
                  <p className="font-medium">{alumno.dni}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Fecha de Nacimiento
                  </p>
                  <p className="font-medium">
                    {new Date(alumno.fechaNacimiento).toLocaleDateString(
                      "es-AR",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Edad</p>
                  <p className="font-medium">
                    {new Date().getFullYear() -
                      new Date(alumno.fechaNacimiento).getFullYear()}{" "}
                    años
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                </div>
                <p className="font-medium">{alumno.telefono}</p>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Email</p>
                </div>
                <p className="font-medium">
                  {alumno.email || "No especificado"}
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Fecha de Inscripción
                  </p>
                </div>
                <p className="font-medium">
                  {new Date(alumno.fechaInscripcion).toLocaleDateString(
                    "es-AR",
                  )}
                </p>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Clases por Mes
                  </p>
                  <p className="font-medium text-lg">{alumno.cantidadClases}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estado</p>
                  <StatusBadge status={alumno.activo ? "success" : "default"}>
                    {alumno.activo ? "Activo" : "Inactivo"}
                  </StatusBadge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Caballo Privado */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Accessibility className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">Caballo</CardTitle>
                  <CardDescription>
                    {alumno.propietario
                      ? "Información del caballo privado"
                      : "Utiliza caballos de la escuela"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {alumno.propietario ? (
                loadingCaballo ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : caballoPrivado ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Nombre del Caballo
                      </p>
                      <p className="font-medium text-lg">
                        {caballoPrivado.nombre}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tipo</p>
                      <StatusBadge status="success">Privado</StatusBadge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Disponibilidad
                      </p>
                      <StatusBadge
                        status={caballoPrivado.disponible ? "success" : "error"}
                      >
                        {caballoPrivado.disponible
                          ? "Disponible"
                          : "No Disponible"}
                      </StatusBadge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Accessibility className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No se encontró caballo privado registrado
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <div className="rounded-lg bg-muted/50 p-6">
                    <Accessibility className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium mb-1">No tiene caballo propio</p>
                    <p className="text-sm text-muted-foreground">
                      Este alumno utiliza los caballos de la escuela para sus
                      clases
                    </p>
                  </div>
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
            {loadingClases ? (
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
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="font-display">
                  Editar Alumno
                </DialogTitle>
                <DialogDescription>
                  Modifica los datos del alumno
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre/s</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      type="text"
                      defaultValue={alumno?.nombre}
                      placeholder="Nombre/s del alumno"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido/s</Label>
                    <Input
                      id="apellido"
                      name="apellido"
                      type="text"
                      defaultValue={alumno?.apellido}
                      placeholder="Apellido/s del alumno"
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
                      defaultValue={alumno?.dni}
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
                      defaultValue={alumno?.fechaNacimiento}
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
                      defaultValue={alumno?.telefono}
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
                      defaultValue={alumno?.email}
                      placeholder="alumno@correo.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaInscripcion">
                      Fecha de Inscripción
                    </Label>
                    <Input
                      id="fechaInscripcion"
                      name="fechaInscripcion"
                      type="date"
                      defaultValue={alumno?.fechaInscripcion}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cantidadClases">Clases por Mes</Label>
                    <Select
                      name="cantidadClases"
                      defaultValue={String(alumno?.cantidadClases || 4)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 clases</SelectItem>
                        <SelectItem value="8">8 clases</SelectItem>
                        <SelectItem value="12">12 clases</SelectItem>
                        <SelectItem value="16">16 clases</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Switch
                      id="propietario"
                      name="propietario"
                      defaultChecked={alumno?.propietario}
                    />
                    <Label htmlFor="propietario">Tiene caballo propio</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="activo"
                      name="activo"
                      defaultChecked={alumno?.activo}
                    />
                    <Label htmlFor="activo">Está activo</Label>
                  </div>
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
      </div>
    </Layout>
  );
}
