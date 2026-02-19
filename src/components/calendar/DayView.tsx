/**
 * DayView.tsx - Vista de Día estilo Excel para el Calendario
 * Refactorizada - Solo muestra la tabla, sin botones de acción
 * ✅ Con soporte para clases de prueba
 */

import { useMemo, useState } from "react";

import { Caballo, Clase } from "@/lib/api";
import { cn } from "@/lib/utils";

import { ClaseBadge } from "./ClaseBadge";
import { ClasePopover } from "./ClasePopover";
import { TIME_SLOTS } from "./clases.constants";

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
  getNombreParaClase: (clase: Clase) => string;
  getNombreCompletoParaClase: (clase: Clase) => string;
  getInstructorNombre: (id: number) => string;
  getCaballoNombre: (id: number) => string;
  getInstructorColor: (id: number) => string;
  conflictSet: Set<string>;
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
  getNombreParaClase,
  getNombreCompletoParaClase,
  getInstructorNombre,
  getCaballoNombre,
  getInstructorColor,
  conflictSet,
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
    const continuacionMap: Record<string, Clase> = {}; // ← nuevo

    clasesDelDia.forEach((clase) => {
      const horaKey = clase.hora.slice(0, 5);
      const key = `${clase.caballoId}-${horaKey}`;
      map[key] = clase;

      // Si dura 60 min, ocupa también la franja siguiente
      if ((clase.duracion ?? 60) >= 60) {
        const [h, m] = horaKey.split(":").map(Number);
        const totalMin = h * 60 + m + 30;
        const nextHora = `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
        const continuacionKey = `${clase.caballoId}-${nextHora}`;
        continuacionMap[continuacionKey] = clase;
      }
    });

    return { map, continuacionMap };
  }, [clasesDelDia]);

  // Orden de los caballos alfabéticamente
  // const caballosOrdenados = useMemo(() => {
  //   return [...caballos].sort((a, b) => a.nombre.localeCompare(b.nombre));
  // }, [caballos]);

  // Orden de los caballos según el backend
  const caballosOrdenados = useMemo(() => {
    return [...caballos];
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
                {/* <div className="flex flex-col items-center gap-0.5">
                  <span
                    className={cn(
                      caballo.tipo === "PRIVADO" && "text-primary font-bold",
                    )}
                  >
                    {caballo.nombre}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-normal px-1.5 py-0.5 rounded-full",
                      caballo.tipo === "PRIVADO"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {caballo.tipo === "PRIVADO" ? "Privado" : "Escuela"}
                  </span>
                </div> */}
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
                const clase = claseMap.map[key];
                const esContinuacion =
                  !clase && !!claseMap.continuacionMap[key];
                const claseContinuacion = claseMap.continuacionMap[key];

                const conflictKey = `${dateKey}|${hora}|${caballo.id}`;
                const hasConflict = conflictSet.has(conflictKey);

                return (
                  <td
                    key={key}
                    className={cn(
                      "border border-border p-1 text-center transition-colors relative",
                      // Continuación de clase de 60min
                      esContinuacion && "bg-muted/20 border-dashed",
                      // Conflicto
                      !clase &&
                        !esContinuacion &&
                        hasConflict &&
                        "bg-red-100 border-red-400 hover:bg-red-200",
                      // Libre
                      !clase &&
                        !esContinuacion &&
                        !hasConflict &&
                        onCellClick &&
                        "cursor-cell hover:bg-primary/10",
                    )}
                    title={
                      esContinuacion
                        ? `Continúa clase de ${getNombreCompletoParaClase(claseContinuacion)} (60 min)`
                        : clase
                          ? `Clase ${clase.estado.toLowerCase()} con el instructor ${getInstructorNombre(clase.instructorId)}`
                          : `Agregar clase para ${caballo.nombre} a las ${hora}`
                    }
                    onDoubleClick={() => {
                      if (!clase && !esContinuacion && onCellClick) {
                        onCellClick(caballo, hora);
                      }
                    }}
                  >
                    {/* ⚠ Tooltip visual de conflicto */}
                    {!clase && !esContinuacion && hasConflict && (
                      <span
                        className="absolute top-1 right-1 text-[10px] text-red-600"
                        title="Conflicto de horario"
                      >
                        ⚠
                      </span>
                    )}

                    {/* Celda de continuación de clase 60 min */}
                    {/* Celda de continuación de clase 60 min — clickeable, mismo popover */}
                    {esContinuacion && claseContinuacion && (
                      <ClasePopover
                        clase={claseContinuacion}
                        trigger={
                          <div
                            className="relative opacity-80 cursor-pointer"
                            title={`Continúa hasta las ${(() => {
                              const [h, m] = claseContinuacion.hora
                                .slice(0, 5)
                                .split(":")
                                .map(Number);
                              const fin =
                                h * 60 + m + (claseContinuacion.duracion ?? 60);
                              return `${String(Math.floor(fin / 60)).padStart(2, "0")}:${String(fin % 60).padStart(2, "0")}`;
                            })()}`}
                          >
                            {claseContinuacion.esPrueba && (
                              <span
                                className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs shadow-sm border border-orange-600"
                                title="Clase de Prueba"
                              >
                                🎓
                              </span>
                            )}
                            {/* Badge igual al de inicio pero con borde izquierdo para indicar continuación */}
                            <ClaseBadge
                              clase={claseContinuacion}
                              alumnoNombre={getNombreCompletoParaClase(
                                claseContinuacion,
                              )}
                              instructorColor={getInstructorColor(
                                claseContinuacion.instructorId,
                              )}
                            />
                          </div>
                        }
                        alumnoNombre={getNombreCompletoParaClase(
                          claseContinuacion,
                        )}
                        instructorNombre={getInstructorNombre(
                          claseContinuacion.instructorId,
                        )}
                        caballoNombre={getCaballoNombre(
                          claseContinuacion.caballoId,
                        )}
                        onStatusChange={onStatusChange}
                        onEdit={onEditClase!}
                        onDelete={onDeleteClase!}
                        puedeEditar={
                          puedeEditarClase
                            ? puedeEditarClase(claseContinuacion)
                            : true
                        }
                        open={popoverOpen === `${key}-cont`}
                        onOpenChange={(open) =>
                          setPopoverOpen(open ? `${key}-cont` : null)
                        }
                      />
                    )}

                    {/* Celda con clase (inicio) */}
                    {clase && (
                      <ClasePopover
                        clase={clase}
                        trigger={
                          <div className="relative">
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
                              alumnoNombre={getNombreCompletoParaClase(clase)}
                              instructorColor={getInstructorColor(
                                clase.instructorId,
                              )}
                            />
                          </div>
                        }
                        alumnoNombre={getNombreCompletoParaClase(clase)}
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
                    )}

                    {/* Celda vacía */}
                    {!clase && !esContinuacion && (
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
