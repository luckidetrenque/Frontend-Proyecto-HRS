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
import SmartSearch from "@/components/ui/smart-search";
import { AlumnoCard } from "@/components/alumnos/AlumnoCard";
import { AlumnoCardSkeleton } from "@/components/alumnos/AlumnoCardSkeleton";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { alumnosApi, Alumno, AlumnoSearchFilters } from "@/lib/api";
import {
  Plus,
  Pencil,
  Trash2,
  MessageCircleMore,
  Voicemail,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function AlumnosPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);
  const navigate = useNavigate();

  // 🔍 ESTADO PARA BÚSQUEDA INTELIGENTE
  const [searchFilters, setSearchFilters] = useState<AlumnoSearchFilters>({});
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Estados de filtros
  const [filters, setFilters] = useState({
    cantidadClases: "all",
    activo: "all",
    propietario: "all",
  });

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 🔍 QUERY PARA BÚSQUEDA INTELIGENTE
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["alumnos-search", searchFilters],
    queryFn: () => {
      // Si hay filtros de búsqueda, usar endpoint de búsqueda
      if (Object.keys(searchFilters).length > 0) {
        setIsSearchActive(true);
        return alumnosApi.buscar(searchFilters);
      }
      // Si no hay filtros, listar todos
      setIsSearchActive(false);
      return alumnosApi.listar();
    },
    enabled: true,
  });

  useEffect(() => {
    const handleGlobalSearchEvent = (e: CustomEvent) => {
      const { filters, entityType } = e.detail;
      if (entityType === "alumnos") {
        handleSmartSearch(filters);
      }
    };

    window.addEventListener(
      "globalSearch",
      handleGlobalSearchEvent as EventListener,
    );
    return () => {
      window.removeEventListener(
        "globalSearch",
        handleGlobalSearchEvent as EventListener,
      );
    };
  }, []);

  // Query original (puedes mantenerlo como fallback)
  const { data: allAlumnos = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ["alumnos"],
    queryFn: alumnosApi.listar,
    enabled: !isSearchActive, // Solo cargar si no hay búsqueda activa
  });

  // Usar resultados de búsqueda o todos los alumnos
  const alumnos = searchResults || allAlumnos;
  const isLoading = isSearching || isLoadingAll;

  // 🔍 HANDLER PARA BÚSQUEDA INTELIGENTE
  const handleSmartSearch = (filters: Record<string, unknown>) => {
    const typedFilters: AlumnoSearchFilters = {};

    if (filters.nombre) typedFilters.nombre = String(filters.nombre);
    if (filters.apellido) typedFilters.apellido = String(filters.apellido);
    if (filters.activo !== undefined)
      typedFilters.activo = Boolean(filters.activo);
    if (filters.propietario !== undefined)
      typedFilters.propietario = Boolean(filters.propietario);
    if (filters.fechaInscripcion)
      typedFilters.fechaInscripcion = String(filters.fechaInscripcion);
    if (filters.fechaNacimiento)
      typedFilters.fechaNacimiento = String(filters.fechaNacimiento);

    setSearchFilters(typedFilters);
    setCurrentPage(1); // Reset a página 1 al buscar
  };

  // Filtrar datos
  const filteredData = useMemo(() => {
    return alumnos.filter((alumno: Alumno) => {
      if (
        filters.cantidadClases !== "all" &&
        String(alumno.cantidadClases) !== filters.cantidadClases
      ) {
        return false;
      }
      if (
        filters.activo !== "all" &&
        String(alumno.activo) !== filters.activo
      ) {
        return false;
      }
      if (
        filters.propietario !== "all" &&
        String(alumno.propietario) !== filters.propietario
      ) {
        return false;
      }
      return true;
    });
  }, [alumnos, filters]);

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
      name: "cantidadClases",
      label: "Clases/Mes",
      type: "select" as const,
      options: [
        { label: "4 clases", value: "4" },
        { label: "8 clases", value: "8" },
        { label: "12 clases", value: "12" },
        { label: "16 clases", value: "16" },
      ],
    },
    {
      name: "activo",
      label: "Estado",
      type: "select" as const,
      options: [
        { label: "Activo", value: "true" },
        { label: "Inactivo", value: "false" },
      ],
    },
    {
      name: "propietario",
      label: "Propietario",
      type: "select" as const,
      options: [
        { label: "Sí", value: "true" },
        { label: "No", value: "false" },
      ],
    },
  ];

  const createMutation = useMutation({
    mutationFn: alumnosApi.crear,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["alumnos"] });
      queryClient.invalidateQueries({ queryKey: ["alumnos-search"] });
      setIsOpen(false);
      const successMsg = data.__successMessage || "Alumno creado correctamente";
      toast.success(successMsg);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al crear el alumno"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Alumno> }) =>
      alumnosApi.actualizar(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["alumnos"] });
      queryClient.invalidateQueries({ queryKey: ["alumnos-search"] });
      setIsOpen(false);
      setEditingAlumno(null);
      const successMsg =
        data.__successMessage || "Alumno actualizado correctamente";
      toast.success(successMsg);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al actualizar el alumno"),
  });

  const deleteMutation = useMutation({
    mutationFn: alumnosApi.eliminar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["alumnos"] });
      queryClient.invalidateQueries({ queryKey: ["alumnos-search"] });
      const successMsg =
        data.__successMessage || "Alumno eliminado correctamente";
      toast.success(successMsg);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al eliminar el alumno"),
  });

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      cantidadClases: "all",
      activo: "all",
      propietario: "all",
    });
    setSearchFilters({}); // También limpiar búsqueda inteligente
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const columns = [
    {
      header: "Nombre y Apellido",
      cell: (row: Alumno) => `${row.nombre} ${row.apellido}`,
    },
    { header: "DNI", accessorKey: "dni" as keyof Alumno },
    { header: "Teléfono", accessorKey: "telefono" as keyof Alumno },
    { header: "Email", accessorKey: "email" as keyof Alumno },
    {
      header: "Inscripción",
      cell: (row: Alumno) =>
        `${row.fechaInscripcion.split("-")[2]}/${
          row.fechaInscripcion.split("-")[1]
        }/${row.fechaInscripcion.split("-")[0]}`,
    },
    {
      header: "Clases/Mes",
      cell: (row: Alumno) => (
        <span className="font-medium">{row.cantidadClases}</span>
      ),
    },
    {
      header: "Estado",
      cell: (row: Alumno) => (
        <StatusBadge status={row.activo ? "success" : "default"}>
          {row.activo ? "Activo" : "Inactivo"}
        </StatusBadge>
      ),
    },
    {
      header: "Propietario",
      cell: (row: Alumno) => (
        <StatusBadge status={row.propietario ? "success" : "default"}>
          {row.propietario ? "Sí" : "No"}
        </StatusBadge>
      ),
    },
    {
      header: "Acciones",
      cell: (row: Alumno) => (
        <div className="flex gap-2">
          <Button
            title={`Enviar mensaje a ${row.nombre} ${row.apellido}`}
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              // location.href = `https://wa.me/549221${row.telefono}`;
              window.open(
                encodeURI(
                  `https://wa.me/${row.telefono}?text=Hola ${row.nombre}, te contactamos desde la Escuela para avisarte que... `,
                ),
                "_blank",
              );
              // setAlumnoActivo(row);
            }}
          >
            <MessageCircleMore className="h-4 w-4 text-success" />
          </Button>
          <Button
            title={`Enviar correo a ${row.nombre} ${row.apellido}`}
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `mailto:${row.email}?subject=${encodeURIComponent(`Contacto para ${row.nombre} ${row.apellido}`)}`;
            }}
          >
            <Mail className="h-4 w-4 text-success" />
          </Button>
          <Button
            title={`Editar datos del alumno ${row.nombre} ${row.apellido}`}
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setEditingAlumno(row);
              setIsOpen(true);
            }}
            // label={`Editar datos de ${row.nombre} ${row.apellido}`}
            // {showLabel && <span>{label}</span>}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            title={`Eliminar el alumno ${row.nombre} ${row.apellido}`}
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("¿Eliminar este alumno?")) {
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

    if (editingAlumno) {
      updateMutation.mutate({ id: editingAlumno.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  return (
    <Layout>
      <PageHeader
        title="Alumnos"
        description="Gestiona los alumnos inscriptos en la escuela"
        action={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Contenedor específico para el buscador para controlar su ancho */}
            <div className="w-full sm:w-72 lg:w-96"></div>

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
                if (!open) setEditingAlumno(null);
              }}
            >
              <DialogTrigger asChild>
                <Button className="h-11 shrink-0">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Alumno
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle className="font-display">
                      {editingAlumno ? "Editar Alumno" : "Nuevo Alumno"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingAlumno
                        ? "Modifica los datos del alumno"
                        : "Completa los datos para registrar un nuevo alumno"}
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
                          defaultValue={editingAlumno?.nombre}
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
                          defaultValue={editingAlumno?.apellido}
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
                          defaultValue={editingAlumno?.dni}
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
                          defaultValue={editingAlumno?.fechaNacimiento}
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
                          defaultValue={editingAlumno?.telefono}
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
                          defaultValue={editingAlumno?.email}
                          placeholder="alumno@correo.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fechaInscripcion">
                          Fecha de Inscripcion
                        </Label>
                        <Input
                          id="fechaInscripcion"
                          name="fechaInscripcion"
                          type="date"
                          defaultValue={
                            editingAlumno?.fechaInscripcion ||
                            new Date().toISOString().split("T")[0]
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cantidadClases">Clases por Mes</Label>
                        <Select
                          name="cantidadClases"
                          defaultValue={String(
                            editingAlumno?.cantidadClases || 4,
                          )}
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
                          defaultChecked={editingAlumno?.propietario}
                        />
                        <Label htmlFor="propietario">
                          Tiene caballo propio
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          id="activo"
                          name="activo"
                          defaultChecked={editingAlumno?.activo ?? true}
                        />
                        <Label htmlFor="activo">Esta activo</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={
                        createMutation.isPending || updateMutation.isPending
                      }
                    >
                      {editingAlumno ? "Guardar Cambios" : "Crear Alumno"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="space-y-4">
        {/* Filtros tradicionales (opcional) */}
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
                ? "No se encontraron alumnos con esos criterios de búsqueda"
                : "No hay alumnos que coincidan con los filtros"
            }
            onRowClick={(alumno) => navigate(`/alumnos/${alumno.id}`)}
          />
        ) : isLoading ? (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {Array.from({ length: pageSize }).map((_, i) => (
              <AlumnoCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {paginatedData.map((alumno) => (
              <AlumnoCard
                key={alumno.id}
                alumno={alumno}
                onClick={() => navigate(`/alumnos/${alumno.id}`)}
                onEdit={() => {
                  setEditingAlumno(alumno);
                  setIsOpen(true);
                }}
                onDelete={() => {
                  if (confirm("¿Eliminar este alumno?")) {
                    deleteMutation.mutate(alumno.id);
                  }
                }}
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
