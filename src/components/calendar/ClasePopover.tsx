/**
 * ClasePopover.tsx
 * Popover con detalles de la clase (compartido entre vistas)
 * ✅ Con soporte para clases de prueba
 */

import {
  CalendarDays,
  Clock,
  Edit,
  GraduationCap,
  Landmark,
  Pencil,
  Trash2,
  User,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StatusBadge } from "@/components/ui/status-badge";
import { Clase } from "@/lib/api";

import { ESTADO_COLORS, ESTADOS } from "./calendar.styles";

interface ClasePopoverProps {
  clase: Clase;
  trigger: React.ReactNode;
  alumnoNombre: string;
  instructorNombre: string;
  caballoNombre: string;
  onStatusChange: (claseId: number, newStatus: Clase["estado"]) => void;
  onEdit: (clase: Clase) => void;
  onDelete: (claseId: number) => void;
  puedeEditar?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ClasePopover({
  clase,
  trigger,
  alumnoNombre,
  instructorNombre,
  caballoNombre,
  onStatusChange,
  onEdit,
  onDelete,
  puedeEditar = true,
  open,
  onOpenChange,
}: ClasePopoverProps) {
  const handleDelete = () => {
    if (onOpenChange) onOpenChange(false);
    if (confirm("¿Estás seguro de que deseas eliminar esta clase?")) {
      onDelete(clase.id);
    }
  };

  const handleEdit = () => {
    if (onOpenChange) onOpenChange(false);
    onEdit(clase);
  };

  const handleStatusClick = (estado: Clase["estado"]) => {
    onStatusChange(clase.id, estado);
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="center" sideOffset={5}>
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h4 className="font-semibold">Detalles de la Clase</h4>
            <div className="flex items-center gap-2">
              {/* ✅ Badge de clase de prueba */}
              {clase.esPrueba && (
                <StatusBadge status="warning">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Prueba
                </StatusBadge>
              )}
              <StatusBadge status={ESTADO_COLORS[clase.estado]}>
                {clase.estado}
              </StatusBadge>
            </div>
          </div>

          {/* ✅ Alerta de clase de prueba */}
          {clase.esPrueba && (
            <div className="mb-3 rounded-md bg-orange-50 border border-orange-200 p-2.5 text-xs text-orange-800">
              <div className="flex items-start gap-2">
                <GraduationCap className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="font-semibold">Clase de Prueba</strong>
                  <p className="mt-1 text-orange-700">
                    Esta clase no cuenta como clase regular del alumno. El
                    alumno debe estar inactivo.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{clase.hora.slice(0, 5)}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{alumnoNombre}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span>{instructorNombre}</span>
            </div>
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-muted-foreground" />
              <span>{caballoNombre}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>{clase.especialidad}</span>
            </div>
            {clase.observaciones && (
              <div className="mt-2 rounded-md bg-muted p-2 text-xs">
                <strong>Observaciones:</strong> {clase.observaciones}
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="mt-4 border-t border-border pt-4 space-y-3">
            <div className="flex gap-2">
              {/* Botón Editar */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onEdit(clase);
                  onOpenChange?.(false);
                }}
                disabled={!puedeEditar} // ✅ AGREGAR disabled
                className={!puedeEditar ? "opacity-50 cursor-not-allowed" : ""} // ✅ AGREGAR className
                title={
                  !puedeEditar
                    ? "No se puede editar una clase finalizada"
                    : "Editar clase"
                } // ✅ AGREGAR title
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>

              {/* Botón Eliminar */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm("¿Eliminar esta clase?")) {
                    onDelete(clase.id);
                    onOpenChange?.(false);
                  }
                }}
                disabled={!puedeEditar} // ✅ AGREGAR disabled
                className={
                  !puedeEditar
                    ? "opacity-50 cursor-not-allowed text-muted"
                    : "text-destructive"
                } // ✅ MODIFICAR className
                title={
                  !puedeEditar
                    ? "No se puede eliminar una clase finalizada"
                    : "Eliminar clase"
                } // ✅ AGREGAR title
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </div>

            <div>
              <Label className="mb-2 block text-xs text-muted-foreground">
                Cambio Rápido de Estado
              </Label>
              <div className="flex flex-wrap gap-1">
                {ESTADOS.map((estado) => (
                  <Button
                    key={estado}
                    variant={clase.estado === estado ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleStatusClick(estado)}
                  >
                    {estado}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
