import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
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
import { useEffect, useState } from "react";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { useEntityActions } from "@/hooks/useEntityActions";
import { useValidarDniDuplicado } from "@/hooks/useValidarDniDuplicado";
import { Alumno, alumnosApi, caballosApi, clasesApi } from "@/lib/api";

export default function AlumnosPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const validacionActiva =
    validacionHabilitada && dni.length >= 9
      ? validacionDni
      : { duplicado: false, mensaje: "" };

  const mesActual = new Date().getMonth() + 1;
  const añoActual = new Date().getFullYear();
  const mesActualNombre = new Date().toLocaleString("es-ES", { month: "long" });

  const { data: clasesMesData } = useQuery({
    queryKey: ["clases-mes", mesActual, añoActual],
    queryFn: () => clasesApi.listar({ page: 0, size: 500, sort: "dia,desc" }),
  });
  const clases = clasesMesData?.content ?? [];

  const [filters, setFilters] = useState({
    nombre: "",
    apellido: "",
    cantidadClases: "all",
    activo: "all",
    propietario: "all",
  });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    if (isDialogOpen) {
      setDni(editingAlumno?.dni ?? "");
      setValidacionHabilitada(!editingAlumno);
    }
  }, [isDialogOpen, editingAlumno]);

  const { data: caballosData } = useQuery({
    queryKey: ["caballos-select"],
    queryFn: () =>
      caballosApi.listar({ page: 0, size: 100, sort: "nombre,asc" }),
  });
  const caballos = caballosData?.content ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ["alumnos", page, pageSize, filters],
    queryFn: () =>
      alumnosApi.listar({
        page,
        size: pageSize,
        sort: "apellido,asc",
        nombre: filters.nombre || undefined,
        apellido: filters.apellido || undefined,
        activo:
          filters.activo !== "all" ? filters.activo === "true" : undefined,
        propietario:
          filters.propietario !== "all"
            ? filters.propietario === "true"
            : undefined,
        cantidadClases:
          filters.cantidadClases !== "all"
            ? Number(filters.cantidadClases)
            : undefined,
      }),
  });

  const alumnos = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalItems = data?.totalElements ?? 0;

  const filterConfig = [
    {
      name: "nombre",
      label: "Nombre",
      type: "text" as const,
      placeholder: "Buscar por nombre...",
    },
    {
      name: "apellido",
      label: "Apellido",
      type: "text" as const,
      placeholder: "Buscar por apellido...",
    },
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
    // Para campos de texto no reseteamos la página en cada keystroke,
    // el backend filtra en tiempo real igual. Para selects sí.
    if (name !== "nombre" && name !== "apellido") {
      setPage(0);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      nombre: "",
      apellido: "",
      cantidadClases: "all",
      activo: "all",
      propietario: "all",
    });
    setPage(0);
  };

  const columns = [
    {
      header: "Nombre y Apellido",
      cell: (row: Alumno) => {
        const caballoNombre =
          row.caballoNombre ||
          (row.caballoId
            ? caballos.find((c) => c.id === row.caballoId)?.nombre || ""
            : "");
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
                <ChessKnight className="inline mr-1 w-4 h-4" />
                {caballoNombre}
              </StatusBadge>
            )}
            {caballoNombre && row.tipoPension === "CABALLO_PROPIO" && (
              <StatusBadge status="propio">
                <House className="inline mr-1 w-4 h-4" />
                {row.cuotaPension}
              </StatusBadge>
            )}
          </>
        );
      },
    },
    {
      header: "Inscripción",
      cell: (row: Alumno) => {
        if (!row?.fechaInscripcion) return "-";
        const [year, month, day] = row.fechaInscripcion.split("-");
        return `${day}/${month}/${year}`;
      },
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
      header: `Clases (${mesActualNombre.charAt(0).toUpperCase() + mesActualNombre.slice(1)})`,
      cell: (row: Alumno) => {
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
          <span className={restantes === 0 ? "text-red-500 font-bold" : ""}>
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
                    `https://wa.me/${row.codigoArea}${row.telefono}?text=Hola ${row.nombre}, te contactamos desde la Escuela para avisarte que... `,
                  ),
                  "_blank",
                );
              }}
            >
              <MessageCircleMore className="mr-2 h-4 w-4 text-green-600" />
              Enviar WhatsApp
            </DropdownMenuItem>
            {row.email && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `mailto:${row.email}?subject=${encodeURIComponent(`Contacto para ${row.nombre} ${row.apellido}`)}`;
                }}
              >
                <Mail className="mr-2 h-4 w-4 text-blue-600" />
                Enviar correo
              </DropdownMenuItem>
            )}
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
            <ChessKnight className="inline mr-1 w-4 h-4" />
            Reserva Escuela
          </StatusBadge>
        </div>
      </div>

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
            data={alumnos}
            isLoading={isLoading}
            emptyMessage="No hay alumnos que coincidan con los filtros"
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
            {alumnos.map((alumno) => (
              <GenericCard
                item={alumno}
                key={alumno.id}
                title={`${alumno.nombre} ${alumno.apellido}`}
                subtitle={
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(() => {
                      const caballoNombre =
                        alumno.caballoNombre ||
                        (alumno.caballoId
                          ? caballos.find((c) => c.id === alumno.caballoId)
                              ?.nombre || ""
                          : "");
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
                                <ChessKnight className="inline mr-1 w-4 h-4" />
                                {caballoNombre}
                              </StatusBadge>
                            )}
                          {caballoNombre &&
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
                fields={[
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
                ]}
                onClick={() => navigate(`/alumnos/${alumno.id}`)}
                onEdit={() => openEdit(alumno)}
                onDelete={() => openDelete(alumno)}
                onSendWhatsApp={(item) => {
                  const alumno = item as Alumno;
                  window.open(
                    encodeURI(
                      `https://wa.me/${alumno.codigoArea}${alumno.telefono}?text=Hola ${alumno.nombre}, te contactamos desde la Escuela para avisarte que... `,
                    ),
                    "_blank",
                  );
                }}
                onSendEmail={(item) => {
                  const alumno = item as Alumno;
                  if (alumno.email) {
                    window.location.href = `mailto:${alumno.email}?subject=${encodeURIComponent(`Contacto para ${alumno.nombre} ${alumno.apellido}`)}`;
                  }
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
