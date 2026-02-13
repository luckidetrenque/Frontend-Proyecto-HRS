import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  ALUMNO_COMODIN_ID,
  ESPECIALIDADES,
  ESPECIALIDADES_OPTIONS,
  ESTADO_COLORS,
  ESTADOS,
  ESTADOS_OPTIONS,
  formatearConZona,
  obtenerHoraArgentina,
  parsearHoraParaApi,
} from "@/components/calendar/clases.constants";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { useClasesRestantes } from "@/hooks/useClasesRestantes";
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
} from "@/lib/api";
import {
  handleEspecialidadChangeEffect,
  puedeEditarClase,
  resolverCaballoId,
  validarClasePrueba,
} from "@/utils/validacionesClases";

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
    // dia: format(new Date(), "yyyy-MM-dd"),
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

  // Filtrar caballos según alumno seleccionado

  // Verificar clases restantes del alumno
  const hoy = new Date();
  const {
    clasesRestantes,
    estaAgotado,
    cercaDelLimite,
    clasesTomadas,
    clasesContratadas,
  } = useClasesRestantes(
    alumnoIdSeleccionado ? Number(alumnoIdSeleccionado) : 0,
    hoy,
  );

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

  // Función para abrir el diálogo de edición
  const handleOpenEditDialog = (clase: Clase) => {
    setClaseToEdit(clase);
    setEspecialidadSeleccionada(clase.especialidad);
    setAlumnoIdSeleccionado(String(clase.alumnoId));
    setIsOpen(true);
  };

  // Función para abrir el diálogo de nueva clase

  // Función para cerrar el diálogo y resetear estados
  const handleCloseDialog = () => {
    setIsOpen(false);
    setClaseToEdit(null);
    setEspecialidadSeleccionada("");
    setAlumnoIdSeleccionado("");
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      // dia: format(new Date(), "yyyy-MM-dd"),
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
    handleEspecialidadChangeEffect(
      value,
      ALUMNO_COMODIN_ID,
      setEspecialidadSeleccionada,
      setAlumnoIdSeleccionado,
    );
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const alumnoId = Number(formData.get("alumnoId"));
    const alumno = alumnosValidos.find((a: Alumno) => a.id === alumnoId);
    const especialidad = formData.get("especialidad") as Clase["especialidad"];
    const esPrueba = formData.get("esPrueba") === "on";

    // Validación de clase de prueba (unificada)
    if (!claseToEdit && esPrueba && alumno) {
      const { esValido, mensaje } = validarClasePrueba(
        clases,
        alumno,
        especialidad,
        claseToEdit?.id,
      );
      if (!esValido) {
        toast.error(mensaje);
        return;
      }
    }

    // Resolver caballo
    const caballoId = resolverCaballoId(formData.get("caballoId"), alumno);
    if (!caballoId) {
      toast.error("Debe seleccionar un caballo");
      return;
    }

    const data = {
      especialidad,
      dia: formData.get("dia") as string,
      hora: parsearHoraParaApi(formData.get("hora") as string),
      duracion: 60,
      estado: (formData.get("estado") as Clase["estado"]) || "PROGRAMADA",
      observaciones: formData.get("observaciones") as string,
      alumnoId: alumno!.id,
      instructorId: Number(formData.get("instructorId")),
      caballoId,
      diaHoraCompleto: "",
      esPrueba,
    };

    if (claseToEdit) {
      updateMutation.mutate({ id: claseToEdit.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getAlumnoNombre = (id: number) => {
    const alumno = alumnosValidos.find((a: Alumno) => a.id === id);
    return alumno ? `${alumno.nombre} ${alumno.apellido}` : "-";
  };

  const getAlumnoNombreCompleto = (id: number) => {
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
        <StatusBadge status={ESTADO_COLORS[row.estado] || "default"}>
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
      cell: (row: Clase) => {
        const puedeEditar = puedeEditarClase(row);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Abrir menú de acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditDialog(row);
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
                if (!open) handleCloseDialog();
                else setIsOpen(true);
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
                      {claseToEdit ? "Editar Clase" : "Nueva Clase"}
                    </DialogTitle>
                    <DialogDescription>
                      {claseToEdit
                        ? `Editando clase de ${getAlumnoNombreCompleto(claseToEdit.alumnoId)}`
                        : "Completa los datos para programar una nueva clase"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* ✅ FILA 1: Hora de Inicio - Alumno */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dia">Día</Label>
                        <Input
                          id="dia"
                          name="dia"
                          type="date"
                          defaultValue={
                            claseToEdit?.dia || format(new Date(), "yyyy-MM-dd")
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hora">Hora de Inicio</Label>
                        <Input
                          id="hora"
                          name="hora"
                          type="time"
                          defaultValue={
                            claseToEdit
                              ? obtenerHoraArgentina(
                                  claseToEdit.diaHoraCompleto,
                                )
                              : "09:00"
                          }
                          required
                        />
                      </div>
                    </div>

                    {/* ✅ FILA 2: Alumno - Caballo */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="alumnoId">
                          Alumno
                          {especialidadSeleccionada === "MONTA" && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (Asignado automáticamente)
                            </span>
                          )}
                        </Label>
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
                          value={alumnoIdSeleccionado || ""}
                          onValueChange={setAlumnoIdSeleccionado}
                          disabled={especialidadSeleccionada === "MONTA"}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar alumno" />
                          </SelectTrigger>
                          <SelectContent>
                            {alumnosValidos.map((alumno: Alumno) => (
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
                        <Label htmlFor="caballoId">
                          Caballo
                          {/* Mostrar caballo predeterminado */}
                          {(() => {
                            const alumno = alumnosValidos.find(
                              (a: Alumno) =>
                                a.id === Number(alumnoIdSeleccionado),
                            );
                            if (alumno?.caballoPropio) {
                              const caballo = caballos.find(
                                (c: Caballo) =>
                                  c.id ===
                                  (typeof alumno.caballoPropio === "number"
                                    ? alumno.caballoPropio
                                    : alumno.caballoPropio.id),
                              );
                              return caballo ? (
                                <span className="ml-2 text-xs font-medium text-success">
                                  ✓ Predeterminado: {caballo.nombre}
                                </span>
                              ) : null;
                            }
                            return null;
                          })()}
                        </Label>
                        <Select
                          name="caballoId"
                          defaultValue={
                            claseToEdit
                              ? String(claseToEdit.caballoId)
                              : (() => {
                                  const alumno = alumnosValidos.find(
                                    (a: Alumno) =>
                                      a.id === Number(alumnoIdSeleccionado),
                                  );
                                  return alumno?.caballoPropio
                                    ? String(
                                        typeof alumno.caballoPropio === "number"
                                          ? alumno.caballoPropio
                                          : alumno.caballoPropio.id,
                                      )
                                    : "";
                                })()
                          }
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

                    {/* ✅ FILA 3: Instructor - Especialidad */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="instructorId">Instructor</Label>
                        <Select
                          name="instructorId"
                          required
                          defaultValue={String(claseToEdit?.instructorId || "")}
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
                          required
                          value={especialidadSeleccionada}
                          onValueChange={handleEspecialidadChange}
                          defaultValue={claseToEdit?.especialidad || ""}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar especialidad" />
                          </SelectTrigger>
                          <SelectContent>
                            {ESPECIALIDADES.map((esp) => (
                              <SelectItem key={esp} value={esp}>
                                {esp.charAt(0).toUpperCase() +
                                  esp.slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* ✅ FILA 4: Estado - Checkbox/Observaciones */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Select
                          name="estado"
                          required
                          defaultValue={claseToEdit?.estado || "PROGRAMADA"}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {ESTADOS.map((estado) => (
                              <SelectItem key={estado} value={estado}>
                                {/* Convierte "PROGRAMADA" en "Programada" */}
                                {estado.charAt(0).toUpperCase() +
                                  estado.slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {!claseToEdit ? (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">
                            Tipo de Clase
                          </Label>
                          <div className="flex items-center gap-3 rounded-md border border-orange-300 bg-orange-50 p-2.5 h-10">
                            <input
                              type="checkbox"
                              id="esPrueba"
                              name="esPrueba"
                              className="h-4 w-4 rounded border-orange-400 text-orange-600 focus:ring-orange-500"
                            />
                            <Label
                              htmlFor="esPrueba"
                              className="text-sm font-medium text-orange-800 cursor-pointer"
                            >
                              Clase de Prueba
                            </Label>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="observaciones">Observaciones</Label>
                          <Input
                            id="observaciones"
                            name="observaciones"
                            defaultValue={claseToEdit?.observaciones || ""}
                            placeholder="Ej. Lluvia, Feriado, etc"
                          />
                          <input
                            type="checkbox"
                            id="esPrueba"
                            name="esPrueba"
                            className="hidden"
                            value="on"
                            defaultChecked={claseToEdit?.esPrueba || false}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={
                        createMutation.isPending || updateMutation.isPending
                      }
                    >
                      {claseToEdit ? "Guardar Cambios" : "Crear Clase"}
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
                  if (puedeEditarClase(clase)) {
                    setClaseToEdit(clase);
                    setIsOpen(true);
                  } else {
                    toast.error("No se puede editar una clase finalizada");
                  }
                }}
                onDelete={() => {
                  if (puedeEditarClase(clase)) {
                    setClaseToDelete(clase);
                  } else {
                    toast.error("No se puede eliminar una clase finalizada");
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
