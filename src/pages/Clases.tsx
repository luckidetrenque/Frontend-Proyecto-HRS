import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IdCard,
  MoreVertical,
  Pencil,
  Plus,
  Table,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  ESPECIALIDADES_OPTIONS,
  ESTADO_COLORS,
  ESTADO_LABELS,
  ESTADOS_OPTIONS,
  formatearConZona,
} from "@/components/calendar/clases.constants";
import { GenericCard } from "@/components/cards/GenericCard";
import { GenericCardSkeleton } from "@/components/cards/GenericCardSkeleton";
import { ClaseForm } from "@/components/forms/ClaseForm";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { StatusBadge } from "@/components/ui/status-badge";
import { useEntityActions } from "@/hooks/useEntityActions";
import {
  Alumno,
  alumnosApi,
  Caballo,
  caballosApi,
  Clase,
  clasesApi,
  Instructor,
  instructoresApi,
  personasPruebaApi,
} from "@/lib/api";
import { puedeEditarClase } from "@/utils/validacionesClases";

export default function ClasesPage() {
  const queryClient = useQueryClient();
  const {
    editingEntity: editingClase,
    entityToDelete: claseToDelete,
    isDialogOpen,
    openEdit,
    closeEdit,
    openDelete,
    closeDelete,
  } = useEntityActions<Clase>();

  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    nombreAlumno: "",
    apellidoAlumno: "",
    dia: "",
    hora: "",
    especialidad: "all",
    estado: "all",
  });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ["clases", page, pageSize, filters],
    queryFn: () =>
      clasesApi.listar({
        page,
        size: pageSize,
        sort: "dia,desc",
        nombreAlumno: filters.nombreAlumno || undefined,
        apellidoAlumno: filters.apellidoAlumno || undefined,
        estado:
          filters.estado !== "all"
            ? (filters.estado as Clase["estado"])
            : undefined,
        especialidad:
          filters.especialidad !== "all"
            ? (filters.especialidad as Clase["especialidad"])
            : undefined,
      }),
  });

  const clases = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalItems = data?.totalElements ?? 0;

  const { data: alumnosData } = useQuery({
    queryKey: ["alumnos-select"],
    queryFn: () =>
      alumnosApi.listar({ page: 0, size: 200, sort: "apellido,asc" }),
  });
  const alumnos = alumnosData?.content ?? [];

  const { data: instructoresData } = useQuery({
    queryKey: ["instructores-select"],
    queryFn: () =>
      instructoresApi.listar({ page: 0, size: 50, sort: "apellido,asc" }),
  });
  const instructores = instructoresData?.content ?? [];

  const { data: caballosData } = useQuery({
    queryKey: ["caballos-select"],
    queryFn: () =>
      caballosApi.listar({ page: 0, size: 100, sort: "nombre,asc" }),
  });
  const caballos = caballosData?.content ?? [];

  const { data: personasPrueba = [] } = useQuery({
    queryKey: ["personas_prueba"],
    queryFn: personasPruebaApi.listar,
  });

  const filterConfig = [
    {
      name: "nombreAlumno",
      label: "Nombre alumno",
      type: "text" as const,
      placeholder: "Buscar por nombre...",
    },
    {
      name: "apellidoAlumno",
      label: "Apellido alumno",
      type: "text" as const,
      placeholder: "Buscar por apellido...",
    },
    {
      name: "dia",
      label: "Día",
      type: "date" as const,
      placeholder: "Seleccionar día",
    },
    {
      name: "hora",
      label: "Hora",
      type: "time" as const,
      placeholder: "Seleccionar hora",
    },
    {
      name: "especialidad",
      label: "Especialidad",
      type: "select" as const,
      options: ESPECIALIDADES_OPTIONS,
    },
    {
      name: "estado",
      label: "Estado",
      type: "select" as const,
      options: ESTADOS_OPTIONS,
    },
  ];

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    if (name !== "nombreAlumno" && name !== "apellidoAlumno") {
      setPage(0);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      nombreAlumno: "",
      apellidoAlumno: "",
      dia: "",
      hora: "",
      especialidad: "all",
      estado: "all",
    });
    setPage(0);
  };

  const createMutation = useMutation({
    mutationFn: clasesApi.crear,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clases"] });
      closeEdit();
      const successMsg = data.__successMessage || "Clase creada correctamente";
      toast.success(successMsg);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al crear la clase"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Clase> }) =>
      clasesApi.actualizar(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clases"] });
      closeEdit();
      const successMsg =
        data.__successMessage || "Clase actualizada correctamente";
      toast.success(successMsg);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al actualizar la clase"),
  });

  const deleteMutation = useMutation({
    mutationFn: clasesApi.eliminar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clases"] });
      closeDelete();
      const successMsg =
        data.__successMessage || "Clase eliminada correctamente";
      toast.success(successMsg);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al eliminar la clase"),
  });

  const getNombreParaClase = (clase: Clase): string => {
    if (clase?.alumnoId != null) {
      const alumno = alumnos.find((a: Alumno) => a.id === clase.alumnoId);
      if (alumno) return `${alumno.nombre} ${alumno.apellido}`;
    }
    return clase?.personaPruebaNombreCompleto ?? "-";
  };

  const getInstructorNombre = (id: number) => {
    const instructor = instructores.find((i: Instructor) => i.id === id);
    return instructor ? `${instructor.nombre} ${instructor.apellido}` : "-";
  };

  const getCaballoNombre = (id: number) => {
    const caballo = caballos.find((c: Caballo) => c.id === id);
    return caballo?.nombre || "-";
  };

  const columns = [
    {
      header: "Dia",
      cell: (row: Clase) =>
        `${row.dia.split("-")[2]}/${row.dia.split("-")[1]}/${row.dia.split("-")[0]}`,
    },
    {
      header: "Hora",
      cell: (row: Clase) => formatearConZona(row.diaHoraCompleto),
    },
    {
      header: "Alumno",
      cell: (row: Clase) => getNombreParaClase(row),
    },
    {
      header: "Instructor",
      cell: (row: Clase) => getInstructorNombre(row.instructorId),
    },
    {
      header: "Caballo",
      cell: (row: Clase) => getCaballoNombre(row.caballoId),
    },
    {
      header: "Especialidad",
      cell: (row: Clase) => row.especialidad,
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
      header: "Acciones",
      cell: (row: Clase) => {
        const puedeEditar = puedeEditarClase(row);
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Abrir menú de acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  openEdit(row);
                }}
                disabled={!puedeEditar}
              >
                <Pencil className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>Editar</span>
                  {!puedeEditar && (
                    <span className="text-xs text-muted-foreground">
                      Clase finalizada
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  openDelete(row);
                }}
                disabled={!puedeEditar}
                className="text-red-600 focus:text-red-600 disabled:text-muted-foreground"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>Eliminar</span>
                  {!puedeEditar && (
                    <span className="text-xs text-muted-foreground">
                      Clase finalizada
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  return (
    <Layout>
      <PageHeader
        title="Clases"
        description="Programa y gestiona las clases de equitación"
        action={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                onClick={() => setViewMode("table")}
                title="Vista tabla"
              >
                <Table className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                onClick={() => setViewMode("cards")}
                title="Vista tarjetas"
              >
                <IdCard className="h-4 w-4" />
              </Button>
            </div>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => !open && closeEdit()}
            >
              <DialogTrigger asChild>
                <Button onClick={() => openEdit()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Clase
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-display">
                    {editingClase ? "Editar Clase" : "Nueva Clase"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingClase
                      ? "Modifica los datos de la clase"
                      : "Completa los datos para programar una nueva clase"}
                  </DialogDescription>
                </DialogHeader>

                <ClaseForm
                  clase={editingClase ?? undefined}
                  alumnos={alumnos}
                  instructores={instructores}
                  caballos={caballos}
                  clases={clases}
                  personasPrueba={personasPrueba}
                  onSubmit={(data) => {
                    if (editingClase) {
                      updateMutation.mutate({ id: editingClase.id, data });
                    } else {
                      createMutation.mutate(data);
                    }
                  }}
                  isPending={
                    createMutation.isPending || updateMutation.isPending
                  }
                  onCancel={closeEdit}
                />
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="space-y-4">
        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          isLoading={isLoading}
        />

        {viewMode === "table" ? (
          <DataTable
            columns={columns}
            data={clases}
            isLoading={isLoading}
            emptyMessage="No hay clases que coincidan con los filtros"
            onRowClick={(clase) => navigate(`/clases/${clase.id}`)}
          />
        ) : isLoading ? (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {Array.from({ length: pageSize }).map((_, i) => (
              <GenericCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {clases.map((clase) => (
              <GenericCard
                item={clase}
                key={clase.id}
                title={getNombreParaClase(clase)}
                subtitle={`${clase.dia} - ${formatearConZona(clase.diaHoraCompleto)}`}
                fields={[
                  {
                    label: "Instructor",
                    value: getInstructorNombre(clase.instructorId),
                  },
                  {
                    label: "Caballo",
                    value: getCaballoNombre(clase.caballoId),
                  },
                  { label: "Especialidad", value: clase.especialidad },
                  {
                    label: "Estado",
                    value: ESTADO_LABELS[clase.estado],
                  },
                ]}
                onClick={() => navigate(`/clases/${clase.id}`)}
                onEdit={() => openEdit(clase)}
                onDelete={() => openDelete(clase)}
                onSendWhatsApp={function (): void {
                  throw new Error("Function not implemented.");
                }}
                onSendEmail={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
            ))}
          </div>
        )}

        {totalItems > 0 && (
          <PaginationControls
            currentPage={page + 1}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={(p) => setPage(p - 1)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(0);
            }}
          />
        )}

        <Dialog open={!!claseToDelete} onOpenChange={closeDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar clase</DialogTitle>
              <DialogDescription>
                ¿Seguro que deseas eliminar la clase de{" "}
                {claseToDelete && getNombreParaClase(claseToDelete)}
                del día {claseToDelete?.dia.split("-")[2]}/
                {claseToDelete?.dia.split("-")[1]}/
                {claseToDelete?.dia.split("-")[0]} a las{" "}
                {claseToDelete &&
                  formatearConZona(claseToDelete.diaHoraCompleto)}{" "}
                horas? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={closeDelete}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (claseToDelete) {
                    deleteMutation.mutate(claseToDelete.id);
                  }
                }}
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
