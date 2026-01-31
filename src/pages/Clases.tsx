import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilterBar } from "@/components/ui/filter-bar";
import { PaginationControls } from "@/components/ui/pagination-controls";
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
import {
  clasesApi,
  alumnosApi,
  instructoresApi,
  caballosApi,
  Clase,
  Alumno,
  Instructor,
  Caballo,
  ClaseDetallada,
  ClaseSearchFilters,
} from "@/lib/api";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ALUMNO_COMODIN_ID } from "@/components/calendar/calendar.styles";
import { useNavigate } from "react-router-dom";
import { GenericCardSkeleton } from "@/components/cards/GenericCardSkeleton";
import { GenericCard } from "@/components/cards/GenericCard";

const estadoColors: Record<
  string,
  "success" | "warning" | "error" | "info" | "default"
> = {
  PROGRAMADA: "warning",
  INICIADA: "info",
  COMPLETADA: "success",
  CANCELADA: "error",
  ACA: "info",
  ASA: "info",
};

const especialidad = ["EQUINOTERAPIA", "EQUITACION", "ADIESTRAMIENTO", "MONTA"];

export default function ClasesPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingClase, setEditingClase] = useState<Clase | null>(null);
  const [claseToDelete, setClaseToDelete] = useState<Clase | null>(null);

  const navigate = useNavigate();

  // 🔍 ESTADO PARA BÚSQUEDA INTELIGENTE
  const [searchFilters, setSearchFilters] = useState<ClaseSearchFilters>({});
  const [isSearchActive, setIsSearchActive] = useState(false);

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
      typedFilters.especialidad = String(filters.especialidad) as
        | "ADIESTRAMIENTO"
        | "EQUINOTERAPIA"
        | "EQUITACION";
    if (filters.estado)
      typedFilters.estado = String(filters.estado) as
        | "PROGRAMADA"
        | "INICIADA"
        | "COMPLETADA"
        | "CANCELADA"
        | "ACA"
        | "ASA";

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

  // Estados para controlar la especialidad y el alumno en el formulario
  const [especialidadSeleccionada, setEspecialidadSeleccionada] =
    useState<string>("");
  const [alumnoIdSeleccionado, setAlumnoIdSeleccionado] = useState<string>("");

  // 🔍 QUERY PARA BÚSQUEDA INTELIGENTE
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["clases-search", searchFilters],
    queryFn: () => {
      if (Object.keys(searchFilters).length > 0) {
        setIsSearchActive(true);
        return clasesApi.buscar(searchFilters);
      }
      setIsSearchActive(false);
      return clasesApi.listarDetalladas();
    },
    enabled: true,
  });

  const { data: allClases = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ["clases"],
    queryFn: clasesApi.listarDetalladas,
    enabled: !isSearchActive,
  });

  const clases = searchResults || allClases;
  const isLoading = isSearching || isLoadingAll;

  const { data: alumnos = [] } = useQuery({
    queryKey: ["alumnos"],
    queryFn: alumnosApi.listar,
  });

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
      options: alumnos.map((a: Alumno) => ({
        label: `${a.nombre} ${a.apellido}`,
        value: String(a.id),
      })),
    },
    {
      name: "instructorId",
      label: "Instructor",
      type: "select" as const,
      options: instructores.map((i: Instructor) => ({
        label: `${i.nombre} ${i.apellido}`,
        value: String(i.id),
      })),
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
      options: especialidad.map((e) => ({
        label: e,
        value: e,
      })),
    },
    {
      name: "estado",
      label: "Estado",
      type: "select" as const,
      options: [
        { label: "Programada", value: "PROGRAMADA" },
        { label: "Iniciada", value: "INICIADA" },
        { label: "Completada", value: "COMPLETADA" },
        { label: "Cancelada", value: "CANCELADA" },
        { label: "ACA", value: "ACA" },
        { label: "ASA", value: "ASA" },
      ],
    },
  ];

  // Función para abrir el diálogo de edición
  const handleOpenEditDialog = (clase: Clase) => {
    setEditingClase(clase);
    setEspecialidadSeleccionada(clase.especialidad);
    setAlumnoIdSeleccionado(String(clase.alumnoId));
    setIsOpen(true);
  };

  // Función para abrir el diálogo de nueva clase
  const handleOpenCreateDialog = () => {
    setEditingClase(null);
    setEspecialidadSeleccionada("");
    setAlumnoIdSeleccionado("");
    setIsOpen(true);
  };

  // Función para cerrar el diálogo y resetear estados
  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingClase(null);
    setEspecialidadSeleccionada("");
    setAlumnoIdSeleccionado("");
  };

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

  // Manejador para cambio de especialidad
  const handleEspecialidadChange = (value: string) => {
    setEspecialidadSeleccionada(value);

    // Si es MONTA, asignar automáticamente el alumno comodín
    if (value === "MONTA") {
      setAlumnoIdSeleccionado(String(ALUMNO_COMODIN_ID));
    }
  };

  const createMutation = useMutation({
    mutationFn: clasesApi.crear,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clases-search"] });
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
      queryClient.invalidateQueries({ queryKey: ["clases-search"] });
      setIsOpen(false);
      setEditingClase(null);
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
      queryClient.invalidateQueries({ queryKey: ["clases-search"] });
      const successMsg =
        data.__successMessage || "Clase eliminada correctamente";
      toast.success(successMsg);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al eliminar la clase"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      especialidad: formData.get("especialidad") as
        | "ADIESTRAMIENTO"
        | "EQUINOTERAPIA"
        | "EQUITACION"
        | "MONTA",
      dia: new Date(formData.get("dia") as string).toISOString().split("T")[0],
      hora: new Date(`1970-01-01T${formData.get("hora") as string}`)
        .toISOString()
        .split("T")[1]
        .substring(0, 5),
      duracion: 60,
      estado: formData.get("estado") as
        | "PROGRAMADA"
        | "INICIADA"
        | "COMPLETADA"
        | "CANCELADA"
        | "ACA"
        | "ASA",
      observaciones: "",
      alumnoId: Number(formData.get("alumnoId")),
      instructorId: Number(formData.get("instructorId")),
      caballoId: Number(formData.get("caballoId")),
      diaHoraCompleto: "",
      esPrueba: formData.get("esPrueba") === "on",
    };

    if (editingClase) {
      updateMutation.mutate({ id: editingClase.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getAlumnoNombre = (id: number) => {
    const alumno = alumnos.find((a: Alumno) => a.id === id);
    return alumno ? `${alumno.nombre} ${alumno.apellido}` : "-";
  };

  const getInstructorNombre = (id: number) => {
    const instructor = instructores.find((i: Instructor) => i.id === id);
    return instructor ? `${instructor.nombre} ${instructor.apellido}` : "-";
  };

  const getCaballoNombre = (id: number) => {
    const caballo = caballos.find((c: Caballo) => c.id === id);
    return caballo?.nombre || "-";
  };

  const formatearConZona = (diaHoraIso: string) => {
    return new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires", // Fuerza la zona horaria
    }).format(new Date(diaHoraIso));
  };

  const obtenerHoraArgentina = (isoString?: string) => {
    if (!isoString) return "";

    const fecha = new Date(isoString);
    if (isNaN(fecha.getTime())) return "";

    // Forzamos la zona horaria a America/Argentina/Buenos_Aires
    return fecha
      .toLocaleTimeString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // Formato 24hs requerido por el input
      })
      .replace(":", ":"); // Asegura que use el separador estándar
  };

  const hoy = new Date();

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
      cell: (row: Clase) => getAlumnoNombre(row.alumnoId),
    },
    {
      header: "Instructor",
      cell: (row: Clase) => getInstructorNombre(row.instructorId),
    },
    {
      header: "Caballo",
      cell: (row: Clase) => getCaballoNombre(row.caballoId),
    },
    { header: "Especialidad", accessorKey: "especialidad" as keyof Clase },
    {
      header: "Estado",
      cell: (row: Clase) => (
        <StatusBadge status={estadoColors[row.estado] || "default"}>
          {row.estado}
        </StatusBadge>
      ),
    },
    {
      header: "Tipo",
      cell: (row: Clase) =>
        row.esPrueba ? (
          <StatusBadge status="warning">🎓 Prueba</StatusBadge>
        ) : null,
    },
    {
      header: "Acciones",
      cell: (row: Clase) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setEditingClase(row);
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
              if (confirm("¿Eliminar esta clase?")) {
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
                if (!open) setEditingClase(null);
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Clase
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <form onSubmit={handleSubmit}>
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
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dia">Dia</Label>
                        <Input
                          id="dia"
                          name="dia"
                          type="date"
                          defaultValue={
                            editingClase?.dia ||
                            hoy.getFullYear() +
                              "-" +
                              hoy.getMonth() +
                              1 +
                              "-" +
                              hoy.getDate()
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hora">Hora</Label>
                        <Input
                          id="hora"
                          name="hora"
                          type="time"
                          defaultValue={
                            editingClase
                              ? obtenerHoraArgentina(
                                  editingClase.diaHoraCompleto,
                                )
                              : "09:00"
                          }
                          // defaultValue={editingClase?.hora}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="alumnoId">
                          {" "}
                          Alumno
                          {especialidadSeleccionada === "MONTA" && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (Auto)
                            </span>
                          )}
                        </Label>
                        {/* Campo oculto para enviar el alumnoId cuando el select está deshabilitado */}
                        {especialidadSeleccionada === "MONTA" && (
                          <input
                            type="hidden"
                            name="alumnoId"
                            value={alumnoIdSeleccionado}
                          />
                        )}
                        <Select
                          name={
                            especialidadSeleccionada === "MONTA"
                              ? ""
                              : "alumnoId"
                          }
                          required={especialidadSeleccionada !== "MONTA"}
                          value={alumnoIdSeleccionado}
                          onValueChange={setAlumnoIdSeleccionado}
                          defaultValue={String(editingClase?.alumnoId || "")}
                          disabled={especialidadSeleccionada === "MONTA"}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar alumno" />
                          </SelectTrigger>
                          <SelectContent>
                            {alumnos.map((alumno: Alumno) => (
                              <SelectItem
                                key={alumno.id}
                                value={String(alumno.id)}
                              >
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
                          defaultValue={String(editingClase?.caballoId || "")}
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
                                  {caballo.tipo === "ESCUELA"
                                    ? "Escuela"
                                    : "Privado"}
                                  )
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
                          defaultValue={String(
                            editingClase?.instructorId || "",
                          )}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar instructor" />
                          </SelectTrigger>
                          <SelectContent>
                            {instructores
                              .filter((i: Instructor) => i.activo)
                              .map((instructor: Instructor) => (
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
                          value={especialidadSeleccionada}
                          onValueChange={handleEspecialidadChange}
                          defaultValue={editingClase?.especialidad || ""}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar especialidad" />
                          </SelectTrigger>
                          <SelectContent>
                            {especialidad.map((esp) => (
                              <SelectItem key={esp} value={esp}>
                                {esp}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Select
                          name="estado"
                          defaultValue={editingClase?.estado || "PROGRAMADA"}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PROGRAMADA">
                              Programada
                            </SelectItem>
                            <SelectItem value="INICIADA">Iniciada</SelectItem>
                            <SelectItem value="COMPLETADA">
                              Completada
                            </SelectItem>
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
                          defaultValue={editingClase?.observaciones || ""}
                          placeholder="Ej. Lluvia, Feriado, etc"
                        />
                      </div>
                    </div>
                    {/* ✅ NUEVO: Checkbox para clase de prueba */}
                    {!editingClase && (
                      <div className="flex items-center gap-3 rounded-md border border-orange-300 bg-orange-50 p-3">
                        <input
                          type="checkbox"
                          id="esPrueba"
                          name="esPrueba"
                          className="h-4 w-4 rounded border-orange-400 text-orange-600 focus:ring-orange-500"
                        />
                        <Label htmlFor="esPrueba" className="text-sm">
                          <span className="font-semibold text-orange-800">
                            Clase de Prueba
                          </span>
                          <span className="ml-2 text-xs text-orange-600">
                            (El alumno debe estar inactivo)
                          </span>
                        </Label>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={
                        createMutation.isPending || updateMutation.isPending
                      }
                    >
                      {editingClase ? "Guardar Cambios" : "Crear Clase"}
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
                ? "No se encontraron alumnos con esos criterios de búsqueda"
                : "No hay alumnos que coincidan con los filtros"
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
                title={`Clase de ${
                  clase.especialidad.charAt(0) +
                  clase.especialidad.slice(1).toLowerCase()
                }`}
                subtitle=""
                // TODO subtitle="Descripción crear campo en db"
                fields={[
                  {
                    label: "Dia",
                    value: `${clase.dia.split("-")[2]}/${clase.dia.split("-")[1]}/${
                      clase.dia.split("-")[0]
                    }`,
                  },
                  {
                    label: "Hora",
                    value: formatearConZona(clase.diaHoraCompleto),
                  },
                  { label: "Alumno", value: getAlumnoNombre(clase.alumnoId) },
                  {
                    label: "Instructor",
                    value: getInstructorNombre(clase.instructorId),
                  },
                  {
                    label: "Caballo",
                    value: getCaballoNombre(clase.caballoId),
                  },
                  {
                    label: "Estado ",
                    value: clase.estado,
                    type: "badge",
                    trueLabel: "",
                    falseLabel: "",
                  },
                ]}
                onClick={() => navigate(`/clases/${clase.id}`)}
                onEdit={() => {
                  setEditingClase(clase);
                  setIsOpen(true);
                }}
                onDelete={() => setClaseToDelete(clase)}
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
