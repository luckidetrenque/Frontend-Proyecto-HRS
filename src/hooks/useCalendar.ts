/**
 * useCalendar.ts
 * Hook personalizado que maneja toda la lógica del calendario
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ViewMode } from "@/components/calendar/clases.constants";
import {
  Alumno,
  alumnosApi,
  Caballo,
  caballosApi,
  Clase,
  clasesApi,
  Instructor,
  instructoresApi,
  personasPruebaApi,
} from "@/lib/api";
import { exportToExcel } from "@/utils/exportToExcel";

export function useCalendar() {
  const queryClient = useQueryClient();

  // Estados del calendario
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");

  // Estados del diálogo crear/editar
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [claseToEdit, setClaseToEdit] = useState<Clase | null>(null);
  const [prefilledCaballoId, setPrefilledCaballoId] = useState<number | null>(
    null,
  );
  const [prefilledHora, setPrefilledHora] = useState<string | null>(null);

  // Estados de otros diálogos
  const [isCopyOpen, setIsCopyOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Estados de filtros
  const [filters, setFilters] = useState({
    alumnoId: "all",
    instructorId: "all",
  });

  // Queries
  const { data: clases = [], isLoading } = useQuery({
    queryKey: ["clases"],
    queryFn: clasesApi.listarDetalladas,
  });

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

  const { data: personasPrueba = [] } = useQuery({
    queryKey: ["personas-prueba"],
    queryFn: personasPruebaApi.listar,
  });

  // Clases filtradas
  const filteredClases = useMemo(() => {
    return clases.filter((clase: Clase) => {
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
      return true;
    });
  }, [clases, filters]);

  // Generar días para el calendario
  const calendarDays = useMemo(() => {
    if (viewMode === "month") {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
  }, [currentDate, viewMode]);

  // Agrupar clases por fecha
  const clasesByDate = useMemo(() => {
    const grouped: Record<string, Clase[]> = {};
    filteredClases.forEach((clase: Clase) => {
      const dateKey = clase.dia;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(clase);
    });
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.hora.localeCompare(b.hora));
    });
    return grouped;
  }, [filteredClases]);

  const conflictSet = useMemo(() => {
    const set = new Set<string>();

    clases.forEach((clase) => {
      const key = `${clase.dia}|${clase.hora.slice(0, 5)}|${clase.caballoId}`;
      set.add(key);
    });

    return set;
  }, [clases]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: clasesApi.crear,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clases"] });
      setIsDialogOpen(false);
      setClaseToEdit(null);
      setPrefilledCaballoId(null);
      setPrefilledHora(null);
      toast.success(data.__successMessage || "Clase creada correctamente");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al crear la clase"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Clase> }) =>
      clasesApi.actualizar(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clases"] });
      setClaseToEdit(null);
      setIsDialogOpen(false);
      toast.success(data.__successMessage || "Clase actualizada correctamente");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al actualizar la clase"),
  });

  const deleteMutation = useMutation({
    mutationFn: clasesApi.eliminar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clases"] });
      toast.success(data.__successMessage || "Clase eliminada correctamente");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al eliminar la clase"),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      estado,
      observaciones,
    }: {
      id: number;
      estado: Clase["estado"];
      observaciones: string;
    }) => clasesApi.cambiarEstado(id, estado, observaciones),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clases"] });
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al cambiar el estado"),
  });

  const copyWeekMutation = useMutation({
    mutationFn: (datos: {
      diaInicioOrigen: string;
      diaInicioDestino: string;
      cantidadSemanas: number;
    }) => clasesApi.copiarClases(datos),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clases"] });
      setIsCopyOpen(false);
      toast.success(data.__successMessage || "Semana copiada correctamente");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al copiar la semana"),
  });

  const deleteWeekMutation = useMutation({
    mutationFn: (datos: {
      diaInicioOrigen: string;
      diaInicioDestino: string;
    }) => clasesApi.eliminarClases(datos),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clases"] });
      setIsDeleteOpen(false);
      toast.success(data.__successMessage || "Clases eliminadas correctamente");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al eliminar clases"),
  });

  const bulkCancelMutation = useMutation({
    mutationFn: async ({
      claseIds,
      observaciones,
    }: {
      claseIds: number[];
      observaciones: string;
    }) => {
      await Promise.all(
        claseIds.map((id) =>
          clasesApi.actualizar(id, { estado: "CANCELADA", observaciones }),
        ),
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clases"] });
      toast.success(
        `${variables.claseIds.length} clases canceladas correctamente`,
      );
    },
    onError: (error: Error) =>
      toast.error(error.message || "Error al cancelar las clases"),
  });

  // Navegación
  const navigate = (direction: "prev" | "next") => {
    if (viewMode === "month") {
      setCurrentDate(
        direction === "prev"
          ? subMonths(currentDate, 1)
          : addMonths(currentDate, 1),
      );
    } else if (viewMode === "week") {
      setCurrentDate(
        direction === "prev"
          ? subWeeks(currentDate, 1)
          : addWeeks(currentDate, 1),
      );
    } else {
      setCurrentDate(
        direction === "prev"
          ? subDays(currentDate, 1)
          : addDays(currentDate, 1),
      );
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // Handlers de diálogos
  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setClaseToEdit(null);
    setPrefilledCaballoId(null);
    setPrefilledHora(null);
    setIsDialogOpen(true);
  };

  const handleCellClick = (caballo: Caballo, hora: string) => {
    setClaseToEdit(null);
    setPrefilledCaballoId(caballo.id);
    setPrefilledHora(hora);
    setIsDialogOpen(true);
  };

  const handleEditClase = (clase: Clase) => {
    setClaseToEdit(clase);
    setPrefilledCaballoId(null);
    setPrefilledHora(null);
    setIsDialogOpen(true);
  };

  const handleDeleteClase = (claseId: number) => {
    deleteMutation.mutate(claseId);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setClaseToEdit(null);
    setPrefilledCaballoId(null);
    setPrefilledHora(null);
  };

  const handleStatusChange = (
    claseId: number,
    newStatus: Clase["estado"],
    observaciones: string,
  ) => {
    statusMutation.mutate({ id: claseId, estado: newStatus, observaciones });
  };

  const handleBulkCancel = (claseIds: number[], observaciones: string) => {
    bulkCancelMutation.mutate({ claseIds, observaciones });
  };

  const handleCopySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      diaInicioOrigen: formData.get("inicioOri") as string,
      diaInicioDestino: formData.get("inicioDes") as string,
      cantidadSemanas: Number(formData.get("cantidadSemanas")),
    };

    copyWeekMutation.mutate(data);
  };

  const handleDeleteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      diaInicioOrigen: formData.get("inicioOri") as string,
      diaInicioDestino: formData.get("inicioDes") as string,
      cantidadSemanas: 1,
    };

    if (!data.diaInicioOrigen || !data.diaInicioDestino) {
      toast.error("Ambas fechas son obligatorias");
      return;
    }

    deleteWeekMutation.mutate(data);
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ alumnoId: "all", instructorId: "all" });
  };

  // Exportar a Excel (para vista día)
  const handleExportExcel = async () => {
    try {
      await exportToExcel({
        selectedDate: currentDate,
        clases: filteredClases,
        caballos: caballos,
        instructores: instructores,
        getAlumnoNombre,
        getAlumnoNombreCompleto,
        getInstructorNombre,
        getInstructorColor,
        getCaballoNombre,
      });

      toast.success("Excel exportado correctamente");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error al exportar el archivo Excel");
      }

      toast.error("Error al exportar el archivo Excel");
    }
  };

  // Cancelar clases del día (para vista día)
  const handleCancelDayClases = (observaciones: string) => {
    const dateKey = format(currentDate, "yyyy-MM-dd");
    const clasesDelDia = filteredClases.filter(
      (clase) => clase.dia === dateKey,
    );

    // Solo clases cancelables
    const clasesCancelables = clasesDelDia.filter(
      (clase) => clase.estado !== "CANCELADA" && clase.estado !== "COMPLETADA",
    );

    const claseIds = clasesCancelables.map((clase) => clase.id);
    bulkCancelMutation.mutate({ claseIds, observaciones });
  };

  // Obtener clases cancelables del día actual
  const getCancelableDayClases = () => {
    const dateKey = format(currentDate, "yyyy-MM-dd");
    const clasesDelDia = filteredClases.filter(
      (clase) => clase.dia === dateKey,
    );

    return clasesDelDia.filter(
      (clase) => clase.estado !== "CANCELADA" && clase.estado !== "COMPLETADA",
    );
  };

  // Helpers
  const getAlumnoNombre = (id: number) => {
    const alumno = alumnos.find((a: Alumno) => a.id === id);
    return alumno ? alumno.nombre : "-";
  };

  const getAlumnoApellido = (id: number) => {
    const alumno = alumnos.find((a: Alumno) => a.id === id);
    return alumno ? alumno.apellido : "-";
  };

  const getAlumnoNombreCompleto = (id: number) => {
    const alumno = alumnos.find((a: Alumno) => a.id === id);
    return alumno ? `${alumno.nombre} ${alumno.apellido}` : "-";
  };

  // Agregar después de getAlumnoNombreCompleto en useCalendar.ts:

  const getNombreParaClase = (clase: Clase): string => {
    if (clase.alumnoId) {
      const alumno = alumnos.find((a: Alumno) => a.id === clase.alumnoId);
      return alumno ? alumno.nombre : "-";
    }
    return clase.personaPruebaNombreCompleto?.split(" ")[0] ?? "-";
  };

  const getNombreCompletoParaClase = (clase: Clase): string => {
    if (clase.alumnoId) {
      const alumno = alumnos.find((a: Alumno) => a.id === clase.alumnoId);
      return alumno ? `${alumno.nombre} ${alumno.apellido}` : "-";
    }
    return clase.personaPruebaNombreCompleto ?? "-";
  };

  const getInstructorNombre = (id: number) => {
    const instructor = instructores.find((i: Instructor) => i.id === id);
    return instructor ? `${instructor.nombre} ${instructor.apellido}` : "-";
  };

  const getCaballoNombre = (id: number) => {
    const caballo = caballos.find((c: Caballo) => c.id === id);
    return caballo?.nombre || "-";
  };

  const getInstructorColor = (id: number) => {
    const instructor = instructores.find((i: Instructor) => i.id === id);
    return instructor?.color || "#6B7280";
  };

  return {
    // Estado
    currentDate,
    viewMode,
    setViewMode,
    isDialogOpen,
    claseToEdit,
    prefilledCaballoId,
    prefilledHora,
    isCopyOpen,
    setIsCopyOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    filters,

    // Datos
    clases,
    filteredClases,
    alumnos,
    instructores,
    caballos,
    personasPrueba,
    isLoading,
    calendarDays,
    clasesByDate,
    conflictSet,

    // Mutations
    createMutation,
    updateMutation,
    deleteMutation,
    copyWeekMutation,
    deleteWeekMutation,
    bulkCancelMutation,
    statusMutation,

    // Handlers
    navigate,
    goToToday,
    handleDayClick,
    handleCellClick,
    handleEditClase,
    handleDeleteClase,
    handleCloseDialog,
    handleStatusChange,
    handleBulkCancel,
    handleCopySubmit,
    handleDeleteSubmit,
    handleFilterChange,
    handleResetFilters,
    handleExportExcel,
    handleCancelDayClases,
    getCancelableDayClases,

    // Helpers
    getAlumnoNombre,
    getAlumnoApellido,
    getAlumnoNombreCompleto,
    getNombreParaClase,
    getNombreCompletoParaClase,
    getInstructorNombre,
    getCaballoNombre,
    getInstructorColor,
  };
}
