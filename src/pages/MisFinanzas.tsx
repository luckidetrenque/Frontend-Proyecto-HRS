import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  CreditCard, 
  History, 
  Receipt, 
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { abonosApi, facturasApi, pagosApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function MisFinanzas() {
  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const alumnoId = user?.alumnoId;

  // Queries
  const { data: abonoActivo, isLoading: loadingAbono } = useQuery({
    queryKey: ["mi-abono", alumnoId],
    queryFn: () => abonosApi.obtenerActivo(alumnoId),
    enabled: !!alumnoId,
  });

  const { data: facturas, isLoading: loadingFacturas } = useQuery({
    queryKey: ["mis-facturas", alumnoId],
    queryFn: () => facturasApi.listarPorAlumno(alumnoId),
    enabled: !!alumnoId,
  });

  const { data: pagos, isLoading: loadingPagos } = useQuery({
    queryKey: ["mis-pagos", alumnoId],
    queryFn: () => pagosApi.listarPorAlumno(alumnoId),
    enabled: !!alumnoId,
  });

  const porcClases = abonoActivo 
    ? (abonoActivo.clasesRestantes / abonoActivo.planClases) * 100 
    : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader 
          title="Mis Finanzas" 
          description="Consultá el estado de tu abono, facturas pendientes e historial de pagos."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {/* Tarjeta de Abono Activo */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Mi Abono Activo</CardTitle>
                <CardDescription>Detalles de tu pase de clases vigente</CardDescription>
              </div>
              <CreditCard className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="pt-4">
              {loadingAbono ? (
                <p className="text-sm text-muted-foreground">Cargando...</p>
              ) : abonoActivo ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-3xl font-bold">{abonoActivo.clasesRestantes} <span className="text-lg font-normal text-muted-foreground">/ {abonoActivo.planClases}</span></p>
                      <p className="text-sm text-muted-foreground">Clases restantes</p>
                    </div>
                    <div className="text-right">
                      <Badge className={abonoActivo.estado === "ACTIVO" ? "bg-success" : "bg-amber-500"}>
                        {abonoActivo.estado}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Vence el {format(new Date(abonoActivo.fechaVencimiento), "dd/MM/yyyy")}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Progreso del abono</span>
                      <span>{Math.round(porcClases)}% disponible</span>
                    </div>
                    <Progress value={porcClases} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t text-sm">
                    <div>
                      <p className="text-muted-foreground">Tipo de Pensión</p>
                      <p className="font-medium">{abonoActivo.planPension?.replace(/_/g, " ") || "Sin Pensión"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Caballo</p>
                      <p className="font-medium">{abonoActivo.caballoNombre || "Sin asignar"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center border-2 border-dashed rounded-lg">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No tenés un abono activo en este momento.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumen de Deuda */}
          <Card>
            <CardHeader>
              <CardTitle>Total Pendiente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive mb-1">
                ${facturas?.reduce((acc, f) => acc + (f.saldoPendiente ?? 0), 0).toLocaleString() || "0"}
              </div>
              <p className="text-sm text-muted-foreground mb-4">Monto total de facturas impagas</p>
              <div className="space-y-2">
                {facturas?.filter(f => (f.saldoPendiente ?? 0) > 0).slice(0, 2).map(f => (
                  <div key={f.id} className="flex justify-between text-xs border-b pb-1">
                    <span>Factura {f.numeroFactura || f.numero}</span>
                    <span className="font-bold">${(f.saldoPendiente ?? 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="facturas" className="w-full">
          <TabsList>
            <TabsTrigger value="facturas" className="gap-2">
              <Receipt className="h-4 w-4" />
              Facturas
            </TabsTrigger>
            <TabsTrigger value="pagos" className="gap-2">
              <History className="h-4 w-4" />
              Historial de Pagos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="facturas" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {loadingFacturas ? (
                    <p className="text-center py-4">Cargando...</p>
                  ) : facturas?.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No se encontraron facturas.</p>
                  ) : (
                    facturas?.map(f => (
                      <div key={f.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${f.estado === "PAGADA" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                            {f.estado === "PAGADA" ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-bold">Factura {f.numeroFactura || f.numero}</p>
                            <p className="text-xs text-muted-foreground">Emitida: {format(new Date(f.fechaEmision), "dd MMM yyyy")}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${(f.total ?? f.montoTotal ?? 0).toLocaleString()}</p>
                          <Badge variant={f.estado === "PAGADA" ? "outline" : "destructive"} className="text-[10px] h-4">
                            {f.estado}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pagos" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                 <div className="space-y-4">
                  {loadingPagos ? (
                    <p className="text-center py-4">Cargando...</p>
                  ) : pagos?.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No has realizado pagos aún.</p>
                  ) : (
                    pagos?.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-primary/10 text-primary">
                            <History className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold">Pago ${p.monto.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(p.fechaPago), "dd/MM/yyyy")} • {p.formaPago}</p>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {p.numeroComprobante && <p>Cpbte: {p.numeroComprobante}</p>}
                          <p>Asociado a: {p.facturaNumero}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
