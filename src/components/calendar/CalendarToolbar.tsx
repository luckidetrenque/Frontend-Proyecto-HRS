/**
 * CalendarToolbar.tsx
 * Barra de herramientas con todos los botones de acción del calendario
 * Incluye: Exportar Excel, Cancelar Día, Copiar Clases, Eliminar Clases
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardCopy,
  Eraser,
  Download,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { MOTIVOS_CANCELACION } from "./calendar.styles";

interface CalendarToolbarProps {
  // Copiar Clases
  isCopyOpen: boolean;
  onCopyOpenChange: (open: boolean) => void;
  onCopySubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  copyPending: boolean;

  // Eliminar Clases
  isDeleteOpen: boolean;
  onDeleteOpenChange: (open: boolean) => void;
  onDeleteSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  deletePending: boolean;

  // Exportar Excel
  onExportExcel?: () => void;
  showExport?: boolean;

  // Cancelar Día
  onCancelDay?: (observaciones: string) => void;
  showCancelDay?: boolean;
  cancelDayCount?: number;
  cancelDayDate?: string;
}

export function CalendarToolbar({
  isCopyOpen,
  onCopyOpenChange,
  onCopySubmit,
  copyPending,
  isDeleteOpen,
  onDeleteOpenChange,
  onDeleteSubmit,
  deletePending,
  onExportExcel,
  showExport = false,
  onCancelDay,
  showCancelDay = false,
  cancelDayCount = 0,
  cancelDayDate = "",
}: CalendarToolbarProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<string>("");
  const [observacionesPersonalizadas, setObservacionesPersonalizadas] =
    useState<string>("");

  const handleCancelarDia = () => {
    if (!onCancelDay) return;

    const observacionFinal =
      motivoSeleccionado === "Otro"
        ? observacionesPersonalizadas
        : motivoSeleccionado;

    onCancelDay(observacionFinal);
    setIsCancelDialogOpen(false);
    setMotivoSeleccionado("");
    setObservacionesPersonalizadas("");
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {/* Exportar Excel */}
      {showExport && onExportExcel && (
        <Button variant="outline" size="sm" onClick={onExportExcel}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
      )}

      {/* Cancelar Día */}
      {showCancelDay && onCancelDay && (
        <>
          <Button
            variant="outline"
            size="sm"
            disabled={cancelDayCount === 0}
            className="border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={() => setIsCancelDialogOpen(true)}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancelar Día ({cancelDayCount})
          </Button>

          {/* Diálogo Cancelar Día */}
          <Dialog
            open={isCancelDialogOpen}
            onOpenChange={setIsCancelDialogOpen}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Cancelar todas las clases del día
                </DialogTitle>
                <DialogDescription>
                  Se cancelarán {cancelDayCount} clase
                  {cancelDayCount !== 1 ? "s" : ""} programada
                  {cancelDayCount !== 1 ? "s" : ""} para el {cancelDayDate}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo de cancelación</Label>
                  <Select
                    value={motivoSeleccionado}
                    onValueChange={setMotivoSeleccionado}
                  >
                    <SelectTrigger>
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
                    <Label htmlFor="observaciones">
                      Observaciones personalizadas
                    </Label>
                    <Textarea
                      id="observaciones"
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
                  <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                    <strong>Observaciones:</strong> {motivoSeleccionado}
                  </div>
                )}
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCancelDialogOpen(false);
                    setMotivoSeleccionado("");
                    setObservacionesPersonalizadas("");
                  }}
                >
                  Volver
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleCancelarDia}
                  disabled={
                    !motivoSeleccionado ||
                    (motivoSeleccionado === "Otro" &&
                      !observacionesPersonalizadas.trim())
                  }
                >
                  Confirmar Cancelación
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Copiar Clases */}
      <Dialog open={isCopyOpen} onOpenChange={onCopyOpenChange}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCopyOpenChange(true)}
        >
          <ClipboardCopy className="mr-2 h-4 w-4" />
          Copiar Clases
        </Button>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={onCopySubmit}>
            <DialogHeader>
              <DialogTitle className="font-display">
                Selecciona las semanas a copiar
              </DialogTitle>
              <DialogDescription>
                Indica un día de la semana que quieres copiar y el día
                equivalente de la semana destino.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inicioOri">Día de origen</Label>
                  <Input id="inicioOri" name="inicioOri" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inicioDes">Día de destino</Label>
                  <Input id="inicioDes" name="inicioDes" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cantidadSemanas">Cantidad de semanas</Label>
                  <Input
                    id="cantidadSemanas"
                    name="cantidadSemanas"
                    type="number"
                    min={1}
                    defaultValue={1}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={copyPending}>
                {copyPending ? "Copiando..." : "Copiar clases"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Eliminar Clases */}
      <Dialog open={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
        <Button
          variant="outline"
          size="sm"
          className="border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={() => onDeleteOpenChange(true)}
        >
          <Eraser className="mr-2 h-4 w-4" />
          Eliminar Clases
        </Button>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={onDeleteSubmit}>
            <DialogHeader>
              <DialogTitle className="font-display">
                Selecciona las clases a eliminar
              </DialogTitle>
              <DialogDescription>
                Indica el día de inicio y fin de las clases a eliminar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inicioOri">Día de origen</Label>
                  <Input id="inicioOri" name="inicioOri" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inicioDes">Día de destino</Label>
                  <Input id="inicioDes" name="inicioDes" type="date" required />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={deletePending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/70"
              >
                {deletePending ? "Eliminando..." : "Eliminar clases"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
