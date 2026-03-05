import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PRESET_COLORS } from "@/constants/instructor.constants";
import { Instructor } from "@/lib/api";
import {
  InstructorFormValues,
  instructorSchema,
} from "@/lib/schemas/forms.schemas";

export type { InstructorFormValues as InstructorFormData };

interface InstructorFormProps {
  instructor?: Instructor;
  onSubmit: (data: InstructorFormValues) => void;
  isPending: boolean;
  onCancel?: () => void;
  validacionDni?: { duplicado: boolean; mensaje: string };
  onDniChange?: (dni: string) => void;
}

export function InstructorForm({
  instructor,
  onSubmit,
  isPending,
  onCancel,
  validacionDni,
  onDniChange,
}: InstructorFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InstructorFormValues>({
    resolver: zodResolver(instructorSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      dni: "",
      fechaNacimiento: "",
      codigoArea: "",
      telefono: "",
      email: "",
      activo: true,
      color: PRESET_COLORS[0],
    },
  });

  // Pre-poblar en modo edición
  useEffect(() => {
    if (instructor) {
      reset({
        nombre: instructor.nombre,
        apellido: instructor.apellido,
        dni: instructor.dni,
        fechaNacimiento: instructor.fechaNacimiento,
        codigoArea: instructor.codigoArea ?? "",
        telefono: instructor.telefono,
        email: instructor.email ?? "",
        activo: instructor.activo,
        color: instructor.color || PRESET_COLORS[0],
      });
    }
  }, [instructor, reset]);

  const onValid = (data: InstructorFormValues) => {
    if (validacionDni?.duplicado) {
      toast.error("Ya existe un instructor con este DNI");
      return;
    }

    // Normalizar código de área
    let codigoArea = data.codigoArea ?? "";
    if (codigoArea && !codigoArea.startsWith("+549")) {
      codigoArea = `+549${codigoArea.replace(/^\+/, "")}`;
    }

    onSubmit({ ...data, codigoArea });
  };

  const onInvalid = () => {
    toast.error("Revisá los campos con errores antes de continuar");
  };

  return (
    <form onSubmit={handleSubmit(onValid, onInvalid)} className="space-y-4">
      <div className="space-y-4">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre/s</Label>
            <Input
              id="nombre"
              autoComplete="given-name"
              placeholder="Nombre/s del instructor"
              {...register("nombre")}
              className={errors.nombre ? "border-red-500" : ""}
            />
            {errors.nombre && (
              <p className="text-sm text-red-500">{errors.nombre.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellido">Apellido/s</Label>
            <Input
              id="apellido"
              autoComplete="family-name"
              placeholder="Apellido del instructor"
              {...register("apellido")}
              className={errors.apellido ? "border-red-500" : ""}
            />
            {errors.apellido && (
              <p className="text-sm text-red-500">{errors.apellido.message}</p>
            )}
          </div>
        </div>

        {/* DNI y Fecha Nacimiento */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              autoComplete="off"
              placeholder="Solo números sin puntos"
              {...register("dni", {
                onChange: (e) => onDniChange?.(e.target.value),
              })}
              className={
                errors.dni || validacionDni?.duplicado ? "border-red-500" : ""
              }
            />
            {errors.dni && (
              <p className="text-sm text-red-500">{errors.dni.message}</p>
            )}
            {validacionDni?.duplicado && !errors.dni && (
              <p className="text-sm text-red-500">{validacionDni.mensaje}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
            <Input
              id="fechaNacimiento"
              type="date"
              {...register("fechaNacimiento")}
              className={errors.fechaNacimiento ? "border-red-500" : ""}
            />
            {errors.fechaNacimiento && (
              <p className="text-sm text-red-500">
                {errors.fechaNacimiento.message}
              </p>
            )}
          </div>
        </div>

        {/* Teléfono y Email */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="codigoArea"
              type="tel"
              autoComplete="tel"
              placeholder="Código de area"
              {...register("codigoArea")}
            />
            <Input
              id="telefono"
              type="tel"
              autoComplete="tel"
              placeholder="Teléfono de contacto"
              {...register("telefono")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Correo electrónico"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Color */}
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>Color del Instructor</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    type="button"
                    key={presetColor}
                    onClick={() => field.onChange(presetColor)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      field.value === presetColor
                        ? "border-primary ring-2 ring-primary/20 scale-110"
                        : "border-gray-300 hover:scale-105"
                    }`}
                    style={{ backgroundColor: presetColor }}
                    title={presetColor}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2 p-2 border rounded-md bg-muted/30">
                <div
                  className="w-6 h-6 rounded border-2 border-gray-300"
                  style={{ backgroundColor: field.value }}
                />
                <span className="text-sm font-mono text-muted-foreground">
                  {field.value}
                </span>
              </div>
            </div>
          )}
        />

        {/* Activo — solo en edición */}
        {instructor && (
          <Controller
            name="activo"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <Switch
                  id="activo"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="activo">Está activo</Label>
              </div>
            )}
          />
        )}
      </div>

      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending || validacionDni?.duplicado}>
          {isPending
            ? "Guardando..."
            : instructor
              ? "Guardar Cambios"
              : "Crear Instructor"}
        </Button>
      </div>
    </form>
  );
}
