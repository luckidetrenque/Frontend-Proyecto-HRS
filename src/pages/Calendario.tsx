import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Bell, CalendarCheck, Maximize2, Minimize2, X } from "lucide-react";
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
import { Alumno, Instructor, Clase } from "@/lib/api";
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
    reservarMutation,
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

  const [alumnoIdState, setAlumnoIdState] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);

  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isInstructor = user?.rol === "INSTRUCTOR" || user?.rol === "ROLE_INSTRUCTOR";
  const isAlumno = user?.rol === "ALUMNO" || user?.rol === "ROLE_ALUMNO";

  // Verificar clases restantes del alumno
  const { estaAgotado } = useClasesRestantes(
    alumnoIdState ? Number(alumnoIdState) : 0,
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

  // Configuración de vista según el rol
  const puedeEditarClaseModificado = (clase: Clase) => {
    const estadoEditable = puedeEditarClase(clase);
    if (isAlumno) {
      return clase.alumnoId === Number(user?.alumnoId) && estadoEditable;
    }
    if (isInstructor) {
      return clase.instructorId === Number(user?.instructorId) && estadoEditable;
    }
    return estadoEditable;
  };

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

  const filterConfig = [
    {
      name: "alumnoId",
      label: isAlumno ? "Filtro de Clases" : "Alumno",
      type: "select" as const,
      options: isAlumno
        ? [
            {
              label: "Ver solo mis clases",
              value: String(user?.alumnoId),
            },
          ]
        : alumnos.map((a: Alumno) => ({
            label: `${a.nombre} ${a.apellido}`,
            value: String(a.id),
          })),
      placeholder: isAlumno ? "Ver todas las clases" : "Todos los alumnos",
    },
    ...(isAlumno
      ? []
      : [
          {
            name: "instructorId",
            label: isInstructor ? "Filtro de Clases" : "Instructor",
            type: "select" as const,
            options: isInstructor
              ? [
                  {
                    label: "Ver solo mis clases",
                    value: String(user?.instructorId),
                  },
                ]
              : instructores.map((i: Instructor) => ({
                  label: `${i.nombre} ${i.apellido}`,
                  value: String(i.id),
                })),
            placeholder: isInstructor ? "Ver todas las clases" : "Todos los instructores",
          },
        ]),
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
        onDoubleClick={(e) => {
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
            puedeEditarClase={puedeEditarClaseModificado}
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
            puedeEditarClase={puedeEditarClaseModificado}
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
            puedeEditarClase={puedeEditarClaseModificado}
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

      <div className={cn(
        "flex flex-wrap items-center justify-center sm:justify-end gap-2 mb-6",
        (isAlumno || isInstructor) && "w-full [&>div]:w-full"
      )}>
        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          isLoading={isLoading}
        />
        {!isAlumno && (
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
        )}
      </div>

      {isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {calendarCard}

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

      {/* Panel de Reservas Pendientes — visible solo para admin/instructor */}
      {!isAlumno && (() => {
        const reservasPendientes = filteredClases.filter(
          (c) => c.estado === "RESERVADA"
        );
        if (reservasPendientes.length === 0) return null;

        return (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-purple-600" />
              <h3 className="font-semibold text-sm">
                Reservas pendientes de confirmación
              </h3>
              <span className="inline-flex items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold h-5 min-w-5 px-1.5">
                {reservasPendientes.length}
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {reservasPendientes.map((clase) => (
                <div
                  key={clase.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getNombreCompletoParaClase(clase)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(clase.dia + "T12:00:00"), "d MMM", { locale: es })}
                      {" · "}{clase.hora.slice(0, 5)}
                      {" · "}{getCaballoNombre(clase.caballoId)}
                    </p>
                    <p className="text-xs text-purple-600">
                      {getInstructorNombre(clase.instructorId)}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleStatusChange(clase.id, "PROGRAMADA", "")}
                      className="inline-flex items-center gap-1 rounded-md bg-purple-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-purple-700 transition-colors"
                      title="Confirmar reserva"
                    >
                      <CalendarCheck className="h-3.5 w-3.5" />
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleStatusChange(clase.id, "CANCELADA", "Reserva rechazada")}
                      className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      title="Rechazar reserva"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

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
              } else if (isAlumno) {
                reservarMutation.mutate(data);
              } else {
                createMutation.mutate(data);
              }
            }}
            isPending={
              createMutation.isPending ||
              updateMutation.isPending ||
              reservarMutation.isPending
            }
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}