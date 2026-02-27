import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck,
  ChessKnight,
  House,
  IdCard,
  Mail,
  MessageCircleMore,
  MoreVertical,
  Pencil,
  Plus,
  Table,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { GenericCard } from "@/components/cards/GenericCard";
import { GenericCardSkeleton } from "@/components/cards/GenericCardSkeleton";
import { AlumnoForm } from "@/components/forms/AlumnoForm";
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
import { ProtectedData } from "@/components/ui/protected-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { useEntityActions } from "@/hooks/useEntityActions";
import { useValidarDniDuplicado } from "@/hooks/useValidarDniDuplicado";
import {
  Alumno,
  alumnosApi,
  AlumnoSearchFilters,
  caballosApi,
  clasesApi,
} from "@/lib/api";

export default function AlumnosPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ✅ Hook unificado para manejo de acciones
  const {
    editingEntity: editingAlumno,
    entityToDelete: alumnoToDelete,
    isDialogOpen,
    openEdit,
    closeEdit,
    openDelete,
    closeDelete,
  } = useEntityActions<Alumno>();

  const [validacionHabilitada, setValidacionHabilitada] = useState(false);

  const [dni, setDni] = useState<Alumno["dni"]>("");

  const { data: validacionDni } = useValidarDniDuplicado(
    "alumnos",
    dni,
    editingAlumno?.id,
  );

  // Deshabilitar validación si no está habilitada O si el DNI es muy corto
  const validacionActiva =
    validacionHabilitada && dni.length >= 9
      ? validacionDni
      : { duplicado: false, mensaje: "" };

  // 🔍 ESTADO PARA BÚSQUEDA INTELIGENTE
  const [searchFilters, setSearchFilters] = useState<AlumnoSearchFilters>({});

  // 🔍 QUERY UNIFICADA - reemplaza las dos queries anteriores
  const { data: alumnos = [], isLoading } = useQuery({
    queryKey: ["alumnos", searchFilters],
    queryFn: () => {
      // Si hay filtros de búsqueda, usar endpoint de búsqueda
      if (Object.keys(searchFilters).length > 0) {
        return alumnosApi.buscar(searchFilters);
      }
      // Si no hay filtros, listar todos
      return alumnosApi.listar();
    },
    enabled: true,
  });

  // Consulta de clases del mes actual
  const mesActual = new Date().getMonth() + 1;
  const añoActual = new Date().getFullYear();
  const mesActualNombre = new Date().toLocaleString("es-ES", { month: "long" });
  const { data: clases = [] } = useQuery({
    queryKey: ["clases-mes", mesActual, añoActual],
    queryFn: () => clasesApi.listar(),
    enabled: true,
  });

  // Determinar si hay búsqueda activa (derivado, no estado)
  const isSearchActive = Object.keys(searchFilters).length > 0;
  // Estados de filtros
  const [filters, setFilters] = useState({
    cantidadClases: "all",
    activo: "all",
    propietario: "all",
  });

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

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

  useEffect(() => {
    if (isDialogOpen) {
      setDni(editingAlumno?.dni ?? "");
      setValidacionHabilitada(!editingAlumno);
    }
  }, [isDialogOpen, editingAlumno]);

  const { data: caballos = [] } = useQuery({
    queryKey: ["caballos"],
    queryFn: caballosApi.listar,
  });

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

  // Filtrar datos - agregando validación de objetos válidos
  const filteredData = useMemo(() => {
    // Primero filtrar solo objetos válidos de Alumno
    const validAlumnos = alumnos.filter((alumno: unknown): alumno is Alumno => {
      return (
        typeof alumno === "object" &&
        alumno !== null &&
        "id" in alumno &&
        "nombre" in alumno
      );
    });

    return validAlumnos.filter((alumno: Alumno) => {
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
      closeEdit();
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
      closeEdit();
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
      closeDelete();
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
      cell: (row: Alumno) => {
        let caballoNombre = "";
        if (row.caballoPropio) {
          if (
            typeof row.caballoPropio === "object" &&
            "nombre" in row.caballoPropio
          ) {
            caballoNombre = row.caballoPropio.nombre;
          } else if (typeof row.caballoPropio === "number") {
            const caballo = caballos.find((c) => c.id === row.caballoPropio);
            if (caballo) caballoNombre = caballo.nombre;
          }
        }
        return (
          <>
            {row.nombre} {row.apellido}
            {caballoNombre && row.tipoPension === "CABALLO_PROPIO" && (
              <StatusBadge status="propio">
                <ChessKnight className="inline mr-1 w-4 h-4" />
                {caballoNombre}
              </StatusBadge>
            )}
            {caballoNombre && row.tipoPension === "RESERVA_ESCUELA" && (
              <StatusBadge status="escuela">
                <CalendarCheck className="inline mr-1 w-4 h-4" />
                {caballoNombre}
              </StatusBadge>
            )}
            {row.caballoPropio && row.tipoPension === "CABALLO_PROPIO" && (
              <StatusBadge status="propio">
                <House className="inline mr-1 w-4 h-4" />
                {row.cuotaPension}
              </StatusBadge>
            )}
          </>
        );
      },
    },
    /* {
      header: "DNI",
      cell: (row: Alumno) => <ProtectedData value={row.dni} />,
    },
    { header: "Teléfono", accessorKey: "telefono" as keyof Alumno },
    { header: "Email", accessorKey: "email" as keyof Alumno }, */
    {
      header: "Inscripción",
      cell: (row: Alumno) => {
        if (!row?.fechaInscripcion) return "-";
        const [year, month, day] = row.fechaInscripcion.split("-");
        return `${day}/${month}/${year}`;
      },
    },
    /*     {
      header: "Clases/Mes",
      cell: (row: Alumno) => (
        <span className="font-medium">{row.cantidadClases}</span>
      ),
    }, */
    {
      header: "Estado",
      cell: (row: Alumno) => (
        <StatusBadge status={row.activo ? "success" : "default"}>
          {row.activo ? "Activo" : "Inactivo"}
        </StatusBadge>
      ),
    },
    /* {
      header: "Pensión/Reserva",
      cell: (row: Alumno) => (
        <StatusBadge
          status={row.tipoPension === "SIN_CABALLO" ? "success" : "default"}
        >
          {row.tipoPension === "SIN_CABALLO"
            ? "—"
            : [
              row.tipoPension === "CABALLO_PROPIO" ? "Propio" : "Escuela",
              row.cuotaPension
                ? row.cuotaPension.charAt(0) +
                row.cuotaPension.slice(1).toLowerCase()
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
        </StatusBadge>
      ),
    }, */
    {
      header: `Clases (${mesActualNombre.charAt(0).toUpperCase() + mesActualNombre.slice(1)})`,
      cell: (row: Alumno) => {
        // Usar nombreParticipante para identificar al alumno
        const nombreCompleto = `${row.nombre} ${row.apellido}`;
        const clasesAlumnoMes = clases.filter(
          (c: {
            nombreParticipante?: string;
            esPrueba?: boolean;
            estado?: string;
            dia?: string;
          }) =>
            c.nombreParticipante === nombreCompleto &&
            !c.esPrueba &&
            ["COMPLETADA", "ASA"].includes(c.estado) &&
            new Date(c.dia).getMonth() + 1 === mesActual &&
            new Date(c.dia).getFullYear() === añoActual,
        );
        const restantes = row.cantidadClases - clasesAlumnoMes.length;
        return (
          <span>
            {restantes} / {row.cantidadClases}
          </span>
        );
      },
    },
    {
      header: "Acciones",
      cell: (row: Alumno) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Abrir menú de acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  encodeURI(
                    `https://wa.me/${row.telefono}?text=Hola ${row.nombre}, te contactamos desde la Escuela para avisarte que... `,
                  ),
                  "_blank",
                );
              }}
            >
              <MessageCircleMore className="mr-2 h-4 w-4 text-green-600" />
              Enviar WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `mailto:${row.email}?subject=${encodeURIComponent(`Contacto para ${row.nombre} ${row.apellido}`)}`;
              }}
            >
              <Mail className="mr-2 h-4 w-4 text-blue-600" />
              Enviar correo
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                openEdit(row);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                openDelete(row);
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
        title="Alumnos"
        description="Gestiona los alumnos inscriptos en la escuela"
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
                <Button className="h-11 shrink-0" onClick={() => openEdit()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Alumno
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
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

                <AlumnoForm
                  alumno={editingAlumno ?? undefined}
                  caballos={caballos}
                  onSubmit={(data) => {
                    if (editingAlumno) {
                      updateMutation.mutate({ id: editingAlumno.id, data });
                    } else {
                      createMutation.mutate(data);
                    }
                  }}
                  isPending={
                    createMutation.isPending || updateMutation.isPending
                  }
                  validacionDni={validacionActiva}
                  onDniChange={(dni) => {
                    setDni(dni);
                    setValidacionHabilitada(true);
                  }}
                  onCancel={closeEdit}
                />
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Leyenda de badges */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="mt-3">
          <StatusBadge status="propio">
            <ChessKnight className="inline mr-1 w-4 h-4" />
            Caballo Propio
          </StatusBadge>
          <StatusBadge status="propio">
            <House className="inline mr-1 w-4 h-4" />
            Cuota Pensión
          </StatusBadge>
          <StatusBadge status="escuela">
            <CalendarCheck className="inline mr-1 w-4 h-4" />
            Reserva Escuela
          </StatusBadge>
        </div>
      </div>

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
              <GenericCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {paginatedData.map((alumno) => (
              <GenericCard
                item={alumno}
                key={alumno.id}
                title={`${alumno.nombre} ${alumno.apellido}`}
                subtitle={
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(() => {
                      let caballoNombre = "";
                      if (alumno.caballoPropio) {
                        if (
                          typeof alumno.caballoPropio === "object" &&
                          "nombre" in alumno.caballoPropio
                        ) {
                          caballoNombre = alumno.caballoPropio.nombre;
                        } else if (typeof alumno.caballoPropio === "number") {
                          const caballo = caballos.find(
                            (c) => c.id === alumno.caballoPropio,
                          );
                          if (caballo) caballoNombre = caballo.nombre;
                        }
                      }
                      return (
                        <>
                          {caballoNombre &&
                            alumno.tipoPension === "CABALLO_PROPIO" && (
                              <StatusBadge status="propio">
                                <ChessKnight className="inline mr-1 w-4 h-4" />
                                {caballoNombre}
                              </StatusBadge>
                            )}
                          {caballoNombre &&
                            alumno.tipoPension === "RESERVA_ESCUELA" && (
                              <StatusBadge status="escuela">
                                <CalendarCheck className="inline mr-1 w-4 h-4" />
                                {caballoNombre}
                              </StatusBadge>
                            )}
                          {alumno.caballoPropio &&
                            alumno.tipoPension === "CABALLO_PROPIO" && (
                              <StatusBadge status="propio">
                                <House className="inline mr-1 w-4 h-4" />
                                {alumno.cuotaPension}
                              </StatusBadge>
                            )}
                        </>
                      );
                    })()}
                  </div>
                }
                // TODO subtitle="Descripción crear campo en db"
                fields={[
                  /* { label: "DNI", value: alumno.dni },
                  { label: "Teléfono", value: alumno.telefono },
                  { label: "Email", value: alumno.email || "-" }, */
                  {
                    label: "Inscripción",
                    value: alumno.fechaInscripcion || "-",
                  },
                  {
                    label: `Clases (${mesActualNombre.charAt(0).toUpperCase() + mesActualNombre.slice(1)})`,
                    value: (() => {
                      const nombreCompleto = `${alumno.nombre} ${alumno.apellido}`;
                      const clasesAlumnoMes = clases.filter(
                        (c: {
                          nombreParticipante?: string;
                          esPrueba?: boolean;
                          estado?: string;
                          dia?: string;
                        }) =>
                          c.nombreParticipante === nombreCompleto &&
                          !c.esPrueba &&
                          ["COMPLETADA", "ASA"].includes(c.estado) &&
                          new Date(c.dia).getMonth() + 1 === mesActual &&
                          new Date(c.dia).getFullYear() === añoActual,
                      );
                      const restantes =
                        alumno.cantidadClases - clasesAlumnoMes.length;
                      return `${restantes} / ${alumno.cantidadClases}`;
                    })(),
                  },
                  {
                    label: "Estado ",
                    value: alumno.activo,
                    type: "badge",
                    trueLabel: "Activo",
                    falseLabel: "Inactivo",
                  },

                  /* {
                    label: "Propietario ",
                    value: alumno.propietario,
                    type: "badge",
                    trueLabel: "Sí",
                    falseLabel: "No",
                  }, */
                ]}
                onClick={() => navigate(`/alumnos/${alumno.id}`)}
                onEdit={() => openEdit(alumno)}
                onDelete={() => openDelete(alumno)}
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
        <Dialog open={!!alumnoToDelete} onOpenChange={closeDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar alumno</DialogTitle>
              <DialogDescription>
                ¿Seguro que deseas eliminar a {alumnoToDelete?.nombre}{" "}
                {alumnoToDelete?.apellido}? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={closeDelete}>
                Cancelar
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  if (alumnoToDelete) {
                    deleteMutation.mutate(alumnoToDelete.id);
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
