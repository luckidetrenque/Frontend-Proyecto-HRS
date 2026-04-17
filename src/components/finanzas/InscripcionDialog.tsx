import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Calculator, 
  CreditCard, 
  User as UserIcon, 
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "@/components/ui/switch";
import { 
  abonosApi, 
  caballosApi, 
  Alumno, 
  InscripcionRequest, 
  PrecioCalculado 
} from "@/lib/api";
import { ModalidadClase, TipoClase, FormaPago, TipoPension } from "@/types/enums";

interface InscripcionDialogProps {
  alumno: Alumno;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InscripcionDialog({ alumno, isOpen, onOpenChange }: InscripcionDialogProps) {
  const queryClient = useQueryClient();
  const [isSocio, setIsSocio] = useState(false);
  const [modalidad, setModalidad] = useState<ModalidadClase>("SEMANA");
  const [tipoClase, setTipoClase] = useState<TipoClase | undefined>(undefined);
  const [cantidadClases, setCantidadClases] = useState(4);
  const [tipoPension, setTipoPension] = useState<TipoPension>(alumno.tipoPension || "SIN_CABALLO");
  const [caballoId, setCaballoId] = useState<number | undefined>(alumno.caballoId || undefined);
  const [formaPago, setFormaPago] = useState<FormaPago>("EFECTIVO");
  
  const [presupuesto, setPresupuesto] = useState<PrecioCalculado | null>(null);

  // Calcular edad
  const calcularEdad = (fechaNac: string) => {
    if (!fechaNac) return 0;
    const birthDate = new Date(fechaNac);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Caballos query
  const { data: caballosData } = useQuery({
    queryKey: ["caballos-disponibles"],
    queryFn: () => caballosApi.listar({ page: 0, size: 100, sort: "nombre,asc", disponible: true }),
  });
  const caballos = caballosData?.content || [];

  const requestBody: InscripcionRequest = {
    alumnoId: alumno.id,
    edad: calcularEdad(alumno.fechaNacimiento),
    esSocio: isSocio,
    modalidad,
    tipoClase,
    cantidadClases,
    tipoPension,
    caballoId,
    formaPago,
    fechaPago: format(new Date(), "yyyy-MM-dd"),
  };

  // Mutación para calcular precio
  const calcularMutation = useMutation({
    mutationFn: (data: InscripcionRequest) => abonosApi.calcularPrecio(data),
    onSuccess: (data) => setPresupuesto(data),
    onError: (error: Error) => {
      setPresupuesto(null);
      toast.error("Error al calcular presupuesto: " + error.message);
    }
  });

  // Mutación para crear abono
  const inscribirMutation = useMutation({
    mutationFn: (data: InscripcionRequest) => abonosApi.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumno", alumno.id] });
      queryClient.invalidateQueries({ queryKey: ["mi-abono", alumno.id] });
      toast.success("Alumno inscripto correctamente");
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Recalcular presupuesto cuando cambian los valores clave
  useEffect(() => {
    if (isOpen) {
      calcularMutation.mutate(requestBody);
    }
  }, [isSocio, modalidad, tipoClase, cantidadClases, tipoPension, caballoId, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inscribirMutation.mutate(requestBody);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Nueva Inscripción (Activar Abono)
          </DialogTitle>
          <DialogDescription>
            Configurá el plan mensual para {alumno.nombre} {alumno.apellido}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Clase</Label>
              <Select value={tipoClase} onValueChange={(v: TipoClase) => setTipoClase(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Automático (por edad)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ESCUELA_MAYOR_6">Escuela (+6 años)</SelectItem>
                  <SelectItem value="ESCUELA_MENOR_6">Escuela (-6 años)</SelectItem>
                  <SelectItem value="EQUINOTERAPIA">Equinoterapia</SelectItem>
                  <SelectItem value="PENSIONADOS_PRIVADOS">Pensionados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Modalidad</Label>
              <Select value={modalidad} onValueChange={(v: ModalidadClase) => setModalidad(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SESION">Por Sesión</SelectItem>
                  <SelectItem value="SEMANA">Días de Semana</SelectItem>
                  <SelectItem value="SABADOS">Sábados</SelectItem>
                  <SelectItem value="SEMANA_SABADOS">Semana y Sábados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Clases por Mes</Label>
              <Select value={String(cantidadClases)} onValueChange={(v) => setCantidadClases(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (Solo Sesión)</SelectItem>
                  <SelectItem value="4">4 (1 por semana)</SelectItem>
                  <SelectItem value="8">8 (2 por semana)</SelectItem>
                  <SelectItem value="12">12 (3 por semana)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Forma de Pago Inicial</Label>
              <Select value={formaPago} onValueChange={(v: FormaPago) => setFormaPago(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                  <SelectItem value="TARJETA">Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Pensión</Label>
              <Select value={tipoPension} onValueChange={(v: TipoPension) => setTipoPension(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SIN_CABALLO">Sin Caballo (Escuela)</SelectItem>
                  <SelectItem value="RESERVA_ESCUELA">Reserva Escuela</SelectItem>
                  <SelectItem value="CABALLO_PROPIO">Caballo Propio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Caballo</Label>
              <Select 
                value={String(caballoId || "")} 
                onValueChange={(v) => setCaballoId(v ? Number(v) : undefined)}
                disabled={tipoPension === "SIN_CABALLO"}
              >
                <SelectTrigger>
                  <SelectValue placeholder={tipoPension === "SIN_CABALLO" ? "No requiere" : "Seleccionar"} />
                </SelectTrigger>
                <SelectContent>
                  {caballos.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div className="space-y-0.5">
              <Label className="text-base">¿Es Socio?</Label>
              <p className="text-xs text-muted-foreground">Aplica descuento de cuota social.</p>
            </div>
            <Switch checked={isSocio} onCheckedChange={setIsSocio} />
          </div>

          {/* Resumen del Presupuesto */}
          {presupuesto && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="h-3 w-3" />
                Resumen de Cuota Mensual
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Arancel Clases:</span>
                  <span>${(presupuesto.subtotalClases ?? 0).toLocaleString()}</span>
                </div>
                {presupuesto.subtotalPension > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pensión:</span>
                    <span>${(presupuesto.subtotalPension ?? 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1 font-bold mt-2">
                  <span>Total Mensual:</span>
                  <span className="text-lg text-primary">${(presupuesto.total ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg flex gap-2 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Al confirmar, se creará el abono activo y la primera factura por el monto total. El alumno podrá empezar a reservar clases inmediatamente.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={inscribirMutation.isPending || !presupuesto}>
              Confirmar Inscripción
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
