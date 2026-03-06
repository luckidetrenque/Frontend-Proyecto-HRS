/**
 * MonthView.tsx
 * Vista mensual del calendario
 */

import { format, isSameMonth, isToday } from "date-fns";
import { useState } from "react";

import { Clase } from "@/lib/api";
import { cn } from "@/lib/utils";

import { ClaseBadge } from "./ClaseBadge";
import { ClasePopover } from "./ClasePopover";
import { DIAS_SEMANA, MAX_CLASES_POR_CELDA } from "./clases.constants";

interface MonthViewProps {
  currentDate: Date;
  calendarDays: Date[];
  clasesByDate: Record<string, Clase[]>;
  onDayClick: (date: Date) => void;
  onGoToDay: (date: Date) => void;
  onStatusChange: (
    claseId: number,
    newStatus: Clase["estado"],
    observaciones: string,
  ) => void;
  onEditClase: (clase: Clase) => void;
  onDeleteClase: (claseId: number) => void;
  puedeEditarClase?: (clase: Clase) => boolean;
  getAlumnoNombre: (id: number) => string;
  getAlumnoApellido: (id: number) => string;
  getAlumnoNombreCompleto: (id: number) => string;
  getNombreParaClase: (clase: Clase) => string;
  getNombreCompletoParaClase: (clase: Clase) => string;
  getInstructorNombre: (id: number) => string;
  getCaballoNombre: (id: number) => string;
  getInstructorColor: (id: number) => string;
}

export function MonthView({
  currentDate,
  calendarDays,
  clasesByDate,
  onDayClick,
  onGoToDay,
  onStatusChange,
  onEditClase,
  onDeleteClase,
  puedeEditarClase,
  getAlumnoNombre,
  getAlumnoApellido,
  getAlumnoNombreCompleto,
  getNombreParaClase,
  getNombreCompletoParaClase,
  getInstructorNombre,
  getCaballoNombre,
  getInstructorColor,
}: MonthViewProps) {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const maxClases = MAX_CLASES_POR_CELDA.month;

  return (
    <div className="overflow-hidden">
      {/* Encabezados de días */}
      <div className="grid grid-cols-7 border-b border-border bg-secondary/50">
        {DIAS_SEMANA.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-semibold text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayClases = clasesByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          const hiddenCount = dayClases.length - maxClases;

          return (
            <div
              key={index}
              className={cn(
                "min-h-[120px] border-b border-r border-border p-2 transition-colors",
                !isCurrentMonth && "bg-muted/30",
                isCurrentDay && "bg-accent/20",
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                {/* Número de día — abre el diálogo de nueva clase */}
                <button
                  onClick={() => onDayClick(day)}
                  title="Agregar clase en este día"
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground",
                    isCurrentDay && "bg-primary text-primary-foreground",
                    !isCurrentMonth && "text-muted-foreground",
                  )}
                >
                  {format(day, "d")}
                </button>

                {/* Contador de clases — clic navega a la vista día */}
                {dayClases.length > 0 && (
                  <button
                    onClick={() => onGoToDay(day)}
                    title={`Ver las ${dayClases.length} clase${dayClases.length > 1 ? "s" : ""} del día en detalle`}
                    className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors"
                  >
                    {dayClases.length} clase{dayClases.length > 1 ? "s" : ""}
                  </button>
                )}
              </div>

              {/* Clases del día */}
              <div className="space-y-1">
                {dayClases.slice(0, maxClases).map((clase) => {
                  const key = `${dateKey}-${clase.id}`;
                  return (
                    <ClasePopover
                      key={clase.id}
                      clase={clase}
                      trigger={
                        <div>
                          <ClaseBadge
                            clase={clase}
                            alumnoNombre={getNombreParaClase(clase)}
                            caballoNombre={getCaballoNombre(clase.caballoId)}
                            instructorColor={getInstructorColor(
                              clase.instructorId,
                            )}
                            compact
                          />
                        </div>
                      }
                      alumnoNombre={getNombreCompletoParaClase(clase)}
                      instructorNombre={getInstructorNombre(clase.instructorId)}
                      caballoNombre={getCaballoNombre(clase.caballoId)}
                      onStatusChange={onStatusChange}
                      onEdit={onEditClase}
                      onDelete={onDeleteClase}
                      puedeEditar={
                        puedeEditarClase ? puedeEditarClase(clase) : true
                      }
                      open={popoverOpen === key}
                      onOpenChange={(open) => setPopoverOpen(open ? key : null)}
                    />
                  );
                })}

                {/* Botón "+N más" → navega a la vista día */}
                {hiddenCount > 0 && (
                  <button
                    onClick={() => onGoToDay(day)}
                    title={`Ver las ${hiddenCount} clase${hiddenCount > 1 ? "s" : ""} restante${hiddenCount > 1 ? "s" : ""} del día`}
                    className="block w-full text-center text-xs text-primary hover:text-primary/80 hover:underline transition-colors py-0.5 rounded"
                  >
                    +{hiddenCount} más →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
