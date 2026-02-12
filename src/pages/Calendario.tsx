import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CalendarControls } from "@/components/calendar/CalendarControls";
import { CalendarToolbar } from "@/components/calendar/CalendarToolbar";
import {
  ALUMNO_COMODIN_ID,
  ESPECIALIDADES,
  ESTADOS,
} from "@/components/calendar/clases.constants";
import { DayView } from "@/components/calendar/DayView";
import { MonthView } from "@/components/calendar/MonthView";
import { WeekView } from "@/components/calendar/WeekView";
import { Layout } from "@/components/Layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilterBar } from "@/components/ui/filter-bar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCalendar } from "@/hooks/useCalendar";
import { useClasesRestantes } from "@/hooks/useClasesRestantes";
import { Alumno, Caballo, Instructor } from "@/lib/api";
import {
  filtrarCaballosDisponibles,
  handleEspecialidadChangeEffect,
  puedeEditarClase,
  verificarConflictoHorario,
} from "@/utils/validacionesClases";

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
    handleSubmitClase,
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
    getInstructorColor,
    conflictSet,
  } = useCalendar();

  // Estados para controlar la especialidad y el alumno en el formulario
  const [especialidadSeleccionada, setEspecialidadSeleccionada] =
    useState<string>("");
  const [alumnoIdSeleccionado, setAlumnoIdSeleccionado] = useState<string>("");

  // Filtrar caballos según alumno seleccionado
  const caballosDisponibles = useMemo(() => {
    if (!alumnoIdSeleccionado) return caballos.filter((c) => c.disponible);
    return filtrarCaballosDisponibles(caballos, Number(alumnoIdSeleccionado));
  }, [caballos, alumnoIdSeleccionado]);

  // Verificar clases restantes del alumno
  const {
    clasesRestantes,
    estaAgotado,
    cercaDelLimite,
    clasesTomadas,
    clasesContratadas,
  } = useClasesRestantes(
    alumnoIdSeleccionado ? Number(alumnoIdSeleccionado) : 0,
    currentDate,
  );

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
    handleEspecialidadChangeEffect(
      value,
      ALUMNO_COMODIN_ID,
      setEspecialidadSeleccionada,
      setAlumnoIdSeleccionado,
    );
  };

  // ✅ AGREGAR ESTA FUNCIÓN COMPLETA AQUÍ
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (estaAgotado && !claseToEdit) {
      const confirmar = window.confirm(`...`);
      if (!confirmar) return;
    }
    handleSubmitClase(e); // ← ahora llama al del hook con nuevo nombre
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
        action={
          <CalendarControls
            currentDate={currentDate}
            viewMode={viewMode}
            onNavigate={navigate}
            onToday={goToToday}
            onViewModeChange={setViewMode}
          />
        }
      />

      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 mb-6">
        {/* Filtros */}
        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          isLoading={isLoading}
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
              puedeEditarClase={puedeEditarClase}
              getAlumnoNombre={getAlumnoNombre}
              getAlumnoNombreCompleto={getAlumnoNombreCompleto}
              getInstructorNombre={getInstructorNombre}
              getCaballoNombre={getCaballoNombre}
              getInstructorColor={getInstructorColor}
              conflictSet={conflictSet}
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
                puedeEditarClase={puedeEditarClase}
                getAlumnoNombre={getAlumnoNombre}
                getAlumnoApellido={getAlumnoApellido}
                getAlumnoNombreCompleto={getAlumnoNombreCompleto}
                getInstructorNombre={getInstructorNombre}
                getCaballoNombre={getCaballoNombre}
                getInstructorColor={getInstructorColor}
              />
            ) : (
              <WeekView
                calendarDays={calendarDays}
                clasesByDate={clasesByDate}
                onDayClick={handleDayClick}
                onStatusChange={handleStatusChange}
                onEditClase={handleEditClase}
                onDeleteClase={handleDeleteClase}
                puedeEditarClase={puedeEditarClase}
                getAlumnoNombre={getAlumnoNombre}
                getAlumnoApellido={getAlumnoApellido}
                getAlumnoNombreCompleto={getAlumnoNombreCompleto}
                getInstructorNombre={getInstructorNombre}
                getCaballoNombre={getCaballoNombre}
                getInstructorColor={getInstructorColor}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* En Calendario.tsx, reemplazar la leyenda actual */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        {instructores.map((instructor) => (
          <div key={instructor.id} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full border"
              style={{ backgroundColor: instructor.color }}
            />
            <span className="text-sm text-muted-foreground">
              {instructor.nombre} {instructor.apellido}
            </span>
          </div>
        ))}
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
              {/* ✅ FILA 1: Hora de Inicio - Alumno */}
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

                {/* ✅ FILA 2: Alumno - Caballo */}
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

              {/* ✅ FILA 2: Instructor - Caballo */}
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
                  <Label htmlFor="caballoId">
                    Caballo
                    {/* Mostrar si tiene caballo predeterminado */}
                    {(() => {
                      const alumno = alumnos.find(
                        (a: Alumno) => a.id === Number(alumnoIdSeleccionado),
                      );
                      if (alumno?.caballoPropio) {
                        const caballoIdPred =
                          typeof alumno.caballoPropio === "number"
                            ? alumno.caballoPropio
                            : alumno.caballoPropio.id;
                        const caballo = caballos.find(
                          (c: Caballo) => c.id === caballoIdPred,
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
                    required
                    defaultValue={
                      claseToEdit
                        ? String(claseToEdit.caballoId)
                        : prefilledCaballoId
                          ? String(prefilledCaballoId)
                          : (() => {
                              const alumno = alumnos.find(
                                (a: Alumno) =>
                                  a.id === Number(alumnoIdSeleccionado),
                              );
                              if (!alumno?.caballoPropio) return undefined;
                              const caballoIdPred =
                                typeof alumno.caballoPropio === "number"
                                  ? alumno.caballoPropio
                                  : alumno.caballoPropio.id;
                              return String(caballoIdPred);
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
                            {caballo.tipo === "ESCUELA" ? "Escuela" : "Privado"}
                            )
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* ✅ FILA 3: Especialidad - Estado/Checkbox */}
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

                {/* ✅ FILA 4: Estado - Checkbox/Observaciones */}
                <div className="space-y-2">
                  {!claseToEdit ? (
                    <>
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
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
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
