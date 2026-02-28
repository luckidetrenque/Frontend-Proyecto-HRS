import {
  AlertCircle,
  ChessKnight,
  Clock,
  GraduationCap,
  NotebookPen,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Clase } from "@/lib/api";

import {
  ESTADO_STYLES,
  ESTADOS,
  MOTIVOS_CANCELACION,
} from "./clases.constants";

interface ClasePopoverProps {
  clase: Clase;
  trigger: React.ReactNode;
  alumnoNombre: string;
  instructorNombre: string;
  caballoNombre: string;
  onStatusChange: (
    claseId: number,
    newStatus: Clase["estado"],
    observaciones: string,
  ) => void;
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
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<string>("");
  const [observacionesPersonalizadas, setObservacionesPersonalizadas] =
    useState<string>("");

  const handleDelete = () => {
    onDelete(clase.id);
    setShowDeleteDialog(false);
    if (onOpenChange) onOpenChange(false);
  };

  const handleEdit = () => {
    if (onOpenChange) onOpenChange(false);
    onEdit(clase);
  };

  const handleStatusClick = (estado: Clase["estado"]) => {
    // Si el estado es CANCELADA, mostrar el formulario de motivo
    if (estado === "CANCELADA") {
      setShowCancelForm(true);
      return;
    }

    // Para otros estados, cambiar directamente
    onStatusChange(clase.id, estado, "");
    if (onOpenChange) onOpenChange(false);
  };

  const handleConfirmCancel = () => {
    const observacionFinal =
      motivoSeleccionado === "Otro"
        ? observacionesPersonalizadas
        : motivoSeleccionado;

    onStatusChange(clase.id, "CANCELADA", observacionFinal);

    // Resetear el formulario
    setShowCancelForm(false);
    setMotivoSeleccionado("");
    setObservacionesPersonalizadas("");

    if (onOpenChange) onOpenChange(false);
  };

  const handleCancelForm = () => {
    setShowCancelForm(false);
    setMotivoSeleccionado("");
    setObservacionesPersonalizadas("");
  };

  return (
    <>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="center" sideOffset={5}>
          <div className="p-4">
            {!showCancelForm ? (
              <>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="font-semibold">Detalles de la Clase</h4>
                </div>

                {/* Alerta de clase de prueba */}
                {clase.esPrueba && (
                  <div className="mb-3 rounded-md bg-orange-50 border border-orange-200 p-2.5 text-xs text-orange-800">
                    <div className="flex items-start gap-2">
                      <GraduationCap className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="font-semibold">
                          Clase de Prueba
                        </strong>
                        <p className="mt-1 text-orange-700">
                          Esta clase no cuenta como clase regular del alumno.
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
                  {clase.alumnoId !== 1 && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{alumnoNombre}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{instructorNombre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChessKnight className="h-4 w-4 text-muted-foreground" />
                    <span>{caballoNombre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <NotebookPen className="h-4 w-4 text-muted-foreground" />
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
                      onClick={handleEdit}
                      disabled={!puedeEditar}
                      className={
                        !puedeEditar ? "opacity-50 cursor-not-allowed" : ""
                      }
                      title={
                        !puedeEditar
                          ? "No se puede editar una clase finalizada"
                          : "Editar clase"
                      }
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>

                    {/* Botón Eliminar */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={!puedeEditar}
                      className={
                        !puedeEditar
                          ? "opacity-50 cursor-not-allowed text-muted"
                          : "text-destructive"
                      }
                      title={
                        !puedeEditar
                          ? "No se puede eliminar una clase finalizada"
                          : "Eliminar clase"
                      }
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
                          variant="outline"
                          size="sm"
                          className={`text-xs transition-colors ${
                            clase.estado === estado
                              ? ESTADO_STYLES[estado]
                              : "text-muted-foreground opacity-50"
                          }`}
                          onClick={() => handleStatusClick(estado)}
                        >
                          {estado}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Formulario de cancelación
              <div className="space-y-4">
                <div className="border-b border-border pb-3">
                  <h4 className="font-semibold">Cancelar Clase</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selecciona el motivo de la cancelación
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="motivo-cancelacion">Motivo</Label>
                    <Select
                      value={motivoSeleccionado}
                      onValueChange={setMotivoSeleccionado}
                    >
                      <SelectTrigger id="motivo-cancelacion">
                        <SelectValue placeholder="Seleccionar motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOTIVOS_CANCELACION.map((motivo) => (
                          <SelectItem key={motivo} value={motivo}>
                            {motivo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {motivoSeleccionado === "Otro" && (
                    <div className="space-y-2">
                      <Label htmlFor="observaciones-personalizadas">
                        Observaciones
                      </Label>
                      <Textarea
                        id="observaciones-personalizadas"
                        placeholder="Ingrese el motivo de cancelación..."
                        value={observacionesPersonalizadas}
                        onChange={(e) =>
                          setObservacionesPersonalizadas(e.target.value)
                        }
                        rows={3}
                      />
                    </div>
                  )}

                  {motivoSeleccionado && motivoSeleccionado !== "Otro" && (
                    <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                      <strong>Observaciones:</strong> {motivoSeleccionado}
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancelForm}
                    className="w-full sm:w-auto"
                  >
                    Volver
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleConfirmCancel}
                    disabled={
                      !motivoSeleccionado ||
                      (motivoSeleccionado === "Otro" &&
                        !observacionesPersonalizadas.trim())
                    }
                    className="w-full sm:w-auto"
                  >
                    Confirmar Cancelación
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Diálogo de Confirmación de Eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Eliminar Clase
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta clase? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <div className="rounded-md bg-muted p-3 text-sm">
              <p>
                <strong>Alumno:</strong> {alumnoNombre}
              </p>
              <p>
                <strong>Hora:</strong> {clase.hora.slice(0, 5)}
              </p>
              <p>
                <strong>Caballo:</strong> {caballoNombre}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
