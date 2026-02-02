/**
 * DayView.tsx - Vista de Día estilo Excel para el Calendario
 * Refactorizada - Solo muestra la tabla, sin botones de acción
 * ✅ Con soporte para clases de prueba
 */

import { useMemo, useState } from "react";

import { Caballo,Clase } from "@/lib/api";
import { cn } from "@/lib/utils";

import { getClaseStyle,TIME_SLOTS } from "./calendar.styles";
import { ClaseBadge } from "./ClaseBadge";
import { ClasePopover } from "./ClasePopover";

interface DayViewProps {
  selectedDate: Date;
  clases: Clase[];
  caballos: Caballo[];
  onStatusChange: (claseId: number, newStatus: Clase["estado"]) => void;
  onCellClick?: (caballo: Caballo, hora: string) => void;
  onEditClase?: (clase: Clase) => void;
  onDeleteClase?: (claseId: number) => void;
  puedeEditarClase?: (clase: Clase) => boolean;
  getAlumnoNombre: (id: number) => string;
  getAlumnoNombreCompleto: (id: number) => string;
  getInstructorNombre: (id: number) => string;
  getCaballoNombre: (id: number) => string;
  getInstructorColor: (id: number) => string;
}

export function DayView({
  selectedDate,
  clases,
  caballos,
  onStatusChange,
  onCellClick,
  onEditClase,
  onDeleteClase,
  puedeEditarClase,
  getAlumnoNombre,
  getAlumnoNombreCompleto,
  getInstructorNombre,
  getCaballoNombre,
  getInstructorColor,
}: DayViewProps) {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  const dateKey = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  const clasesDelDia = useMemo(() => {
    return clases.filter((clase) => clase.dia === dateKey);
  }, [clases, dateKey]);

  const claseMap = useMemo(() => {
    const map: Record<string, Clase> = {};
    clasesDelDia.forEach((clase) => {
      const horaKey = clase.hora.slice(0, 5);
      const key = `${clase.caballoId}-${horaKey}`;
      map[key] = clase;
    });
    return map;
  }, [clasesDelDia]);

  const caballosOrdenados = useMemo(() => {
    return [...caballos].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [caballos]);

  return (
    <div className="overflow-auto max-h-[calc(100vh-200px)]">
      <table className="w-full min-w-[800px] border-collapse">
        {/* CABECERA */}
        <thead className="sticky top-0 z-20">
          <tr className="bg-secondary/50">
            <th className="sticky left-0 z-30 w-20 border border-border bg-secondary/80 px-2 py-3 text-left text-sm font-semibold text-muted-foreground backdrop-blur-sm">
              Hora
            </th>
            {caballosOrdenados.map((caballo) => (
              <th
                key={caballo.id}
                className="min-w-[100px] border border-border px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide bg-secondary/80 backdrop-blur-sm"
                title={
                  caballo.tipo === "PRIVADO"
                    ? "Caballo Privado"
                    : "Caballo de Escuela"
                }
              >
                <span
                  className={cn(
                    caballo.tipo === "PRIVADO" && "text-primary font-bold",
                  )}
                >
                  {caballo.nombre}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {/* CUERPO */}
        <tbody>
          {TIME_SLOTS.map((hora) => (
            <tr key={hora} className="hover:bg-muted/30 transition-colors">
              <td className="sticky left-0 z-10 border border-border bg-card px-2 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm">
                {hora}
              </td>

              {caballosOrdenados.map((caballo) => {
                const key = `${caballo.id}-${hora}`;
                const clase = claseMap[key];

                return (
                  <td
                    key={key}
                    className={cn(
                      "border border-border p-1 text-center transition-colors relative",
                      !clase &&
                        onCellClick &&
                        "cursor-pointer hover:bg-primary/10",
                    )}
                    onClick={() => {
                      if (!clase && onCellClick) {
                        onCellClick(caballo, hora);
                      }
                    }}
                  >
                    {clase ? (
                      <ClasePopover
                        clase={clase}
                        trigger={
                          <div className="relative">
                            {/* ✅ Indicador de clase de prueba en esquina superior derecha */}
                            {clase.esPrueba && (
                              <span
                                className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs shadow-sm border border-orange-600"
                                title="Clase de Prueba"
                              >
                                🎓
                              </span>
                            )}
                            <ClaseBadge
                              clase={clase}
                              alumnoNombre={getAlumnoNombre(clase.alumnoId)}
                              instructorColor={getInstructorColor(
                                clase.instructorId,
                              )}
                            />
                          </div>
                        }
                        alumnoNombre={getAlumnoNombreCompleto(clase.alumnoId)}
                        instructorNombre={getInstructorNombre(
                          clase.instructorId,
                        )}
                        caballoNombre={getCaballoNombre(clase.caballoId)}
                        onStatusChange={onStatusChange}
                        onEdit={onEditClase!}
                        onDelete={onDeleteClase!}
                        puedeEditar={
                          puedeEditarClase ? puedeEditarClase(clase) : true
                        }
                        open={popoverOpen === key}
                        onOpenChange={(open) =>
                          setPopoverOpen(open ? key : null)
                        }
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground/30">
                        —
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
