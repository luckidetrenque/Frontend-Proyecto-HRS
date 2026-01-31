import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FilterBar } from "@/components/ui/filter-bar";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { GenericCard } from "@/components/cards/GenericCard";
import { GenericCardSkeleton } from "@/components/cards/GenericCardSkeleton";
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
  instructoresApi,
  Instructor,
  InstructorSearchFilters,
} from "@/lib/api";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const PRESET_COLORS = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#10B981", // green
  "#F59E0B", // amber
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
  "#6366F1", // indigo
  "#84CC16", // lime
];

export default function InstructoresPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(
    null,
  );
  const [instructorToDelete, setInstructorToDelete] =
    useState<Instructor | null>(null);

  const navigate = useNavigate();

  const [instructorColor, setInstructorColor] = useState<string>(
    PRESET_COLORS[0],
  );

  // 🔍 ESTADO PARA BÚSQUEDA INTELIGENTE
  const [searchFilters, setSearchFilters] = useState<InstructorSearchFilters>(
    {},
  );
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Estados de filtros
  const [filters, setFilters] = useState({
    activo: "all",
  });

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 🔍 HANDLER PARA BÚSQUEDA INTELIGENTE
  const handleSmartSearch = (filters: Record<string, unknown>) => {
    const typedFilters: InstructorSearchFilters = {};

    if (filters.nombre) typedFilters.nombre = String(filters.nombre);
    if (filters.apellido) typedFilters.apellido = String(filters.apellido);
    if (filters.activo !== undefined)
      typedFilters.activo = Boolean(filters.activo);
    if (filters.fechaNacimiento)
      typedFilters.fechaNacimiento = String(filters.fechaNacimiento);

    setSearchFilters(typedFilters);
    setCurrentPage(1); // Reset a página 1 al buscar
  };
  // ✅ NUEVO: Escuchar evento de búsqueda global desde el Layout
  useEffect(() => {
    const handleGlobalSearchEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { filters, entityType } = customEvent.detail;

      // Solo procesar si el evento es para esta entidad
      if (entityType === "instructores") {
        handleSmartSearch(filters);
      }
    };

    // Registrar el listener
    window.addEventListener("globalSearch", handleGlobalSearchEvent);

    // Cleanup: remover el listener al desmontar
    return () => {
      window.removeEventListener("globalSearch", handleGlobalSearchEvent);
    };
  }, []);

  // 🔍 QUERY PARA BÚSQUEDA INTELIGENTE
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["instructores-search", searchFilters],
    queryFn: () => {
      // Si hay filtros de búsqueda, usar endpoint de búsqueda
      if (Object.keys(searchFilters).length > 0) {
        setIsSearchActive(true);
        return instructoresApi.buscar(searchFilters);
      }
      // Si no hay filtros, listar todos
      setIsSearchActive(false);
      return instructoresApi.listar();
    },
    enabled: true,
  });

  // Query original (como fallback)
  const { data: allInstructores = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ["instructores"],
    queryFn: instructoresApi.listar,
    enabled: !isSearchActive, // Solo cargar si no hay búsqueda activa
  });

  // Usar resultados de búsqueda o todos los instructores
  const instructores = searchResults || allInstructores;
  const isLoading = isSearching || isLoadingAll;

  // Filtrar datos
  const filteredData = useMemo(() => {
    return instructores.filter((instructor: Instructor) => {
      if (
        filters.activo !== "all" &&
        String(instructor.activo) !== filters.activo
      ) {
        return false;
      }
      return true;
    });
  }, [instructores, filters]);

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
      name: "activo",
      label: "Estado",
      type: "select" as const,
      options: [
        { label: "Activo", value: "true" },
        { label: "Inactivo", value: "false" },
      ],
    },
  ];

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      activo: "all",
    });
    setSearchFilters({}); // ✅ AGREGAR ESTA LÍNEA
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const createMutation = useMutation({
    mutationFn: instructoresApi.crear,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["instructores-search"] });
      setIsOpen(false);
      const successMsg =
        data.__successMessage || "Instructor creado correctamente";
      toast.success(successMsg);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al crear el instructor"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Instructor> }) =>
      instructoresApi.actualizar(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["instructores-search"] });
      setIsOpen(false);
      setEditingInstructor(null);
      const successMsg =
        data.__successMessage || "Instructor actualizado correctamente";
      toast.success(successMsg);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al actualizar el instructor"),
  });

  const deleteMutation = useMutation({
    mutationFn: instructoresApi.eliminar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["instructores-search"] });
      const successMsg =
        data.__successMessage || "Instructor eliminado correctamente";
      toast.success(successMsg);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al eliminar el instructor"),
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

    if (editingInstructor) {
      updateMutation.mutate({ id: editingInstructor.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  useEffect(() => {
    if (isOpen && editingInstructor) {
      setInstructorColor(editingInstructor.color || PRESET_COLORS[0]);
    } else if (!isOpen) {
      setInstructorColor(PRESET_COLORS[0]);
    }
  }, [isOpen, editingInstructor]);

  const columns = [
    {
      header: "Nombre y Apellido",
      cell: (row: Instructor) => `${row.nombre} ${row.apellido}`,
    },
    { header: "DNI", accessorKey: "dni" as keyof Instructor },
    { header: "Teléfono", accessorKey: "telefono" as keyof Instructor },
    { header: "Email", accessorKey: "email" as keyof Instructor },
    {
      header: "Estado",
      cell: (row: Instructor) => (
        <StatusBadge status={row.activo ? "success" : "default"}>
          {row.activo ? "Activo" : "Inactivo"}
        </StatusBadge>
      ),
    },
    {
      header: "Acciones",
      cell: (row: Instructor) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setEditingInstructor(row);
              setIsOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("¿Eliminar este instructor?")) {
                deleteMutation.mutate(row.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  return (
    <Layout>
      <PageHeader
        title="Instructores"
        description="Administra el equipo de instructores de la escuela"
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
                if (!open) setEditingInstructor(null);
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Instructor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle className="font-display">
                      {editingInstructor
                        ? "Editar Instructor"
                        : "Nuevo Instructor"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingInstructor
                        ? "Modifica los datos del instructor"
                        : "Completa los datos para registrar un nuevo instructor"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre/s</Label>
                        <Input
                          id="nombre"
                          name="nombre"
                          defaultValue={editingInstructor?.nombre}
                          placeholder="Nombre/s del instructor"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellido">Apellido/s</Label>
                        <Input
                          id="apellido"
                          name="apellido"
                          defaultValue={editingInstructor?.apellido}
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
                          defaultValue={editingInstructor?.dni}
                          placeholder="Solo números sin puntos"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fechaNacimiento">
                          Fecha de Nacimiento
                        </Label>
                        <Input
                          id="fechaNacimiento"
                          name="fechaNacimiento"
                          type="date"
                          defaultValue={editingInstructor?.fechaNacimiento}
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
                          defaultValue={editingInstructor?.telefono}
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
                          defaultValue={editingInstructor?.email}
                          placeholder="instructor@correo.com"
                        />
                      </div>
                    </div>

                    {/* ✅ AGREGAR ESTA SECCIÓN COMPLETA */}
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
                        defaultChecked={editingInstructor?.activo ?? true}
                      />
                      <Label htmlFor="activo">Instructor activo</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={
                        createMutation.isPending || updateMutation.isPending
                      }
                    >
                      {editingInstructor
                        ? "Guardar Cambios"
                        : "Crear Instructor"}
                    </Button>
                  </DialogFooter>
                </form>
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
                ? "No se encontraron instructores con esos criterios de búsqueda"
                : "No hay instructores que coincidan con los filtros"
            }
            onRowClick={(instructor) =>
              navigate(`/instructores/${instructor.id}`)
            }
          />
        ) : isLoading ? (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {Array.from({ length: pageSize }).map((_, i) => (
              <GenericCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {paginatedData.map((instructor) => (
              <GenericCard
                item={instructor}
                key={instructor.id}
                title={`${instructor.nombre} ${instructor.apellido}`}
                subtitle=""
                // TODO subtitle="Descripción crear campo en db"
                fields={[
                  { label: "DNI", value: instructor.dni },
                  { label: "Teléfono", value: instructor.telefono },
                  { label: "Email", value: instructor.email || "-" },
                  {
                    label: "Estado ",
                    value: instructor.activo,
                    type: "badge",
                    trueLabel: "Activo",
                    falseLabel: "Inactivo",
                  },
                ]}
                onClick={() => navigate(`/instructores/${instructor.id}`)}
                onEdit={() => {
                  setEditingInstructor(instructor);
                  setIsOpen(true);
                }}
                onDelete={() => setInstructorToDelete(instructor)}
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
