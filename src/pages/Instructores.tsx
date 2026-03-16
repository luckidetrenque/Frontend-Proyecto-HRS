import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
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
import { InstructorForm } from "@/components/forms/InstructorForm";
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
import { Instructor, instructoresApi } from "@/lib/api";

export default function InstructoresPage() {
  const queryClient = useQueryClient();
  const {
    editingEntity: editingInstructor,
    entityToDelete: instructorToDelete,
    isDialogOpen,
    openEdit,
    closeEdit,
    openDelete,
    closeDelete,
  } = useEntityActions<Instructor>();

  const [dni, setDni] = useState("");
  const [validacionHabilitada, setValidacionHabilitada] = useState(false);
  const { data: validacionDni } = useValidarDniDuplicado(
    "instructores",
    dni,
    editingInstructor?.id,
  );

  const validacionActiva =
    validacionHabilitada && dni.length >= 9
      ? validacionDni
      : { duplicado: false, mensaje: "" };

  const navigate = useNavigate();

  const [filters, setFilters] = useState({ activo: "all" });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    if (isDialogOpen) {
      setDni(editingInstructor?.dni ?? "");
      setValidacionHabilitada(!editingInstructor);
    }
  }, [isDialogOpen, editingInstructor]);

  const { data, isLoading } = useQuery({
    queryKey: ["instructores", page, pageSize, filters],
    queryFn: () =>
      instructoresApi.listar({
        page,
        size: pageSize,
        sort: "apellido,asc",
        activo:
          filters.activo !== "all" ? filters.activo === "true" : undefined,
      }),
  });

  const instructores = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalItems = data?.totalElements ?? 0;

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
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters({ activo: "all" });
    setPage(0);
  };

  const createMutation = useMutation({
    mutationFn: instructoresApi.crear,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["instructores"] });
      closeEdit();
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
      queryClient.invalidateQueries({ queryKey: ["instructores"] });
      closeEdit();
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
      queryClient.invalidateQueries({ queryKey: ["instructores"] });
      closeDelete();
      const successMsg =
        data.__successMessage || "Instructor eliminado correctamente";
      toast.success(successMsg);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al eliminar el instructor"),
  });

  const columns = [
    {
      header: "Nombre y Apellido",
      cell: (row: Instructor) => `${row.nombre} ${row.apellido}`,
    },
    { header: "DNI", accessorKey: "dni" as keyof Instructor },
    {
      header: "Teléfono",
      cell: (row: Instructor) =>
        `(${row.codigoArea.replace("+549", "")}) ${row.telefono.slice(0, row.telefono.length - 4)}-${row.telefono.slice(-4)}`,
    },
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
        title="Instructores"
        description="Administra el equipo de instructores de la escuela"
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
                  Nuevo Instructor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
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

                <InstructorForm
                  instructor={editingInstructor ?? undefined}
                  onSubmit={(data) => {
                    const payload: Omit<Instructor, "id"> = {
                      nombre: data.nombre,
                      apellido: data.apellido,
                      dni: data.dni,
                      fechaNacimiento: data.fechaNacimiento,
                      codigoArea: data.codigoArea,
                      telefono: data.telefono,
                      email: data.email,
                      activo: data.activo,
                      color: data.color,
                    };
                    if (editingInstructor) {
                      updateMutation.mutate({
                        id: editingInstructor.id,
                        data: payload,
                      });
                    } else {
                      createMutation.mutate(payload);
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
            data={instructores}
            isLoading={isLoading}
            emptyMessage="No hay instructores que coincidan con los filtros"
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
            {instructores.map((instructor) => (
              <GenericCard
                item={instructor}
                key={instructor.id}
                title={`${instructor.nombre} ${instructor.apellido}`}
                subtitle=""
                fields={[
                  { label: "DNI", value: instructor.dni },
                  {
                    label: "Teléfono",
                    value: `(${instructor.codigoArea.replace("+549", "")}) ${instructor.telefono.slice(0, instructor.telefono.length - 4)}-${instructor.telefono.slice(-4)}`,
                  },
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
                onEdit={() => openEdit(instructor)}
                onDelete={() => openDelete(instructor)}
                onSendWhatsApp={(item) => {
                  const instructor = item as Instructor;
                  window.open(
                    encodeURI(
                      `https://wa.me/${instructor.codigoArea}${instructor.telefono}?text=Hola ${instructor.nombre}, te contactamos desde la Escuela para avisarte que... `,
                    ),
                    "_blank",
                  );
                }}
                onSendEmail={(item) => {
                  const instructor = item as Instructor;
                  if (instructor.email) {
                    window.location.href = `mailto:${instructor.email}?subject=${encodeURIComponent(`Contacto para ${instructor.nombre} ${instructor.apellido}`)}`;
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

        <Dialog open={!!instructorToDelete} onOpenChange={closeDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar instructor</DialogTitle>
              <DialogDescription>
                ¿Seguro que deseas eliminar a {instructorToDelete?.nombre}{" "}
                {instructorToDelete?.apellido}? Esta acción no se puede
                deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={closeDelete}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (instructorToDelete) {
                    deleteMutation.mutate(instructorToDelete.id);
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
