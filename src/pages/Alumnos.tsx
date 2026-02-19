import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { te } from "date-fns/locale";
import {
  Mail,
  MessageCircleMore,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { GenericCard } from "@/components/cards/GenericCard";
import { GenericCardSkeleton } from "@/components/cards/GenericCardSkeleton";
import { CommonTooltips, HelpTooltip } from "@/components/HelpTooltip";
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
import { ProtectedData } from "@/components/ui/protected-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { useValidarDniDuplicado } from "@/hooks/useValidarDniDuplicado";
import {
  Alumno,
  alumnosApi,
  AlumnoSearchFilters,
  Caballo,
  caballosApi,
} from "@/lib/api";
import { CuotaPension, TipoPension } from "@/types/enums";

export default function AlumnosPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);
  const [alumnoToDelete, setAlumnoToDelete] = useState<Alumno | null>(null);
  const [validacionHabilitada, setValidacionHabilitada] = useState(false);

  const [propietarioSeleccionado, setPropietarioSeleccionado] = useState(false);

  const [nombre, setNombre] = useState<Alumno["nombre"]>("");
  const [apellido, setApellido] = useState<Alumno["apellido"]>("");
  const [dni, setDni] = useState<Alumno["dni"]>("");
  const [fechaNacimiento, setFechaNacimiento] =
    useState<Alumno["fechaNacimiento"]>("");
  const [telefono, setTelefono] = useState<Alumno["telefono"]>("");
  const [email, setEmail] = useState<Alumno["email"]>("");
  const [fechaInscripcion, setFechaInscripcion] =
    useState<Alumno["fechaInscripcion"]>("");
  const [activo, setActivo] = useState<Alumno["activo"]>(true);
  const [cantidadClases, setCantidadClases] =
    useState<Alumno["cantidadClases"]>(4);
  const [tipoPension, setTipoPension] =
    useState<Alumno["tipoPension"]>("SIN_CABALLO");
  const [cuotaPension, setCuotaPension] =
    useState<Alumno["cuotaPension"]>("ENTERA");
  const [caballoId, setCaballoId] = useState<string | null>(null);

  const getCaballoId = (alumno?: Alumno): string => {
    if (!alumno?.caballoPropio) return "";

    return typeof alumno.caballoPropio === "number"
      ? String(alumno.caballoPropio)
      : String(alumno.caballoPropio.id);
  };

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

  const navigate = useNavigate();

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
    if (isOpen) {
      setNombre(editingAlumno?.nombre ?? "");
      setApellido(editingAlumno?.apellido ?? "");
      setDni(editingAlumno?.dni ?? "");
      setTelefono(editingAlumno?.telefono ?? "");
      setEmail(editingAlumno?.email ?? "");
      setFechaNacimiento(editingAlumno?.fechaNacimiento ?? "");
      setFechaInscripcion(
        editingAlumno?.fechaInscripcion ?? format(new Date(), "yyyy-MM-dd"),
      );
      setCantidadClases(editingAlumno?.cantidadClases ?? 4);
      setActivo(editingAlumno?.activo ?? true);
      setTipoPension(editingAlumno?.tipoPension ?? "SIN_CABALLO");
      setCuotaPension(editingAlumno?.cuotaPension ?? "ENTERA");
      setPropietarioSeleccionado(editingAlumno?.propietario ?? false);
      setCaballoId(getCaballoId(editingAlumno ?? undefined));
      setValidacionHabilitada(!editingAlumno); // true en creación, false en edición
    }
  }, [isOpen, editingAlumno]);

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
        "nombre" in alumno &&
        alumno.id !== 1 // ⛔ Excluir alumno con id 1
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
    {
      header: "DNI",
      cell: (row: Alumno) => <ProtectedData value={row.dni} />,
    },
    { header: "Teléfono", accessorKey: "telefono" as keyof Alumno },
    { header: "Email", accessorKey: "email" as keyof Alumno },
    {
      header: "Inscripción",
      cell: (row: Alumno) => {
        if (!row?.fechaInscripcion) return "-";
        const [year, month, day] = row.fechaInscripcion.split("-");
        return `${day}/${month}/${year}`;
      },
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
                setEditingAlumno(row);
                setIsOpen(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setAlumnoToDelete(row);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validacionActiva?.duplicado) {
      toast.error("No se puede guardar: Ya existe un alumno con este DNI");
      return;
    }

    // Normalizar teléfono
    let telefonoNormalizado = telefono;

    if (telefonoNormalizado && !telefonoNormalizado.startsWith("+549")) {
      telefonoNormalizado = `+549${telefonoNormalizado.replace(/^\+/, "")}`;
    }

    const propietario = tipoPension === "CABALLO_PROPIO";

    const data: Omit<Alumno, "id"> = {
      dni,
      nombre,
      apellido,
      fechaNacimiento,
      telefono: telefonoNormalizado,
      email,
      fechaInscripcion,
      cantidadClases,
      propietario,
      activo,
      tipoPension,
      cuotaPension: tipoPension === "SIN_CABALLO" ? null : cuotaPension,
      caballoPropio:
        tipoPension === "SIN_CABALLO" || !caballoId
          ? undefined
          : Number(caballoId),
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
                          type="text"
                          autoComplete="given-name"
                          placeholder="Nombre/s del alumno"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellido">Apellido</Label>
                        <Input
                          id="apellido"
                          type="text"
                          autoComplete="family-name"
                          placeholder="Apellido del alumno"
                          value={apellido}
                          onChange={(e) => setApellido(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dni">
                          DNI
                          <HelpTooltip content={CommonTooltips.alumno.dni} />
                        </Label>
                        <Input
                          id="dni"
                          name="dni"
                          autoComplete="off"
                          type="text"
                          value={dni}
                          onChange={(e) => {
                            setDni(e.target.value);
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
                          Fecha de nacimiento
                        </Label>
                        <Input
                          id="fechaNacimiento"
                          type="date"
                          value={fechaNacimiento}
                          onChange={(e) => setFechaNacimiento(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                          id="telefono"
                          type="tel"
                          autoComplete="tel"
                          placeholder="Teléfono de contacto"
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          autoComplete="email"
                          placeholder="Correo electrónico"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fechaInscripcion">
                          Fecha de Inscripcion
                          <HelpTooltip
                            content={CommonTooltips.alumno.fechaInscripcion}
                          />
                        </Label>
                        <Input
                          id="fechaInscripcion"
                          type="date"
                          value={fechaInscripcion}
                          onChange={(e) => setFechaInscripcion(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cantidadClases">
                          Cantidad de clases
                        </Label>

                        <Select
                          value={String(cantidadClases)}
                          onValueChange={(value) =>
                            setCantidadClases(Number(value))
                          }
                        >
                          <SelectTrigger id="cantidadClases">
                            <SelectValue placeholder="Seleccionar cantidad" />
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
                    {/* Pensión */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipoPension">Pensión</Label>
                        <Select
                          value={tipoPension}
                          onValueChange={(v) => {
                            const nuevo = v as Alumno["tipoPension"];
                            setTipoPension(nuevo);
                            if (nuevo === "SIN_CABALLO") {
                              setCuotaPension("ENTERA"); // o el valor default que corresponda
                              setCaballoId(""); // limpiar caballo también
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SIN_CABALLO">
                              Sin caballo asignado
                            </SelectItem>
                            <SelectItem value="RESERVA_ESCUELA">
                              Reserva caballo de escuela
                            </SelectItem>
                            <SelectItem value="CABALLO_PROPIO">
                              Caballo propio
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Activo: solo visible al editar */}
                      {editingAlumno && (
                        <div className="flex items-center gap-3 pt-6">
                          <Switch
                            id="activo"
                            checked={activo}
                            onCheckedChange={setActivo}
                          />
                          <Label htmlFor="activo">Está activo</Label>
                        </div>
                      )}
                    </div>
                    {/* Cuota y Caballo: solo si tiene caballo */}
                    {tipoPension !== "SIN_CABALLO" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cuotaPension">Cuota de pensión</Label>
                          <Select
                            value={cuotaPension}
                            onValueChange={(value) =>
                              setCuotaPension(value as CuotaPension)
                            }
                          >
                            <SelectTrigger id="cuotaPension">
                              <SelectValue placeholder="Seleccionar cuota" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ENTERA">Entera</SelectItem>
                              <SelectItem value="MEDIA">Media</SelectItem>
                              <SelectItem value="TERCIO">Tercio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="caballo">Caballo</Label>
                          <Select
                            value={caballoId}
                            onValueChange={(value) => setCaballoId(value)}
                          >
                            <SelectTrigger id="caballo">
                              <SelectValue placeholder="Seleccionar caballo" />
                            </SelectTrigger>
                            <SelectContent>
                              {caballos.map((caballo) => (
                                <SelectItem
                                  key={caballo.id}
                                  value={String(caballo.id)}
                                >
                                  {caballo.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
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
                subtitle=""
                // TODO subtitle="Descripción crear campo en db"
                fields={[
                  { label: "DNI", value: alumno.dni },
                  { label: "Teléfono", value: alumno.telefono },
                  { label: "Email", value: alumno.email || "-" },
                  {
                    label: "Clases / Mes",
                    value: alumno.cantidadClases || "-",
                  },
                  {
                    label: "Estado ",
                    value: alumno.activo,
                    type: "badge",
                    trueLabel: "Activo",
                    falseLabel: "Inactivo",
                  },

                  {
                    label: "Propietario ",
                    value: alumno.propietario,
                    type: "badge",
                    trueLabel: "Sí",
                    falseLabel: "No",
                  },
                ]}
                onClick={() => navigate(`/alumnos/${alumno.id}`)}
                onEdit={() => {
                  setEditingAlumno(alumno);
                  setIsOpen(true);
                }}
                onDelete={() => setAlumnoToDelete(alumno)}
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
        <Dialog
          open={!!alumnoToDelete}
          onOpenChange={() => setAlumnoToDelete(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar alumno</DialogTitle>
              <DialogDescription>
                ¿Seguro que deseas eliminar a {alumnoToDelete?.nombre}?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAlumnoToDelete(null)}>
                Cancelar
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  if (alumnoToDelete) {
                    deleteMutation.mutate(alumnoToDelete.id);
                    setAlumnoToDelete(null);
                  }
                }}
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
