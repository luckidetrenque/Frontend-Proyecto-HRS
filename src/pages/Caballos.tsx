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

import { GenericCard } from "@/components/cards/GenericCard";
import { GenericCardSkeleton } from "@/components/cards/GenericCardSkeleton";
import { CaballoForm } from "@/components/forms/CaballoForm";
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
import { Caballo, caballosApi } from "@/lib/api";
import { TipoCaballo } from "@/types/enums";

export default function CaballosPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    editingEntity: editingCaballo,
    entityToDelete: caballoToDelete,
    isDialogOpen,
    openEdit,
    closeEdit,
    openDelete,
    closeDelete,
  } = useEntityActions<Caballo>();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState({
    tipo: "all",
    disponible: "all",
    nombre: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["caballos", page, pageSize, filters],
    queryFn: () =>
      caballosApi.listar({
        page,
        size: pageSize,
        sort: "nombre,asc",
        tipo:
          filters.tipo !== "all" ? (filters.tipo as TipoCaballo) : undefined,
        disponible:
          filters.disponible !== "all"
            ? filters.disponible === "true"
            : undefined,
        nombre: filters.nombre || undefined,
      }),
  });

  const caballos = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalItems = data?.totalElements ?? 0;

  const filterConfig = [
    {
      name: "tipo",
      label: "Tipo",
      type: "select" as const,
      options: [
        { label: "Escuela", value: "ESCUELA" },
        { label: "Privado", value: "PRIVADO" },
      ],
    },
    {
      name: "disponible",
      label: "Disponibilidad",
      type: "select" as const,
      options: [
        { label: "Disponible", value: "true" },
        { label: "No Disponible", value: "false" },
      ],
    },
  ];

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters({ tipo: "all", disponible: "all", nombre: "" });
    setPage(0);
  };

  const createMutation = useMutation({
    mutationFn: caballosApi.crear,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["caballos"] });
      closeEdit();
      const successMsg =
        data.__successMessage || "Caballo creado correctamente";
      toast.success(successMsg);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al crear el caballo"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Caballo> }) =>
      caballosApi.actualizar(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["caballos"] });
      closeEdit();
      const successMsg =
        data.__successMessage || "Caballo actualizado correctamente";
      toast.success(successMsg);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al actualizar el caballo"),
  });

  const deleteMutation = useMutation({
    mutationFn: caballosApi.eliminar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["caballos"] });
      closeDelete();
      const successMsg =
        data.__successMessage || "Caballo eliminado correctamente";
      toast.success(successMsg);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al eliminar el caballo"),
  });

  const columns = [
    { header: "Nombre", accessorKey: "nombre" as keyof Caballo },
    {
      header: "Tipo",
      cell: (row: Caballo) => (
        <StatusBadge status={row.tipo === "ESCUELA" ? "info" : "warning"}>
          {row.tipo === "ESCUELA" ? "Escuela" : "Privado"}
        </StatusBadge>
      ),
    },
    {
      header: "Disponibilidad",
      cell: (row: Caballo) => (
        <StatusBadge status={row.disponible ? "success" : "default"}>
          {row.disponible ? "Disponible" : "No Disponible"}
        </StatusBadge>
      ),
    },
    {
      header: "Acciones",
      cell: (row: Caballo) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Abrir menú de acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
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
        title="Caballos"
        description="Control de caballos de la escuela y privados"
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
                  Nuevo Caballo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCaballo ? "Editar Caballo" : "Nuevo Caballo"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCaballo
                      ? "Modifica los datos del caballo"
                      : "Completa los datos"}
                  </DialogDescription>
                </DialogHeader>

                <CaballoForm
                  caballo={editingCaballo ?? undefined}
                  onSubmit={(data) => {
                    if (editingCaballo) {
                      updateMutation.mutate({ id: editingCaballo.id, data });
                    } else {
                      createMutation.mutate(data as Omit<Caballo, "id">);
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
            data={caballos}
            isLoading={isLoading}
            emptyMessage="No hay caballos que coincidan con los filtros"
            onRowClick={(caballo) => navigate(`/caballos/${caballo.id}`)}
          />
        ) : isLoading ? (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {Array.from({ length: pageSize }).map((_, i) => (
              <GenericCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {caballos.map((caballo) => (
              <GenericCard
                item={caballo}
                key={caballo.id}
                title={caballo.nombre}
                subtitle=""
                fields={[
                  { label: "Nombre", value: caballo.nombre },
                  { label: "Tipo", value: caballo.tipo },
                  {
                    label: "Estado ",
                    value: caballo.disponible,
                    type: "badge",
                    trueLabel: "Disponible",
                    falseLabel: "No disponible",
                  },
                ]}
                onClick={() => navigate(`/caballos/${caballo.id}`)}
                onEdit={() => openEdit(caballo)}
                onDelete={() => openDelete(caballo)}
                onSendWhatsApp={() => {}}
                onSendEmail={() => {}}
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

        <Dialog open={!!caballoToDelete} onOpenChange={closeDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar caballo</DialogTitle>
              <DialogDescription>
                ¿Seguro que deseas eliminar a {caballoToDelete?.nombre}? Esta
                acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={closeDelete}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (caballoToDelete) {
                    deleteMutation.mutate(caballoToDelete.id);
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
