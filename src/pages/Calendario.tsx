/**
 * Calendario.tsx
 * Página principal del calendario - Solo UI y composición
 */

import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "@/components/ui/filter-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useCalendar } from "@/hooks/useCalendar";
import { CalendarControls } from "@/components/calendar/CalendarControls";
import { CalendarToolbar } from "@/components/calendar/CalendarToolbar";
import { MonthView } from "@/components/calendar/MonthView";
import { WeekView } from "@/components/calendar/WeekView";
import { DayView } from "@/components/calendar/DayView";
import {
  ESPECIALIDADES,
  ESTADOS,
  ALUMNO_COMODIN_ID,
} from "@/components/calendar/calendar.styles";
import { Alumno, Instructor, Caballo } from "@/lib/api";
import { useEffect, useState } from "react";

export default function CalendarioPage() {
  const {
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
    clases,
    filteredClases,
    alumnos,
    instructores,
    caballos,
    isLoading,
    calendarDays,
    clasesByDate,
    createMutation,
    updateMutation,
    copyWeekMutation,
    deleteWeekMutation,
    navigate,
    goToToday,
    handleDayClick,
    handleCellClick,
    handleEditClase,
    handleDeleteClase,
    handleCloseDialog,
    handleSubmit,
    handleStatusChange,
    handleCopySubmit,
    handleDeleteSubmit,
    handleFilterChange,
    handleResetFilters,
    handleExportExcel,
    handleCancelDayClases,
    getCancelableDayClases,
    getAlumnoNombre,
    getAlumnoApellido,
    getAlumnoNombreCompleto,
    getInstructorNombre,
    getCaballoNombre,
  } = useCalendar();

  // Estado para controlar la especialidad seleccionada y el alumno
  const [especialidadSeleccionada, setEspecialidadSeleccionada] =
    useState<string>("");
  const [alumnoIdSeleccionado, setAlumnoIdSeleccionado] = useState<string>("");

  // Efecto para resetear los estados cuando se abre/cierra el diálogo
  useEffect(() => {
    if (isDialogOpen && claseToEdit) {
      setEspecialidadSeleccionada(claseToEdit.especialidad);
      setAlumnoIdSeleccionado(String(claseToEdit.alumnoId));
    } else if (!isDialogOpen) {
      setEspecialidadSeleccionada("");
      setAlumnoIdSeleccionado("");
    }
  }, [isDialogOpen, claseToEdit]);

  // Manejador para cambio de especialidad
  const handleEspecialidadChange = (value: string) => {
    setEspecialidadSeleccionada(value);

    // Si es MONTA, asignar automáticamente el alumno comodín
    if (value === "MONTA") {
      setAlumnoIdSeleccionado(String(ALUMNO_COMODIN_ID));
    }
  };

  // Configuración de filtros
  const filterConfig = [
    {
      name: "alumnoId",
      label: "Alumno",
      type: "select" as const,
      options: alumnos.map((a: Alumno) => ({
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
  ];

  return (
    <Layout>
      <PageHeader
        title="Calendario de Clases"
        description="Vista interactiva de las clases programadas"
      />

      {/* Controles de navegación */}
      <CalendarControls
        currentDate={currentDate}
        viewMode={viewMode}
        onNavigate={navigate}
        onToday={goToToday}
        onViewModeChange={setViewMode}
      />

      {/* Barra de herramientas */}
      <CalendarToolbar
        isCopyOpen={isCopyOpen}
        onCopyOpenChange={setIsCopyOpen}
        onCopySubmit={handleCopySubmit}
        copyPending={copyWeekMutation.isPending}
        isDeleteOpen={isDeleteOpen}
        onDeleteOpenChange={setIsDeleteOpen}
        onDeleteSubmit={handleDeleteSubmit}
        deletePending={deleteWeekMutation.isPending}
        showExport={viewMode === "day"}
        onExportExcel={handleExportExcel}
        showCancelDay={viewMode === "day"}
        onCancelDay={handleCancelDayClases}
        cancelDayCount={getCancelableDayClases().length}
        cancelDayDate={format(currentDate, "yyyy-MM-dd")}
      />

      {/* Filtros */}
      <div className="mb-6">
        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          isLoading={isLoading}
        />
      </div>

      {/* Vista del Calendario */}
      {viewMode === "day" ? (
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-secondary/30 py-3">
            <CardTitle className="text-base font-medium">
              {format(currentDate, "EEEE d 'de' MMMM", { locale: es })} —
              <span className="ml-2 text-muted-foreground">
                {
                  filteredClases.filter(
                    (c) => c.dia === format(currentDate, "yyyy-MM-dd"),
                  ).length
                }{" "}
                clases
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DayView
              selectedDate={currentDate}
              clases={filteredClases}
              caballos={caballos}
              onStatusChange={handleStatusChange}
              onCellClick={handleCellClick}
              onEditClase={handleEditClase}
              onDeleteClase={handleDeleteClase}
              getAlumnoNombre={getAlumnoNombre}
              getAlumnoNombreCompleto={getAlumnoNombreCompleto}
              getInstructorNombre={getInstructorNombre}
              getCaballoNombre={getCaballoNombre}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {viewMode === "month" ? (
              <MonthView
                currentDate={currentDate}
                calendarDays={calendarDays}
                clasesByDate={clasesByDate}
                onDayClick={handleDayClick}
                onStatusChange={handleStatusChange}
                onEditClase={handleEditClase}
                onDeleteClase={handleDeleteClase}
                getAlumnoApellido={getAlumnoApellido}
                getAlumnoNombreCompleto={getAlumnoNombreCompleto}
                getInstructorNombre={getInstructorNombre}
                getCaballoNombre={getCaballoNombre}
              />
            ) : (
              <WeekView
                calendarDays={calendarDays}
                clasesByDate={clasesByDate}
                onDayClick={handleDayClick}
                onStatusChange={handleStatusChange}
                onEditClase={handleEditClase}
                onDeleteClase={handleDeleteClase}
                getAlumnoApellido={getAlumnoApellido}
                getAlumnoNombreCompleto={getAlumnoNombreCompleto}
                getInstructorNombre={getInstructorNombre}
                getCaballoNombre={getCaballoNombre}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Leyenda */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-warning/50" />
          <span className="text-sm text-muted-foreground">Programada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-info/50" />
          <span className="text-sm text-muted-foreground">Iniciada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success/50" />
          <span className="text-sm text-muted-foreground">Completada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-destructive/50" />
          <span className="text-sm text-muted-foreground">Cancelada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-purple-500/50" />
          <span className="text-sm text-muted-foreground">ACA</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-cyan-500/50" />
          <span className="text-sm text-muted-foreground">ASA</span>
        </div>
      </div>

      {/* Diálogo Crear/Editar Clase */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="font-display">
                {claseToEdit ? "Editar Clase" : "Nueva Clase"}
              </DialogTitle>
              <DialogDescription>
                {claseToEdit
                  ? `Editando clase de ${getAlumnoNombreCompleto(claseToEdit.alumnoId)}`
                  : `Programar clase para el ${format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: es })}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hora">Hora de Inicio</Label>
                  <Input
                    id="hora"
                    name="hora"
                    type="time"
                    defaultValue={
                      claseToEdit
                        ? claseToEdit.hora.slice(0, 5)
                        : prefilledHora || "09:00"
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alumnoId">
                    {" "}
                    Alumno
                    {especialidadSeleccionada === "MONTA" && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Asignado automáticamente)
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
                      especialidadSeleccionada === "MONTA" ? "" : "alumnoId"
                    }
                    required={especialidadSeleccionada !== "MONTA"}
                    value={alumnoIdSeleccionado}
                    onValueChange={setAlumnoIdSeleccionado}
                    defaultValue={
                      claseToEdit ? String(claseToEdit.alumnoId) : undefined
                    }
                    disabled={especialidadSeleccionada === "MONTA"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar alumno" />
                    </SelectTrigger>
                    <SelectContent>
                      {alumnos.map((alumno: Alumno) => (
                        <SelectItem key={alumno.id} value={String(alumno.id)}>
                          {alumno.nombre} {alumno.apellido}
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
                    required
                    defaultValue={
                      claseToEdit ? String(claseToEdit.instructorId) : undefined
                    }
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
                  <Label htmlFor="caballoId">Caballo</Label>
                  <Select
                    name="caballoId"
                    required
                    defaultValue={
                      claseToEdit
                        ? String(claseToEdit.caballoId)
                        : prefilledCaballoId
                          ? String(prefilledCaballoId)
                          : undefined
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
                            {caballo.tipo === "ESCUELA" ? "Escuela" : "Privado"}
                            )
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="especialidad">Especialidad</Label>
                  <Select
                    name="especialidad"
                    required
                    value={especialidadSeleccionada}
                    onValueChange={handleEspecialidadChange}
                    defaultValue={
                      claseToEdit ? claseToEdit.especialidad : undefined
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESPECIALIDADES.map((esp) => (
                        <SelectItem key={esp} value={esp}>
                          {esp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {claseToEdit && (
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      name="estado"
                      required
                      defaultValue={claseToEdit.estado}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {claseToEdit ? "Guardar Cambios" : "Crear Clase"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
