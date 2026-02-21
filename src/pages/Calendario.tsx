import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";

import { CalendarControls } from "@/components/calendar/CalendarControls";
import { CalendarToolbar } from "@/components/calendar/CalendarToolbar";
import { DayView } from "@/components/calendar/DayView";
import { MonthView } from "@/components/calendar/MonthView";
import { WeekView } from "@/components/calendar/WeekView";
import { ClaseForm } from "@/components/forms/ClaseForm";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { useCalendar } from "@/hooks/useCalendar";
import { useClasesRestantes } from "@/hooks/useClasesRestantes";
import { Alumno, Instructor } from "@/lib/api";
import { puedeEditarClase } from "@/utils/validacionesClases";

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
    personasPrueba,
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
    conflictSet,
  } = useCalendar();

  const [alumnoId, setAlumnoId] = useState<string>("");
  // Verificar clases restantes del alumno
  const { estaAgotado } = useClasesRestantes(
    alumnoId ? Number(alumnoId) : 0,
    currentDate,
  );

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

          <ClaseForm
            clase={claseToEdit ?? undefined}
            alumnos={alumnos}
            instructores={instructores}
            caballos={caballos}
            clases={filteredClases}
            personasPrueba={personasPrueba}
            currentDate={currentDate}
            prefilledHora={prefilledHora}
            prefilledCaballoId={prefilledCaballoId}
            onSubmit={(data) => {
              if (claseToEdit) {
                updateMutation.mutate({ id: claseToEdit.id, data });
              } else {
                createMutation.mutate(data);
              }
            }}
            isPending={createMutation.isPending || updateMutation.isPending}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
