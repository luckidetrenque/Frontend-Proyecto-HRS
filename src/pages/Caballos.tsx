import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Caballo, caballosApi, CaballoSearchFilters } from "@/lib/api";

export default function CaballosPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCaballo, setEditingCaballo] = useState<Caballo | null>(null);

  const [nombre, setNombre] = useState<Caballo["nombre"]>(
    editingCaballo?.nombre ?? "",
  );

  const [tipo, setTipo] = useState<Caballo["tipo"]>(
    editingCaballo?.tipo ?? "ESCUELA",
  );

  const [disponible, setDisponible] = useState<Caballo["disponible"]>(
    editingCaballo?.disponible ?? true,
  );

  const [caballoToDelete, setCaballoToDelete] = useState<Caballo | null>(null);

  const navigate = useNavigate();

  // 🔍 ESTADO PARA BÚSQUEDA INTELIGENTE
  const [searchFilters, setSearchFilters] = useState<CaballoSearchFilters>({});
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Estados de filtros
  const [filters, setFilters] = useState({
    tipo: "all",
    disponible: "all",
  });

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 🔍 HANDLER PARA BÚSQUEDA INTELIGENTE
  const handleSmartSearch = (filters: Record<string, unknown>) => {
    const typedFilters: CaballoSearchFilters = {};

    if (filters.nombre) typedFilters.nombre = String(filters.nombre);
    if (filters.tipo)
      typedFilters.tipo = String(filters.tipo) as "ESCUELA" | "PRIVADO";
    if (filters.disponible !== undefined)
      typedFilters.disponible = Boolean(filters.disponible);

    setSearchFilters(typedFilters);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (isOpen) {
      // Si hay entidad, cargar sus datos; si no, limpiar
      setNombre(editingCaballo?.nombre ?? "");
      setTipo(editingCaballo?.tipo ?? "ESCUELA");
      setDisponible(editingCaballo?.disponible ?? true);
    }
  }, [isOpen, editingCaballo]);

  // ✅ NUEVO: Escuchar evento de búsqueda global desde el Layout
  useEffect(() => {
    const handleGlobalSearchEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { filters, entityType } = customEvent.detail;

      if (entityType === "caballos") {
        handleSmartSearch(filters);
      }
    };

    window.addEventListener("globalSearch", handleGlobalSearchEvent);

    return () => {
      window.removeEventListener("globalSearch", handleGlobalSearchEvent);
    };
  }, []);

  // 🔍 QUERY PARA BÚSQUEDA INTELIGENTE
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["caballos-search", searchFilters],
    queryFn: () => {
      if (Object.keys(searchFilters).length > 0) {
        setIsSearchActive(true);
        return caballosApi.buscar(searchFilters);
      }
      setIsSearchActive(false);
      return caballosApi.listar();
    },
    enabled: true,
  });

  const { data: allCaballos = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ["caballos"],
    queryFn: caballosApi.listar,
    enabled: !isSearchActive,
  });

  const caballos = searchResults || allCaballos;
  const isLoading = isSearching || isLoadingAll;

  // Filtrar datos
  const filteredData = useMemo(() => {
    return caballos.filter((caballo: Caballo) => {
      if (filters.tipo !== "all" && caballo.tipo !== filters.tipo) {
        return false;
      }
      if (
        filters.disponible !== "all" &&
        String(caballo.disponible) !== filters.disponible
      ) {
        return false;
      }
      return true;
    });
  }, [caballos, filters]);

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
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      tipo: "all",
      disponible: "all",
    });
    setSearchFilters({});
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const createMutation = useMutation({
    mutationFn: caballosApi.crear,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["caballos-search"] });
      setIsOpen(false);
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
      queryClient.invalidateQueries({ queryKey: ["caballos-search"] });
      setIsOpen(false);
      setEditingCaballo(null);
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
      queryClient.invalidateQueries({ queryKey: ["caballos-search"] });
      const successMsg =
        data.__successMessage || "Caballo eliminado correctamente";
      toast.success(successMsg);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al eliminar el caballo"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ! DONDE VAN?
    // 1️⃣ Validación básica
    if (!nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    // 2️⃣ Validación de duplicado
    const nombreDuplicado = caballos.some(
      (c) =>
        c.nombre.toLowerCase().trim() === nombre.toLowerCase().trim() &&
        c.id !== editingCaballo?.id,
    );

    if (nombreDuplicado) {
      toast.error("Ya existe un caballo con ese nombre");
      return;
    }
    // !

    // 3️⃣ Construcción del objeto
    const data: Omit<Caballo, "id"> = {
      nombre: nombre.trim(),
      tipo,
      disponible,
    };

    // 4️⃣ Create o Update
    if (editingCaballo) {
      updateMutation.mutate({ id: editingCaballo.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

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
                setEditingCaballo(row);
                setIsOpen(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("¿Eliminar este caballo?")) {
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
        title="Caballos"
        description="Control de caballos de la escuela y privados"
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
                if (!open) setEditingCaballo(null);
              }}
            >
              <DialogTrigger asChild>
                <Button>
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
                      createMutation.mutate(data);
                    }
                  }}
                  isPending={
                    createMutation.isPending || updateMutation.isPending
                  }
                  onCancel={() => setIsOpen(false)}
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
                ? "No se encontraron caballos con esos criterios de búsqueda"
                : "No hay caballos que coincidan con los filtros"
            }
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
            {paginatedData.map((caballo) => (
              <GenericCard
                item={caballo}
                key={caballo.id}
                title={caballo.nombre}
                subtitle=""
                // TODO subtitle="Descripción crear campo en db"
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
                onEdit={() => {
                  setEditingCaballo(caballo);
                  setIsOpen(true);
                }}
                onDelete={() => setCaballoToDelete(caballo)}
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
