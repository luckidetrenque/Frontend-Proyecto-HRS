import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Shield, Clock, Timer, Ticket } from "lucide-react";
import { useState, useEffect } from "react";
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
import { configuracionOperativaApi, ConfiguracionOperativa } from "@/lib/api";

export default function ConfiguracionPage() {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["configuracion-operativa"],
    queryFn: () => configuracionOperativaApi.get(),
  });

  const { mutate: updateConfig, isPending: guardando } = useMutation({
    mutationFn: (newConfig: Partial<ConfiguracionOperativa>) =>
      configuracionOperativaApi.update(newConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracion-operativa"] });
      toast.success("Configuración actualizada correctamente");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [formData, setFormData] = useState({
    horasAnticipacionCancelacion: 2,
    horasAnticipacionReserva: 2,
    diasValidezInvitacion: 7,
  });

  useEffect(() => {
    if (config) {
      setFormData({
        horasAnticipacionCancelacion: config.horasAnticipacionCancelacion,
        horasAnticipacionReserva: config.horasAnticipacionReserva,
        diasValidezInvitacion: config.diasValidezInvitacion,
      });
    }
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[50vh]">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Configuración del Sistema"
          description="Gestión de reglas operativas y parámetros generales"
        />

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Reglas de Reservas y Cancelación</CardTitle>
              </div>
              <CardDescription>
                Define los tiempos mínimos permitidos para que los alumnos interactúen con el calendario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      Anticipación para Cancelar
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        name="horasAnticipacionCancelacion"
                        min="0"
                        value={formData.horasAnticipacionCancelacion}
                        onChange={handleChange}
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        horas
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tiempo mínimo antes de la clase para que un alumno pueda cancelarla por su cuenta.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Anticipación para Reservar
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        name="horasAnticipacionReserva"
                        min="0"
                        value={formData.horasAnticipacionReserva}
                        onChange={handleChange}
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        horas
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tiempo mínimo antes de la clase para permitir que un alumno realice una reserva.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 max-w-sm">
                  <Label className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                    Validez de Invitaciones
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      name="diasValidezInvitacion"
                      min="1"
                      value={formData.diasValidezInvitacion}
                      onChange={handleChange}
                      className="pr-16"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      días
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tiempo de vida para los códigos UUID que se envían a los alumnos.
                  </p>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={guardando}>
                    {guardando ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></span>
                        Guardando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Guardar Cambios
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
