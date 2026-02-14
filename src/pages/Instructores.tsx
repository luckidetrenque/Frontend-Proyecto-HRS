import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { GenericCard } from "@/components/cards/GenericCard";
import { GenericCardSkeleton } from "@/components/cards/GenericCardSkeleton";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { PRESET_COLORS } from "@/constants/instructor.constants";
import { useValidarDniDuplicado } from "@/hooks/useValidarDniDuplicado";
import {
  Instructor,
  instructoresApi,
  InstructorSearchFilters,
} from "@/lib/api";

export default function InstructoresPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(
    null,
  );
  const [instructorToDelete, setInstructorToDelete] =
    useState<Instructor | null>(null);
  const [dniInput, setDniInput] = useState(editingInstructor?.dni || "");
  const [validacionHabilitada, setValidacionHabilitada] = useState(false);

  const { data: validacionDni } = useValidarDniDuplicado(
    "instructores",
    dniInput,
    editingInstructor?.id,
  );

  const validacionActiva =
    validacionHabilitada && dniInput.length >= 9
      ? validacionDni
      : { duplicado: false, mensaje: "" };

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

    if (validacionActiva?.duplicado) {
      toast.error("No se puede guardar: Ya existe un instructor con este DNI");
      return;
    }
    const formData = new FormData(e.currentTarget);
    const data = {
      dni: formData.get("dni") as string,
      nombre: formData.get("nombre") as string,
      apellido: formData.get("apellido") as string,
      fechaNacimiento: formData.get("fechaNacimiento") as string,
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
    if (editingInstructor) {
      setDniInput(editingInstructor.dni);
      setInstructorColor(editingInstructor.color);
      setValidacionHabilitada(false);
    } else {
      setDniInput("");
      setInstructorColor(PRESET_COLORS[0]);
      setValidacionHabilitada(true);
    }
  }, [editingInstructor]);

  useEffect(() => {
    if (isOpen) {
      setDniInput(editingInstructor?.dni || "");
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setEditingInstructor(row);
                setIsOpen(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("¿Eliminar este instructor?")) {
                  deleteMutation.mutate(row.id);
                }
              }}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                          value={dniInput}
                          onChange={(e) => {
                            setDniInput(e.target.value);
                            setValidacionHabilitada(true);
                          }}
                          placeholder="Solo números sin puntos"
                          className={
                            validacionDni?.duplicado ? "border-red-500" : ""
                          }
                          required
                        />
                        {validacionDni?.duplicado && (
                          <p className="text-sm text-red-500 mt-1">
                            {validacionDni.mensaje}
                          </p>
                        )}
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
                        createMutation.isPending ||
                        updateMutation.isPending ||
                        validacionActiva?.duplicado
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
