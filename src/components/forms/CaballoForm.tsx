import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { Caballo } from "@/lib/api";
import { CaballoFormValues, caballoSchema } from "@/lib/schemas/forms.schemas";

export type { CaballoFormValues as CaballoFormData };

interface CaballoFormProps {
  caballo?: Caballo;
  onSubmit: (data: CaballoFormValues) => void;
  isPending: boolean;
  onCancel?: () => void;
}

export function CaballoForm({
  caballo,
  onSubmit,
  isPending,
  onCancel,
}: CaballoFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CaballoFormValues>({
    resolver: zodResolver(caballoSchema),
    defaultValues: {
      nombre: "",
      tipo: "ESCUELA",
      disponible: true,
    },
  });

  // Pre-poblar en modo edición
  useEffect(() => {
    if (caballo) {
      reset({
        nombre: caballo.nombre,
        tipo: caballo.tipo,
        disponible: caballo.disponible,
      });
    }
  }, [caballo, reset]);

  const onValid = (data: CaballoFormValues) => {
    onSubmit(data);
  };

  const onInvalid = () => {
    toast.error("Revisá los campos con errores antes de continuar");
  };

  return (
    <form onSubmit={handleSubmit(onValid, onInvalid)} className="space-y-4">
      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          placeholder="Nombre del caballo"
          {...register("nombre")}
          className={errors.nombre ? "border-red-500" : ""}
        />
        {errors.nombre && (
          <p className="text-sm text-red-500">{errors.nombre.message}</p>
        )}
      </div>

      {/* Tipo */}
      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo</Label>
        <Controller
          name="tipo"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ESCUELA">Escuela</SelectItem>
                <SelectItem value="PRIVADO">Privado</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Disponible — solo en edición */}
      {caballo && (
        <div className="flex items-center gap-3">
          <Controller
            name="disponible"
            control={control}
            render={({ field }) => (
              <Switch
                id="disponible"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="disponible">Está disponible</Label>
        </div>
      )}

      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Guardando..."
            : caballo
              ? "Guardar Cambios"
              : "Crear Caballo"}
        </Button>
      </div>
    </form>
  );
}
