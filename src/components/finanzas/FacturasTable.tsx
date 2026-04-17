import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  DollarSign, 
  Eye, 
  Search,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { facturasApi, pagosApi, Factura, RegistrarPagoRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export function FacturasTable() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // Queries
  const { data: facturas, isLoading } = useQuery({
    queryKey: ["facturas-pendientes"],
    queryFn: () => facturasApi.listarPendientes(),
  });

  // Mutaciones
  const registrarPagoMutation = useMutation({
    mutationFn: (data: RegistrarPagoRequest) => pagosApi.registrar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facturas-pendientes"] });
      queryClient.invalidateQueries({ queryKey: ["finanzas"] });
      toast.success("Pago registrado correctamente");
      setIsPaymentDialogOpen(false);
      setSelectedFactura(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar el pago");
    },
  });

  const filteredFacturas = facturas?.filter(f => {
    const searchLower = filter.toLowerCase();
    const alumnoMatch = f.alumnoNombre?.toLowerCase().includes(searchLower);
    // El backend usa numeroFactura, el frontend a veces busca numero. Soportamos ambos.
    const numero = f.numeroFactura || f.numero || "";
    const numeroMatch = numero.toLowerCase().includes(searchLower);
    return alumnoMatch || numeroMatch;
  }) || [];

  const handleOpenPayment = (factura: Factura) => {
    setSelectedFactura(factura);
    setIsPaymentDialogOpen(true);
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "PAGADA":
        return <Badge className="bg-success">Pagada</Badge>;
      case "PARCIAL":
        return <Badge variant="outline" className="text-amber-600 border-amber-600">Parcial</Badge>;
      case "PENDIENTE":
        return <Badge variant="destructive">Pendiente</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por alumno o número..."
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
              <TableHead>Número</TableHead>
              <TableHead>Alumno</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Cargando facturas...
                </TableCell>
              </TableRow>
            ) : filteredFacturas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No se encontraron facturas pendientes.
                </TableCell>
              </TableRow>
            ) : (
              filteredFacturas.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.numeroFactura || f.numero}</TableCell>
                  <TableCell>{f.alumnoNombre}</TableCell>
                  <TableCell>{f.fechaVencimiento ? format(new Date(f.fechaVencimiento), "dd/MM/yyyy") : "—"}</TableCell>
                  <TableCell className="text-right">${(f.total ?? f.montoTotal ?? 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold text-destructive">
                    ${(f.saldoPendiente ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(f.estado)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleOpenPayment(f)}
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                      Pagar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de Pago */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              Ingresá los detalles del pago para la factura {selectedFactura?.numero}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedFactura && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data: RegistrarPagoRequest = {
                facturaId: selectedFactura.id,
                fechaPago: format(new Date(), "yyyy-MM-dd"),
                monto: Number(formData.get("monto")),
                formaPago: formData.get("formaPago") as any,
                numeroComprobante: formData.get("comprobante") as string,
                observaciones: formData.get("observaciones") as string,
              };
              registrarPagoMutation.mutate(data);
            }} className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="monto" className="text-right">Monto</Label>
                <Input 
                  id="monto" 
                  name="monto" 
                  type="number" 
                  defaultValue={selectedFactura.saldoPendiente}
                  max={selectedFactura.saldoPendiente} 
                  required
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="formaPago" className="text-right">F. Pago</Label>
                <Select name="formaPago" defaultValue="EFECTIVO" required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar forma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                    <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                    <SelectItem value="TARJETA">Tarjeta</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="comprobante" className="text-right">Cpbte.</Label>
                <Input id="comprobante" name="comprobante" placeholder="Opcional" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observaciones" className="text-right">Obs.</Label>
                <Input id="observaciones" name="observaciones" placeholder="Opcional" className="col-span-3" />
              </div>
              
              <div className="bg-muted p-3 rounded-lg flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <p>El pago se aplicará a la factura seleccionada y el saldo se actualizará automáticamente.</p>
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsPaymentDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={registrarPagoMutation.isPending}>
                  Confirmar Pago
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
