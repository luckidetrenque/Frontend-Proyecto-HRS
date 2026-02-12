// src/pages/CaballoDetalle.tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Accessibility,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit,
  Info,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
} from "@/lib/api";

export default function CaballoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const caballoId = parseInt(id || "0");

  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Caballo> }) =>
      caballosApi.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caballo", caballoId] });
      queryClient.invalidateQueries({ queryKey: ["caballos"] });
      setIsEditOpen(false);
      toast.success("Caballo actualizado correctamente");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al actualizar el caballo"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nombre: formData.get("nombre") as string,
      tipo: formData.get("tipo") as "ESCUELA" | "PRIVADO",
      disponible: formData.get("disponible") === "on",
    };

    updateMutation.mutate({ id: caballoId, data });
  };

  // Query para obtener el caballo
  const { data: caballo, isLoading: loadingCaballo } = useQuery({
    queryKey: ["caballo", caballoId],
    queryFn: () => caballosApi.obtener(caballoId),
    enabled: !!caballoId,
  });

  // TODO Query para obtener las clases del caballo (METODO BUSCAR EN CONTROLADOR DE CLASES)
  // const { data: clasesCaballo = [], isLoading: loadingClases } = useQuery({
  //   queryKey: ["clases-caballo", caballoId],
  //   queryFn: () => clasesApi.buscar({ caballoId }),
  //   enabled: !!caballoId,
  // });

  // Query para obtener las clases del caballo
  const { data: clasesCaballo = [], isLoading: loadingClases } = useQuery({
    queryKey: ["clases-caballo", caballoId],
    // Pasa el ID directamente, no como objeto
    queryFn: () => clasesApi.buscarPorCaballo(caballoId!),
    enabled: !!caballoId,
  });

  // Query para obtener el alumno propietario (si es privado)
  const { data: alumnoPropietario, isLoading: loadingAlumno } = useQuery({
    queryKey: ["alumno-propietario", caballo?.propietarios],
    queryFn: () => {
      const primerPropietario = caballo!.propietarios![0];
      const propietarioId =
        typeof primerPropietario === "number"
          ? primerPropietario
          : primerPropietario.id;
      return alumnosApi.obtener(propietarioId);
    },
    enabled: !!caballo?.propietarios && caballo.tipo === "PRIVADO",
  });

  // Calcular estadísticas
  const estadisticas = {
    total: clasesCaballo.length,
    completadas: clasesCaballo.filter((c) => c.estado === "COMPLETADA").length,
    programadas: clasesCaballo.filter((c) => c.estado === "PROGRAMADA").length,
    iniciada: clasesCaballo.filter((c) => c.estado === "INICIADA").length,
    canceladas: clasesCaballo.filter((c) => c.estado === "CANCELADA").length,
    aca: clasesCaballo.filter((c) => c.estado === "ACA").length,
    asa: clasesCaballo.filter((c) => c.estado === "ASA").length,
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

  if (loadingCaballo) {
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

  if (!caballo) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Caballo no encontrado</p>
            <Button onClick={() => navigate("/caballos")}>
              Volver a Caballos
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/caballos")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title="Perfil de Caballo"
          description={`Información detallada de ${caballo.nombre}`}
          action={
            <Button onClick={() => setIsEditOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          }
        />
      </div>

      <div className="space-y-6">
        {/* Información del Caballo + Propietario */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card de Información del Caballo */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Accessibility className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Información del Caballo
                  </CardTitle>
                  <CardDescription>Datos generales</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nombre</p>
                <p className="font-medium text-2xl">{caballo.nombre}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Tipo de Caballo">
                  <StatusBadge
                    status={caballo.tipo === "ESCUELA" ? "info" : "warning"}
                  >
                    {caballo.tipo === "ESCUELA"
                      ? "Caballo de la Escuela"
                      : "Caballo Privado"}
                  </StatusBadge>
                </InfoField>

                <InfoField label="Disponibilidad">
                  <StatusBadge
                    status={caballo.disponible ? "success" : "error"}
                  >
                    {caballo.disponible ? "Disponible" : "No disponible"}
                  </StatusBadge>
                </InfoField>
              </div>

              {caballo.tipo === "ESCUELA" && (
                <div className="pt-4 border-t">
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 text-sm mb-1">
                          Caballo de la Escuela
                        </p>
                        <p className="text-xs text-blue-700">
                          Este caballo está disponible para todas las clases y
                          puede ser asignado a cualquier alumno.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card del Propietario */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <User className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">Propietarios</CardTitle>
                  <CardDescription>
                    {caballo.tipo === "PRIVADO"
                      ? "Detalle de los dueños"
                      : "Caballo de la escuela"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {caballo.tipo === "PRIVADO" ? (
                loadingAlumno ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : caballo.propietarios && caballo.propietarios.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody className="divide-y">
                        {caballo.propietarios
                          .filter(
                            (p): p is Alumno =>
                              typeof p === "object" && p !== null,
                          )
                          .map((p) => (
                            <tr
                              key={p.id}
                              className="hover:bg-muted/30 transition-colors"
                            >
                              <td className="p-3">
                                <InfoField label="Nombre Completo">
                                  {p.nombre} {p.apellido}
                                </InfoField>
                              </td>
                              <td className="p-3">
                                <InfoField label="DNI">{p.dni}</InfoField>
                              </td>
                              <td className="p-3">
                                <InfoField label="Email">
                                  {p.email || "-"}
                                </InfoField>
                              </td>
                              <td className="p-3">
                                <InfoField label="Teléfono">
                                  {p.telefono}
                                </InfoField>
                              </td>
                              <td className="p-3 text-right align-bottom">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => navigate(`/alumnos/${p.id}`)}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No se encontró información
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <div className="rounded-lg bg-muted/50 p-6">
                    <Accessibility className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium mb-1">Caballo de la Escuela</p>
                    <p className="text-sm text-muted-foreground">Uso general</p>
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
                  Resumen de clases asignadas a este caballo
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
              Todas las clases asignadas a este caballo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingClases ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : clasesCaballo.length > 0 ? (
              <DataTable
                columns={columnasClases}
                data={clasesCaballo}
                isLoading={false}
              />
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg font-medium mb-1">
                  No hay clases registradas
                </p>
                <p className="text-sm text-muted-foreground">
                  Este caballo aún no tiene clases programadas o completadas
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
              <DialogTitle className="font-display">Editar Caballo</DialogTitle>
              <DialogDescription>
                Modifica los datos del caballo
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  defaultValue={caballo?.nombre}
                  placeholder="Nombre del caballo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select name="tipo" defaultValue={caballo?.tipo || "ESCUELA"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ESCUELA">Escuela</SelectItem>
                    <SelectItem value="PRIVADO">Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="disponible"
                  name="disponible"
                  defaultChecked={caballo?.disponible}
                />
                <Label htmlFor="disponible">Disponible</Label>
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
