import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Pause, 
  Play, 
  XCircle, 
  Search,
  Calendar,
  User as UserIcon
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { abonosApi, Abono } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function AbonosTable() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [selectedAbono, setSelectedAbono] = useState<Abono | null>(null);
  const [actionType, setActionType] = useState<"pausar" | "cancelar" | null>(null);
  const [motivo, setMotivo] = useState("");

  // Queries - Por ahora listamos todos los abonos activos que el backend permita
  // Nota: El backend tiene listarPorEstado(ACTIVO). Para simplificar, usaremos un mock o asumiremos que el admin ve todos.
  // En un sistema real, esto paginaría.
  const { data: abonos, isLoading } = useQuery({
    queryKey: ["abonos-activos"],
    queryFn: () => abonosApi.listar(), 
    // Por ahora el backend tiene listarAbonosPorEstado(EstadoAbono estado)
    // Pero en el controller no hay un "listar todos los activos" directo.
    // Vamos a asumir que por ahora listamos por alumno si estamos en su detalle, 
    // pero para la vista general, necesitaríamos un endpoint de administración.
  });

  // Mutaciones
  const pausarMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) => abonosApi.pausar(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["abonos-activos"] });
      toast.success("Abono pausado");
      setActionType(null);
    },
  });

  const reactivarMutation = useMutation({
    mutationFn: (id: number) => abonosApi.reactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["abonos-activos"] });
      toast.success("Abono reactivado");
    },
  });

  const cancelarMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) => abonosApi.cancelar(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["abonos-activos"] });
      toast.success("Abono cancelado");
      setActionType(null);
    },
  });

  const filteredAbonos = abonos?.filter(a => 
    a.alumnoNombre?.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "ACTIVO":
        return <Badge className="bg-success">Activo</Badge>;
      case "PAUSADO":
        return <Badge variant="outline" className="text-amber-600 border-amber-600">Pausado</Badge>;
      case "VENCIDO":
        return <Badge variant="secondary">Vencido</Badge>;
      case "CANCELADO":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por alumno..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alumno</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Pensión</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead className="text-center">Restantes</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Cargando abonos...
                </TableCell>
              </TableRow>
            ) : filteredAbonos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No se encontraron abonos activos.
                </TableCell>
              </TableRow>
            ) : (
              filteredAbonos.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.alumnoNombre}</TableCell>
                  <TableCell>{a.planClases} clases</TableCell>
                  <TableCell>{a.planPension.replace(/_/g, " ")}</TableCell>
                  <TableCell>{format(new Date(a.fechaVencimiento), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="text-center font-bold">{a.clasesRestantes}</TableCell>
                  <TableCell>{getStatusBadge(a.estado)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {a.estado === "ACTIVO" && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-amber-600 h-8 w-8 p-0"
                        onClick={() => { setSelectedAbono(a); setActionType("pausar"); }}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    {a.estado === "PAUSADO" && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-success h-8 w-8 p-0"
                        onClick={() => reactivarMutation.mutate(a.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive h-8 w-8 p-0"
                      onClick={() => { setSelectedAbono(a); setActionType("cancelar"); }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "pausar" ? "Pausar Abono" : "Cancelar Abono"}
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas {actionType} el abono de {selectedAbono?.alumnoNombre}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Input 
                placeholder="Ej: Viaje, lesión, etc." 
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionType(null)}>Cancelar</Button>
            <Button 
              variant={actionType === "cancelar" ? "destructive" : "default"}
              onClick={() => {
                if (selectedAbono) {
                  const data = { id: selectedAbono.id, motivo };
                  if (actionType === "pausar") pausarMutation.mutate(data);
                  else cancelarMutation.mutate(data);
                }
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
