import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CalendarControls } from "@/components/calendar/CalendarControls";
import { CalendarToolbar } from "@/components/calendar/CalendarToolbar";
import {
  ALUMNO_COMODIN_ID,
  ESPECIALIDADES,
  ESTADOS,
  obtenerHoraArgentina,
} from "@/components/calendar/clases.constants";
import { DayView } from "@/components/calendar/DayView";
import { MonthView } from "@/components/calendar/MonthView";
import { WeekView } from "@/components/calendar/WeekView";
import { Layout } from "@/components/Layout";
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
import { Alumno, Caballo, Clase, Instructor } from "@/lib/api";
import {
  filtrarCaballosDisponibles,
  handleEspecialidadChangeEffect,
  puedeEditarClase,
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
    getNombreParaClase,
    getNombreCompletoParaClase,
    getInstructorNombre,
    getCaballoNombre,
    getInstructorColor,
    esPruebaChecked,
    setEsPruebaChecked,
    tipoPrueba,
    setTipoPrueba,
    nombrePrueba,
    setNombrePrueba,
    apellidoPrueba,
    setApellidoPrueba,
    conflictSet,
  } = useCalendar();

  // Estados para controlar la especialidad y el alumno en el formulario
  const [especialidad, setEspecialidad] = useState<string>("");
  const [alumnoId, setAlumnoId] = useState<string>("");
  const [duracion, setDuracion] = useState<number>(30);
  const [hora, setHora] = useState<string>("09:00");
  const [estado, setEstado] = useState<Clase["estado"]>("PROGRAMADA");
  const [instructorId, setInstructorId] = useState("");
  const [caballoId, setCaballoId] = useState("");
  const [observaciones, setObservaciones] = useState<string>("");

  // Verificar clases restantes del alumno
  const { estaAgotado } = useClasesRestantes(
    alumnoId ? Number(alumnoId) : 0,
    currentDate,
  );

  // Efecto para resetear los estados cuando se abre/cierra el diálogo
  useEffect(() => {
    if (isDialogOpen && claseToEdit) {
      setEspecialidad(claseToEdit.especialidad);
      setAlumnoId(claseToEdit.alumnoId ? String(claseToEdit.alumnoId) : "");
      setDuracion(claseToEdit.duracion || 30);
      setHora(obtenerHoraArgentina(claseToEdit.diaHoraCompleto));
      setEstado(claseToEdit.estado);
      setInstructorId(String(claseToEdit.instructorId));
      setCaballoId(String(claseToEdit.caballoId));
      setObservaciones(claseToEdit.observaciones ?? "");
    } else if (isDialogOpen && prefilledHora) {
      setHora(prefilledHora);
      if (prefilledCaballoId) {
        setCaballoId(String(prefilledCaballoId));
      }
    } else if (!isDialogOpen) {
      setEspecialidad("");
      setAlumnoId("");
      setDuracion(30);
      setHora("09:00");
      setEstado("PROGRAMADA");
      setInstructorId("");
      setCaballoId("");
      setObservaciones("");
    }
  }, [
    isDialogOpen,
    claseToEdit,
    prefilledHora,
    setNombrePrueba,
    setApellidoPrueba,
    prefilledCaballoId,
  ]);

  // Manejador para cambio de especialidad
  const handleEspecialidadChange = (value: string) => {
    handleEspecialidadChangeEffect(
      value,
      ALUMNO_COMODIN_ID,
      setEspecialidad,
      setAlumnoId,
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (estaAgotado && !claseToEdit && !esPruebaChecked) {
      const confirmar = window.confirm(
        `Este alumno ya agotó sus clases del mes. ¿Querés registrar una clase extra de todas formas?`,
      );
      if (!confirmar) return;
    }
    handleSubmitClase(e, {
      especialidad,
      alumnoId,
      caballoId,
      instructorId,
      hora,
      duracion,
      estado,
      observaciones,
    });
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
              getNombreParaClase={getNombreParaClase}
              getNombreCompletoParaClase={getNombreCompletoParaClase}
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
                getNombreParaClase={getNombreParaClase}
                getNombreCompletoParaClase={getNombreCompletoParaClase}
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
                getNombreParaClase={getNombreParaClase}
                getNombreCompletoParaClase={getNombreCompletoParaClase}
                getInstructorNombre={getInstructorNombre}
                getCaballoNombre={getCaballoNombre}
                getInstructorColor={getInstructorColor}
              />
            )}
          </CardContent>
        </Card>
      )}

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
                  ? `Editando clase de ${getNombreCompletoParaClase(claseToEdit)}`
                  : `Programar clase para el ${format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: es })}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {claseToEdit?.esPrueba && (
                <div className="flex items-center gap-2 ml-4">
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-orange-300 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-800">
                    <Info className="h-3 w-3 text-orange-600" />
                    Clase de Prueba
                  </span>
                </div>
              )}
              {/* ✅ FILA 1: Hora de Inicio - Alumno */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hora">Hora de Inicio</Label>
                  <Input
                    id="hora"
                    name="hora"
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    required
                  />
                </div>

                {/* ✅ FILA 2: Alumno - Caballo */}
                <div className="space-y-2">
                  <Label htmlFor="alumnoId">
                    Alumno
                    {especialidad === "MONTA" && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Asignado automáticamente)
                      </span>
                    )}
                    {claseToEdit?.esPrueba && !claseToEdit?.alumnoId && (
                      <span className="ml-2 text-xs text-orange-600">
                        (Clase de prueba)
                      </span>
                    )}
                  </Label>
                  {especialidad === "MONTA" && (
                    <input type="hidden" name="alumnoId" value={alumnoId} />
                  )}

                  {/* CASO: edición de clase de prueba con persona nueva */}
                  {claseToEdit?.esPrueba && !claseToEdit?.alumnoId ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={nombrePrueba}
                        onChange={(e) => setNombrePrueba(e.target.value)}
                        placeholder="Nombre"
                      />
                      <Input
                        value={apellidoPrueba}
                        onChange={(e) => setApellidoPrueba(e.target.value)}
                        placeholder="Apellido"
                      />
                    </div>
                  ) : (
                    <Select
                      name={especialidad === "MONTA" ? "" : "alumnoId"}
                      required={
                        especialidad !== "MONTA" &&
                        !(esPruebaChecked && tipoPrueba === "persona_nueva")
                      }
                      value={alumnoId}
                      onValueChange={setAlumnoId}
                      defaultValue={
                        claseToEdit ? String(claseToEdit.alumnoId) : undefined
                      }
                      disabled={
                        especialidad === "MONTA" ||
                        (esPruebaChecked && tipoPrueba === "persona_nueva")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar alumno" />
                      </SelectTrigger>
                      <SelectContent>
                        {alumnos
                          .filter((alumno: Alumno) =>
                            especialidad === "MONTA"
                              ? alumno.id === 1
                              : alumno.id !== 1,
                          )
                          .map((alumno: Alumno) => (
                            <SelectItem
                              key={alumno.id}
                              value={String(alumno.id)}
                            >
                              {alumno.nombre} {alumno.apellido}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* FILA 5: Duración */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duracion">Duración</Label>
                  <Select
                    name="duracion"
                    required
                    value={String(duracion)}
                    onValueChange={(value) => setDuracion(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar duración" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {claseToEdit && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Fin estimado
                    </Label>
                    <p className="flex h-10 items-center text-sm text-muted-foreground">
                      {(() => {
                        const [h, m] = hora.split(":").map(Number);
                        const durMin = duracion;
                        const totalMin = h * 60 + m + durMin;
                        return `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
                      })()}
                    </p>
                  </div>
                )}
              </div>

              {/* ✅ FILA 2: Instructor - Caballo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instructorId">Instructor</Label>
                  <Select
                    required
                    value={instructorId}
                    onValueChange={setInstructorId}
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
                        (a: Alumno) => a.id === Number(alumnoId),
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
                    required
                    value={caballoId}
                    onValueChange={setCaballoId}
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
                    value={especialidad}
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
                          {esp.charAt(0).toUpperCase() +
                            esp.slice(1).toLowerCase()}
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
                          checked={esPruebaChecked}
                          onChange={(e) => {
                            setEsPruebaChecked(e.target.checked);
                            if (!e.target.checked) {
                              setTipoPrueba("persona_nueva");
                              setNombrePrueba("");
                              setApellidoPrueba("");
                            }
                          }}
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
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Select
                          required
                          value={estado}
                          onValueChange={(v) => setEstado(v as Clase["estado"])}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ESTADOS.map((e) => (
                              <SelectItem key={e} value={e}>
                                {e.charAt(0).toUpperCase() +
                                  e.slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="observaciones">Observaciones</Label>
                        <Input
                          id="observaciones"
                          placeholder="Ej. Lluvia, Feriado, etc"
                          value={observaciones}
                          onChange={(e) => setObservaciones(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* BLOQUE PersonaPrueba */}
              {!claseToEdit && esPruebaChecked && (
                <div className="rounded-md border border-orange-200 bg-orange-50 p-4 space-y-3">
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-orange-900">
                      <input
                        type="radio"
                        name="tipoPrueba"
                        value="persona_nueva"
                        checked={tipoPrueba === "persona_nueva"}
                        onChange={() => {
                          setTipoPrueba("persona_nueva");
                          setAlumnoId("");
                        }}
                        className="text-orange-600"
                      />
                      Persona nueva
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-orange-900">
                      <input
                        type="radio"
                        name="tipoPrueba"
                        value="alumno_existente"
                        checked={tipoPrueba === "alumno_existente"}
                        onChange={() => {
                          setTipoPrueba("alumno_existente");
                          setNombrePrueba("");
                          setApellidoPrueba("");
                        }}
                        className="text-orange-600"
                      />
                      Alumno existente
                    </label>
                  </div>

                  {tipoPrueba === "persona_nueva" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-orange-800">
                          Nombre/s
                        </Label>
                        <Input
                          value={nombrePrueba}
                          onChange={(e) => setNombrePrueba(e.target.value)}
                          placeholder="Nombre/s"
                          required
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-orange-800">
                          Apellido/s
                        </Label>
                        <Input
                          value={apellidoPrueba}
                          onChange={(e) => setApellidoPrueba(e.target.value)}
                          placeholder="Apellido/s"
                          required
                          className="bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {tipoPrueba === "alumno_existente" && (
                    <p className="text-xs text-orange-700">
                      Seleccioná el alumno en el selector de arriba.
                    </p>
                  )}
                </div>
              )}
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
