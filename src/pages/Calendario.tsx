import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useState } from "react";

import { CalendarControls } from "@/components/calendar/CalendarControls";
import { CalendarToolbar } from "@/components/calendar/CalendarToolbar";
import { DayView } from "@/components/calendar/DayView";
import { MonthView } from "@/components/calendar/MonthView";
import { WeekView } from "@/components/calendar/WeekView";
import { ClaseForm } from "@/components/forms/ClaseForm";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
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
    handleGoToDay,
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
    handleExportWeekExcel,
    handleExportMonthExcel,
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
  const [isExpanded, setIsExpanded] = useState(false);

  // Verificar clases restantes del alumno
  const { estaAgotado } = useClasesRestantes(
    alumnoId ? Number(alumnoId) : 0,
    currentDate,
  );

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  // Bloquear scroll del body cuando está expandido
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

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

  // Título del Card según vista
  const cardTitle =
    viewMode === "day"
      ? `${format(currentDate, "EEEE d 'de' MMMM", { locale: es })} — ${
          filteredClases.filter(
            (c) => c.dia === format(currentDate, "yyyy-MM-dd"),
          ).length
        } clases`
      : viewMode === "week"
        ? `Semana del ${format(currentDate, "d 'de' MMMM", { locale: es })}`
        : format(currentDate, "MMMM yyyy", { locale: es });

  const calendarCard = (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded
          ? "fixed inset-2 z-50 flex flex-col shadow-2xl rounded-xl"
          : "relative",
      )}
    >
      <CardHeader
        className={cn(
          "border-b bg-secondary/30 py-3 flex-row items-center justify-between shrink-0",
          isExpanded && "px-6",
        )}
      >
        <CardTitle className="text-base font-medium capitalize">
          {cardTitle}
        </CardTitle>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded((v) => !v)}
          title={isExpanded ? "Contraer (Esc)" : "Expandir a pantalla completa"}
          className="h-7 w-7 shrink-0"
        >
          {isExpanded ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>

      <CardContent
        className={cn(
          "p-0",
          isExpanded && "flex-1 overflow-hidden",
        )}
        // Doble click en el contenido para togglear
        onDoubleClick={(e) => {
          // Evitar que dispare si el doble click es sobre un botón, input, select, etc.
          const target = e.target as HTMLElement;
          const interactive = target.closest(
            "button, a, input, select, textarea, [role='button'], [data-radix-popper-content-wrapper]",
          );
          if (!interactive) {
            setIsExpanded((v) => !v);
          }
        }}
      >
        {viewMode === "day" ? (
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
            isExpanded={isExpanded}
          />
        ) : viewMode === "month" ? (
          <MonthView
            currentDate={currentDate}
            calendarDays={calendarDays}
            clasesByDate={clasesByDate}
            onDayClick={handleDayClick}
            onGoToDay={handleGoToDay}
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
            onGoToDay={handleGoToDay}
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
  );

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
          showExportWeek={viewMode === "week"}
          onExportWeekExcel={handleExportWeekExcel}
          showExportMonth={viewMode === "month"}
          onExportMonthExcel={handleExportMonthExcel}
          showCancelDay={viewMode === "day"}
          onCancelDay={handleCancelDayClases}
          cancelDayCount={getCancelableDayClases().length}
          cancelDayDate={format(currentDate, "yyyy-MM-dd")}
        />
      </div>

      {/* Overlay oscuro cuando está expandido */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Vista del Calendario (unificada) */}
      {calendarCard}

      {/* Leyenda de instructores */}
      {!isExpanded && (
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
      )}

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