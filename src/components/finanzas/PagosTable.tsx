import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Search,
  Receipt,
  Download
} from "lucide-react";
import { useState } from "react";

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
import { pagosApi, Pago } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export function PagosTable() {
  const [filter, setFilter] = useState("");

  // Queries - Listar pagos generales
  // Nota: El PagoController tiene listarPagosPorAlumno y listarPagosPorFactura.
  // Vamos a asumir que el admin ve los últimos pagos registrados.
  const { data: pagos, isLoading } = useQuery({
    queryKey: ["pagos-recientes"],
    queryFn: () => pagosApi.listar(),
  });

  const filteredPagos = pagos?.filter(p => 
    p.alumnoNombre?.toLowerCase().includes(filter.toLowerCase()) ||
    p.facturaNumero?.toLowerCase().includes(filter.toLowerCase()) ||
    p.numeroComprobante?.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  const getFormaPagoBadge = (forma: string) => {
    switch (forma) {
      case "EFECTIVO":
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">Efectivo</Badge>;
      case "TRANSFERENCIA":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Transferencia</Badge>;
      case "TARJETA":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">Tarjeta</Badge>;
      default:
        return <Badge variant="secondary">{forma}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por alumno, factura o comprobante..."
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
              <TableHead>Fecha</TableHead>
              <TableHead>Alumno</TableHead>
              <TableHead>Factura</TableHead>
              <TableHead>Forma de Pago</TableHead>
              <TableHead>Comprobante</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Cargando historial de pagos...
                </TableCell>
              </TableRow>
            ) : filteredPagos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No se registraron pagos recientemente.
                </TableCell>
              </TableRow>
            ) : (
              filteredPagos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{format(new Date(p.fechaPago), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="font-medium">{p.alumnoNombre}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Receipt className="h-3 w-3" />
                      {p.facturaNumero}
                    </div>
                  </TableCell>
                  <TableCell>{getFormaPagoBadge(p.formaPago)}</TableCell>
                  <TableCell className="text-sm font-mono">{p.numeroComprobante || "—"}</TableCell>
                  <TableCell className="text-right font-bold text-success">
                    ${p.monto.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
