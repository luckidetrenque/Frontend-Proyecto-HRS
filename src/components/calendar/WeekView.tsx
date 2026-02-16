/**
 * WeekView.tsx
 * Vista semanal del calendario
 */

import { format, isToday } from "date-fns";
import { useState } from "react";

import { Clase } from "@/lib/api";
import { cn } from "@/lib/utils";

import { ClaseBadge } from "./ClaseBadge";
import { ClasePopover } from "./ClasePopover";
import { DIAS_SEMANA, MAX_CLASES_POR_CELDA } from "./clases.constants";

interface WeekViewProps {
  calendarDays: Date[];
  clasesByDate: Record<string, Clase[]>;
  onDayClick: (date: Date) => void;
  onStatusChange: (claseId: number, newStatus: Clase["estado"]) => void;
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

export function WeekView({
  calendarDays,
  clasesByDate,
  onDayClick,
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
}: WeekViewProps) {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const maxClases = MAX_CLASES_POR_CELDA.week;

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

      {/* Grid de días (7 columnas, altura fija) */}
      <div className="grid grid-cols-7 min-h-[400px]">
        {calendarDays.map((day, index) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayClases = clasesByDate[dateKey] || [];
          const isCurrentDay = isToday(day);

          return (
            <div
              key={index}
              className={cn(
                "min-h-[350px] border-b border-r border-border p-2 transition-colors",
                isCurrentDay && "bg-accent/20",
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <button
                  onClick={() => onDayClick(day)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground",
                    isCurrentDay && "bg-primary text-primary-foreground",
                  )}
                >
                  {format(day, "d")}
                </button>
                {dayClases.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {dayClases.length} clase{dayClases.length > 1 ? "s" : ""}
                  </span>
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
                {dayClases.length > maxClases && (
                  <span className="block text-center text-xs text-muted-foreground">
                    +{dayClases.length - maxClases} más
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
