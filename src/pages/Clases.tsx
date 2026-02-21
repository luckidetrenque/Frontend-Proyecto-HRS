import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import {
  Alumno,
  alumnosApi,
  Caballo,
  caballosApi,
  Clase,
  clasesApi,
  ClaseSearchFilters,
  Instructor,
  instructoresApi,
  personasPruebaApi,
} from "@/lib/api";
import { puedeEditarClase } from "@/utils/validacionesClases";

export default function ClasesPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [claseToEdit, setClaseToEdit] = useState<Clase | null>(null);
  const [claseToDelete, setClaseToDelete] = useState<Clase | null>(null);

  const navigate = useNavigate();

  // 🔍 ESTADO PARA BÚSQUEDA INTELIGENTE
  const [searchFilters, setSearchFilters] = useState<ClaseSearchFilters>({});

  // 🔍 HANDLER PARA BÚSQUEDA INTELIGENTE
  const handleSmartSearch = (filters: Record<string, unknown>) => {
    const typedFilters: ClaseSearchFilters = {};

    if (filters.dia) typedFilters.dia = String(filters.dia);
    if (filters.hora) typedFilters.hora = String(filters.hora);
    if (filters.alumnoId) typedFilters.alumnoId = Number(filters.alumnoId);
    if (filters.instructorId)
      typedFilters.instructorId = Number(filters.instructorId);
    if (filters.caballoId) typedFilters.caballoId = Number(filters.caballoId);
    if (filters.especialidad)
      typedFilters.especialidad = String(
        filters.especialidad,
      ) as Clase["especialidad"];
    if (filters.estado)
      typedFilters.estado = String(filters.estado) as Clase["estado"];

    setSearchFilters(typedFilters);
    setCurrentPage(1);
  };

  useEffect(() => {
    const handleGlobalSearchEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { filters, entityType } = customEvent.detail;

      if (entityType === "clases") {
        handleSmartSearch(filters);
      }
    };

    window.addEventListener("globalSearch", handleGlobalSearchEvent);

    return () => {
      window.removeEventListener("globalSearch", handleGlobalSearchEvent);
    };
  }, []);

  // Estados de filtros
  const [filters, setFilters] = useState({
    dia: "",
    hora: "",
    alumnoId: "all",
    instructorId: "all",
    caballoId: "all",
    especialidad: "all",
    estado: "all",
  });

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 🔍 QUERY UNIFICADA
  const { data: clases = [], isLoading } = useQuery({
    queryKey: ["clases-page", searchFilters],
    queryFn: () => {
      if (Object.keys(searchFilters).length > 0) {
        return clasesApi.buscar(searchFilters);
      }
      return clasesApi.listarDetalladas();
    },
    enabled: true,
  });

  // Determinar si hay búsqueda activa
  const isSearchActive = Object.keys(searchFilters).length > 0;

  const { data: alumnos = [] } = useQuery({
    queryKey: ["alumnos"],
    queryFn: alumnosApi.listar,
  });

  const { data: personasPrueba = [] } = useQuery({
    queryKey: ["personas_prueba"],
    queryFn: personasPruebaApi.listar,
  });

  // 🔧 Filtrar solo objetos válidos de Alumno
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

  // Filtrar datos
  const filteredData = useMemo(() => {
    return clases.filter((clase: Clase) => {
      if (filters.dia && clase.dia !== filters.dia) {
        return false;
      }
      if (filters.hora && !clase.hora.startsWith(filters.hora)) {
        return false;
      }
      if (
        filters.alumnoId !== "all" &&
        clase.alumnoId !== Number(filters.alumnoId)
      ) {
        return false;
      }
      if (
        filters.instructorId !== "all" &&
        clase.instructorId !== Number(filters.instructorId)
      ) {
        return false;
      }
      if (
        filters.caballoId !== "all" &&
        clase.caballoId !== Number(filters.caballoId)
      ) {
        return false;
      }
      if (
        filters.especialidad !== "all" &&
        clase.especialidad !== filters.especialidad
      ) {
        return false;
      }
      if (filters.estado !== "all" && clase.estado !== filters.estado) {
        return false;
      }
      return true;
    });
  }, [clases, filters]);

  // Paginar datos
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Configuración de filtros
  const filterConfig = [
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
      name: "alumnoId",
      label: "Alumno",
      type: "select" as const,
      options: alumnosValidos.map((a: Alumno) => ({
        label: `${a.nombre} ${a.apellido}`,
        value: String(a.id),
      })),
      placeholder: "Todos los alumnos",
    },
    {
      name: "instructorId",
      label: "Instructor",
      type: "select" as const,
      options: instructores.map((i: Instructor) => ({
        label: `${i.nombre} ${i.apellido}`,
        value: String(i.id),
      })),
      placeholder: "Todos los instructores",
    },
    {
      name: "caballoId",
      label: "Caballo",
      type: "select" as const,
      options: caballos.map((c: Caballo) => ({
        label: c.nombre,
        value: String(c.id),
      })),
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
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      dia: "",
      hora: "",
      alumnoId: "all",
      instructorId: "all",
      caballoId: "all",
      especialidad: "all",
      estado: "all",
    });
    setCurrentPage(1);
    setSearchFilters({});
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const createMutation = useMutation({
    mutationFn: clasesApi.crear,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clases-page"] });
      setIsOpen(false);
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
      queryClient.invalidateQueries({ queryKey: ["clases-page"] });
      setIsOpen(false);
      setClaseToEdit(null);
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
      queryClient.invalidateQueries({ queryKey: ["clases-page"] });
      const successMsg =
        data.__successMessage || "Clase eliminada correctamente";
      toast.success(successMsg);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al eliminar la clase"),
  });

  const getNombreParaClase = (clase: Clase): string => {
    if (clase.alumnoId) {
      const alumno = alumnosValidos.find(
        (a: Alumno) => a.id === clase.alumnoId,
      );
      return alumno ? `${alumno.nombre} ${alumno.apellido}` : "-";
    }
    // Para clases de prueba: usar el campo que ya viene del servidor
    return clase.personaPruebaNombreCompleto ?? "-";
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
        `${row.dia.split("-")[2]}/${row.dia.split("-")[1]}/${
          row.dia.split("-")[0]
        }`,
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
                  setClaseToEdit(row);
                  setIsOpen(true);
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
                  if (confirm("¿Eliminar esta clase?")) {
                    deleteMutation.mutate(row.id);
                  }
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
              >
                Tabla
              </Button>

              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                onClick={() => setViewMode("cards")}
              >
                Cards
              </Button>
            </div>

            <Dialog
              open={isOpen}
              onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) setClaseToEdit(null);
              }}
            >
              <DialogTrigger asChild>
                <Button className="h-11 shrink-0">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Clase
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-display">
                    {claseToEdit ? "Editar Clase" : "Nueva Clase"}
                  </DialogTitle>
                  <DialogDescription>
                    {claseToEdit
                      ? "Modifica los datos de la clase"
                      : "Completa los datos para programar una nueva clase"}
                  </DialogDescription>
                </DialogHeader>

                <ClaseForm
                  clase={claseToEdit ?? undefined}
                  alumnos={alumnosValidos}
                  instructores={instructores}
                  caballos={caballos}
                  clases={clases}
                  personasPrueba={personasPrueba}
                  onSubmit={(data) => {
                    if (claseToEdit) {
                      updateMutation.mutate({ id: claseToEdit.id, data });
                    } else {
                      createMutation.mutate(data);
                    }
                  }}
                  isPending={
                    createMutation.isPending || updateMutation.isPending
                  }
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
            data={paginatedData}
            isLoading={isLoading}
            emptyMessage={
              isSearchActive
                ? "No se encontraron clases con esos criterios de búsqueda"
                : "No hay clases que coincidan con los filtros"
            }
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
            {paginatedData.map((clase) => (
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
                onEdit={() => {
                  setClaseToEdit(clase);
                  setIsOpen(true);
                }}
                onDelete={
                  puedeEditarClase(clase)
                    ? () => {
                        if (confirm("¿Eliminar esta clase?")) {
                          deleteMutation.mutate(clase.id);
                        }
                      }
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {filteredData.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredData.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </Layout>
  );
}
