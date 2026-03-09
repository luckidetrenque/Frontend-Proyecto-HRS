import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endOfMonth, format, startOfMonth } from "date-fns";
import {
  BarChart3,
  ChessKnight,
  ChevronRight,
  CircleDollarSign,
  Download,
  GraduationCap,
  Pencil,
  Save,
  TrendingDown,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { finanzasApi } from "@/lib/api";

// ─── Paleta de colores ────────────────────────────────────────────────────────
const COLORS = {
  ingreso: "#22C55E",
  egreso: "#EF4444",
  balance: "#3B82F6",
  plan4: "#F59E0B",
  plan8: "#3B82F6",
  plan12: "#22C55E",
  plan16: "#8B5CF6",
  pension: "#EC4899",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPeso = (v: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(v);

const PLAN_COLORS: Record<number, string> = {
  4: COLORS.plan4,
  8: COLORS.plan8,
  12: COLORS.plan12,
  16: COLORS.plan16,
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    fill?: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-md text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}:{" "}
          <span className="font-medium">{formatPeso(Number(p.value))}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function FinanzasPage() {
  const queryClient = useQueryClient();

  const [dateRange, setDateRange] = useState({
    inicio: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    fin: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: resumen, isLoading: loadingResumen } = useQuery({
    queryKey: ["finanzas-resumen", dateRange],
    queryFn: () => finanzasApi.getResumen(dateRange.inicio, dateRange.fin),
  });

  const { data: cuotas, isLoading: loadingCuotas } = useQuery({
    queryKey: ["finanzas-cuotas", dateRange],
    queryFn: () =>
      finanzasApi.getCuotasAlumnos(dateRange.inicio, dateRange.fin),
  });

  const { data: pensiones, isLoading: loadingPensiones } = useQuery({
    queryKey: ["finanzas-pensiones"],
    queryFn: () => finanzasApi.getPensiones(),
  });

  const { data: honorarios, isLoading: loadingHonorarios } = useQuery({
    queryKey: ["finanzas-honorarios", dateRange],
    queryFn: () => finanzasApi.getHonorarios(dateRange.inicio, dateRange.fin),
  });

  const { data: configuracion } = useQuery({
    queryKey: ["finanzas-config"],
    queryFn: () => finanzasApi.getConfiguracion(),
  });

  // ── Mutación para guardar configuración ──────────────────────────────────────
  const { mutate: guardarConfig, isPending: guardando } = useMutation({
    mutationFn: finanzasApi.updateConfiguracion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finanzas"] });
      toast.success("Configuración de precios guardada");
      setEditandoConfig(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Estado local del formulario de precios ────────────────────────────────────
  const [editandoConfig, setEditandoConfig] = useState(false);
  const [formConfig, setFormConfig] = useState<Record<string, string>>({});

  const iniciarEdicion = () => {
    if (!configuracion) return;
    setFormConfig({
      cuota4Clases: String(configuracion.cuota4Clases),
      cuota8Clases: String(configuracion.cuota8Clases),
      cuota12Clases: String(configuracion.cuota12Clases),
      cuota16Clases: String(configuracion.cuota16Clases),
      pensionEntera: String(configuracion.pensionEntera),
      pensionMedia: String(configuracion.pensionMedia),
      pensionTercio: String(configuracion.pensionTercio),
      reservaEscuela: String(configuracion.reservaEscuela),
      honorarioPorClase: String(configuracion.honorarioPorClase),
      honorarioBaseMensual: String(configuracion.honorarioBaseMensual),
    });
    setEditandoConfig(true);
  };

  const cancelarEdicion = () => {
    setEditandoConfig(false);
    setFormConfig({});
  };

  const handleGuardar = () => {
    guardarConfig({
      cuota4Clases: Number(formConfig.cuota4Clases) || 0,
      cuota8Clases: Number(formConfig.cuota8Clases) || 0,
      cuota12Clases: Number(formConfig.cuota12Clases) || 0,
      cuota16Clases: Number(formConfig.cuota16Clases) || 0,
      pensionEntera: Number(formConfig.pensionEntera) || 0,
      pensionMedia: Number(formConfig.pensionMedia) || 0,
      pensionTercio: Number(formConfig.pensionTercio) || 0,
      reservaEscuela: Number(formConfig.reservaEscuela) || 0,
      honorarioPorClase: Number(formConfig.honorarioPorClase) || 0,
      honorarioBaseMensual: Number(formConfig.honorarioBaseMensual) || 0,
    });
  };

  const campo = (key: string, label: string) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {editandoConfig ? (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <Input
            type="number"
            min="0"
            step="100"
            value={formConfig[key] ?? "0"}
            onChange={(e) =>
              setFormConfig((prev) => ({ ...prev, [key]: e.target.value }))
            }
            className="pl-6"
          />
        </div>
      ) : (
        <p className="text-sm font-semibold">
          {configuracion
            ? formatPeso(
                Number(
                  (configuracion as unknown as Record<string, unknown>)[key] ??
                    0,
                ),
              )
            : "—"}
        </p>
      )}
    </div>
  );

  // ── Datos para gráficos ───────────────────────────────────────────────────────
  const desglosePlanes = resumen?.desglosePlanes ?? [];
  const evolucion = resumen?.evolucion ?? [];

  const datosBalance = [
    {
      concepto: "Cuotas",
      valor: resumen?.ingresosCuotasProyectado ?? 0,
      fill: COLORS.ingreso,
    },
    {
      concepto: "Pensiones",
      valor: resumen?.ingresosPensionesProyectado ?? 0,
      fill: COLORS.pension,
    },
    {
      concepto: "Honorarios",
      valor: resumen?.egresoHonorarios ?? 0,
      fill: COLORS.egreso,
    },
  ];

  // ── Exportar a CSV simple ─────────────────────────────────────────────────────
  const exportarCSV = (rows: Record<string, unknown>[], nombre: string) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => `"${r[h] ?? ""}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nombre}_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Finanzas"
          description="Ingresos proyectados, pensiones y honorarios del club"
        />

        {/* ── FILTRO DE PERÍODO ───────────────────────────────────────────────── */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fi" className="text-xs">
                  Desde
                </Label>
                <Input
                  id="fi"
                  type="date"
                  value={dateRange.inicio}
                  onChange={(e) =>
                    setDateRange((r) => ({ ...r, inicio: e.target.value }))
                  }
                  className="w-40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ff" className="text-xs">
                  Hasta
                </Label>
                <Input
                  id="ff"
                  type="date"
                  value={dateRange.fin}
                  onChange={(e) =>
                    setDateRange((r) => ({ ...r, fin: e.target.value }))
                  }
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── TARJETAS RESUMEN ────────────────────────────────────────────────── */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Ingresos cuotas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cuotas Proyectadas
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {loadingResumen
                  ? "..."
                  : formatPeso(resumen?.ingresosCuotasProyectado ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {cuotas?.alumnosActivos ?? 0} alumnos activos
              </p>
            </CardContent>
          </Card>

          {/* Pensiones */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pensiones</CardTitle>
              <ChessKnight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {loadingResumen
                  ? "..."
                  : formatPeso(resumen?.ingresosPensionesProyectado ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pensiones?.filas?.length ?? 0} con pensión activa
              </p>
            </CardContent>
          </Card>

          {/* Honorarios */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Honorarios</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {loadingResumen
                  ? "..."
                  : formatPeso(resumen?.egresoHonorarios ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {honorarios?.filas?.length ?? 0} instructores
              </p>
            </CardContent>
          </Card>

          {/* Balance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Balance Proyectado
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  (resumen?.balanceProyectado ?? 0) >= 0
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {loadingResumen
                  ? "..."
                  : formatPeso(resumen?.balanceProyectado ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                {(resumen?.balanceProyectado ?? 0) >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                Ingresos − egresos del período
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── TABS PRINCIPALES ────────────────────────────────────────────────── */}
        <Tabs defaultValue="resumen" className="space-y-4">
          <TabsList>
            <TabsTrigger value="resumen" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="cuotas" className="gap-1.5">
              <User className="h-4 w-4" />
              Cuotas
            </TabsTrigger>
            <TabsTrigger value="pensiones" className="gap-1.5">
              <ChessKnight className="h-4 w-4" />
              Pensiones
            </TabsTrigger>
            <TabsTrigger value="honorarios" className="gap-1.5">
              <GraduationCap className="h-4 w-4" />
              Honorarios
            </TabsTrigger>
            <TabsTrigger value="configuracion" className="gap-1.5">
              <CircleDollarSign className="h-4 w-4" />
              Precios
            </TabsTrigger>
          </TabsList>

          {/* ── TAB RESUMEN ────────────────────────────────────────────────────── */}
          <TabsContent value="resumen" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Composición de ingresos/egresos */}
              <Card>
                <CardHeader>
                  <CardTitle>Composición Financiera</CardTitle>
                  <CardDescription>
                    Ingresos y egresos proyectados en el período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={datosBalance}
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis dataKey="concepto" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="valor" name="Monto" radius={[4, 4, 0, 0]}>
                        {datosBalance.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Desglose por plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Cuotas por Plan</CardTitle>
                  <CardDescription>
                    Cantidad de alumnos y subtotal por plan mensual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {desglosePlanes.length > 0 ? (
                    <div className="space-y-3">
                      {desglosePlanes.map((plan) => (
                        <div
                          key={plan.cantidadClases}
                          className="flex items-center gap-3"
                        >
                          <div
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{
                              background:
                                PLAN_COLORS[plan.cantidadClases] ?? "#888",
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">
                                Plan {plan.cantidadClases} clases
                              </span>
                              <span className="text-muted-foreground tabular-nums">
                                {plan.alumnosEnPlan} alumnos ×{" "}
                                {formatPeso(plan.cuotaUnitaria)}
                              </span>
                            </div>
                            <div className="h-1.5 mt-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${
                                    resumen?.ingresosCuotasProyectado
                                      ? (plan.subtotal /
                                          resumen.ingresosCuotasProyectado) *
                                        100
                                      : 0
                                  }%`,
                                  background:
                                    PLAN_COLORS[plan.cantidadClases] ?? "#888",
                                }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-bold tabular-nums w-28 text-right">
                            {formatPeso(plan.subtotal)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-border pt-2 flex justify-between text-sm font-bold">
                        <span>Total cuotas</span>
                        <span className="text-success">
                          {formatPeso(resumen?.ingresosCuotasProyectado ?? 0)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      Sin datos de alumnos activos
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Evolución mensual */}
            {evolucion.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Evolución Mensual</CardTitle>
                  <CardDescription>
                    Proyección de ingresos y egresos mes a mes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart
                      data={evolucion}
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="gradIngreso"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={COLORS.ingreso}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={COLORS.ingreso}
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="gradEgreso"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={COLORS.egreso}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={COLORS.egreso}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="ingresos"
                        name="Ingresos"
                        stroke={COLORS.ingreso}
                        fill="url(#gradIngreso)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="egresos"
                        name="Egresos"
                        stroke={COLORS.egreso}
                        fill="url(#gradEgreso)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── TAB CUOTAS ─────────────────────────────────────────────────────── */}
          <TabsContent value="cuotas" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Cuotas por Alumno</CardTitle>
                  <CardDescription>
                    Plan contratado, clases realizadas y monto proyectado
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportarCSV(
                      (cuotas?.filas ?? []) as unknown as Record<
                        string,
                        unknown
                      >[],
                      "Cuotas",
                    )
                  }
                  disabled={!cuotas?.filas?.length}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </CardHeader>
              <CardContent>
                {loadingCuotas ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Cargando...
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-semibold text-sm">
                            Alumno
                          </th>
                          <th className="text-center p-3 font-semibold text-sm">
                            Plan
                          </th>
                          <th className="text-center p-3 font-semibold text-sm">
                            Clases ✓
                          </th>
                          <th className="text-right p-3 font-semibold text-sm">
                            Cuota
                          </th>
                          <th className="text-right p-3 font-semibold text-sm">
                            Pensión
                          </th>
                          <th className="text-right p-3 font-semibold text-sm text-success">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(cuotas?.filas ?? []).map((f) => (
                          <tr
                            key={f.alumnoId}
                            className="border-b hover:bg-muted/30 transition-colors"
                          >
                            <td className="p-3 text-sm font-medium">
                              {f.nombre} {f.apellido}
                            </td>
                            <td className="p-3 text-sm text-center">
                              <span
                                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                                style={{
                                  background: `${PLAN_COLORS[f.plan]}22`,
                                  color: PLAN_COLORS[f.plan],
                                  border: `1px solid ${PLAN_COLORS[f.plan]}44`,
                                }}
                              >
                                {f.plan} cl.
                              </span>
                            </td>
                            <td className="p-3 text-sm text-center tabular-nums">
                              {f.clasesCompletadas}
                            </td>
                            <td className="p-3 text-sm text-right tabular-nums">
                              {formatPeso(f.montoCuota)}
                            </td>
                            <td className="p-3 text-sm text-right tabular-nums text-muted-foreground">
                              {f.montoPension > 0
                                ? formatPeso(f.montoPension)
                                : "—"}
                            </td>
                            <td className="p-3 text-sm text-right tabular-nums font-bold text-success">
                              {formatPeso(f.totalAlumno)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {(cuotas?.filas?.length ?? 0) > 0 && (
                        <tfoot>
                          <tr className="border-t-2 border-border bg-muted/30">
                            <td
                              colSpan={5}
                              className="p-3 text-sm font-bold text-right"
                            >
                              Total proyectado
                            </td>
                            <td className="p-3 text-sm font-bold text-right text-success tabular-nums">
                              {formatPeso(cuotas?.totalProyectado ?? 0)}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                    {!cuotas?.filas?.length && (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        No hay alumnos activos
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB PENSIONES ──────────────────────────────────────────────────── */}
          <TabsContent value="pensiones" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pensiones Activas</CardTitle>
                  <CardDescription>
                    Alumnos con caballo propio o reserva de escuela
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Total mensual
                    </p>
                    <p className="text-lg font-bold text-success">
                      {formatPeso(pensiones?.totalMensual ?? 0)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportarCSV(
                        (pensiones?.filas ?? []) as unknown as Record<
                          string,
                          unknown
                        >[],
                        "Pensiones",
                      )
                    }
                    disabled={!pensiones?.filas?.length}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPensiones ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Cargando...
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-semibold text-sm">
                            Alumno
                          </th>
                          <th className="text-center p-3 font-semibold text-sm">
                            Tipo
                          </th>
                          <th className="text-center p-3 font-semibold text-sm">
                            Cuota
                          </th>
                          <th className="text-left p-3 font-semibold text-sm">
                            Caballo
                          </th>
                          <th className="text-right p-3 font-semibold text-sm text-success">
                            Monto
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(pensiones?.filas ?? []).map((f) => (
                          <tr
                            key={f.alumnoId}
                            className="border-b hover:bg-muted/30 transition-colors"
                          >
                            <td className="p-3 text-sm font-medium">
                              {f.nombre} {f.apellido}
                            </td>
                            <td className="p-3 text-sm text-center">
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">
                                {f.tipoPension === "CABALLO_PROPIO"
                                  ? "Propio"
                                  : "Reserva"}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-center text-muted-foreground">
                              {f.cuotaPension
                                ? ({
                                    ENTERA: "Entera",
                                    MEDIA: "Media",
                                    TERCIO: "Tercio",
                                  }[f.cuotaPension] ?? f.cuotaPension)
                                : "—"}
                            </td>
                            <td className="p-3 text-sm">
                              {f.caballoNombre ?? "—"}
                            </td>
                            <td className="p-3 text-sm text-right font-bold text-success tabular-nums">
                              {formatPeso(f.monto)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {(pensiones?.filas?.length ?? 0) > 0 && (
                        <tfoot>
                          <tr className="border-t-2 border-border bg-muted/30">
                            <td
                              colSpan={4}
                              className="p-3 text-sm font-bold text-right"
                            >
                              Total mensual
                            </td>
                            <td className="p-3 text-sm font-bold text-right text-success tabular-nums">
                              {formatPeso(pensiones?.totalMensual ?? 0)}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                    {!pensiones?.filas?.length && (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        No hay alumnos con pensión activa
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB HONORARIOS ─────────────────────────────────────────────────── */}
          <TabsContent value="honorarios" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Honorarios por Instructor</CardTitle>
                  <CardDescription>
                    Base mensual + clases completadas en el período
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Total egresos
                    </p>
                    <p className="text-lg font-bold text-destructive">
                      {formatPeso(honorarios?.totalHonorarios ?? 0)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportarCSV(
                        (honorarios?.filas ?? []) as unknown as Record<
                          string,
                          unknown
                        >[],
                        "Honorarios",
                      )
                    }
                    disabled={!honorarios?.filas?.length}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingHonorarios ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Cargando...
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-semibold text-sm">
                            Instructor
                          </th>
                          <th className="text-center p-3 font-semibold text-sm">
                            Clases ✓
                          </th>
                          <th className="text-right p-3 font-semibold text-sm">
                            Base
                          </th>
                          <th className="text-right p-3 font-semibold text-sm">
                            Por clases
                          </th>
                          <th className="text-right p-3 font-semibold text-sm text-destructive">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(honorarios?.filas ?? []).map((f) => (
                          <tr
                            key={f.instructorId}
                            className="border-b hover:bg-muted/30 transition-colors"
                          >
                            <td className="p-3 text-sm font-medium">
                              {f.nombre} {f.apellido}
                            </td>
                            <td className="p-3 text-sm text-center tabular-nums">
                              {f.clasesCompletadas}
                            </td>
                            <td className="p-3 text-sm text-right tabular-nums text-muted-foreground">
                              {formatPeso(f.honorarioBase)}
                            </td>
                            <td className="p-3 text-sm text-right tabular-nums text-muted-foreground">
                              {formatPeso(f.honorarioPorClases)}
                            </td>
                            <td className="p-3 text-sm text-right font-bold text-destructive tabular-nums">
                              {formatPeso(f.totalHonorario)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {(honorarios?.filas?.length ?? 0) > 0 && (
                        <tfoot>
                          <tr className="border-t-2 border-border bg-muted/30">
                            <td
                              colSpan={4}
                              className="p-3 text-sm font-bold text-right"
                            >
                              Total honorarios
                            </td>
                            <td className="p-3 text-sm font-bold text-right text-destructive tabular-nums">
                              {formatPeso(honorarios?.totalHonorarios ?? 0)}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                    {!honorarios?.filas?.length && (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        No hay instructores activos
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB CONFIGURACIÓN DE PRECIOS ────────────────────────────────────── */}
          <TabsContent value="configuracion" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Configuración de Precios</CardTitle>
                  <CardDescription>
                    Valores usados para calcular los reportes financieros
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {editandoConfig ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelarEdicion}
                        disabled={guardando}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleGuardar}
                        disabled={guardando}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {guardando ? "Guardando..." : "Guardar"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={iniciarEdicion}
                      disabled={!configuracion}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar precios
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cuotas */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Cuotas por Plan
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {campo("cuota4Clases", "Plan 4 clases / mes")}
                    {campo("cuota8Clases", "Plan 8 clases / mes")}
                    {campo("cuota12Clases", "Plan 12 clases / mes")}
                    {campo("cuota16Clases", "Plan 16 clases / mes")}
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* Pensiones */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <ChessKnight className="h-4 w-4 text-muted-foreground" />
                    Pensiones — Caballo Propio
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {campo("pensionEntera", "Cuota entera")}
                    {campo("pensionMedia", "Media cuota")}
                    {campo("pensionTercio", "Tercio de cuota")}
                    {campo("reservaEscuela", "Reserva caballo escuela")}
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* Honorarios */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    Honorarios Instructores
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {campo("honorarioBaseMensual", "Base mensual")}
                    {campo("honorarioPorClase", "Adicional por clase")}
                  </div>
                  {!editandoConfig && (
                    <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                      <ChevronRight className="h-3 w-3" />
                      El total se calcula como: base × meses + adicional ×
                      clases completadas
                    </p>
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
