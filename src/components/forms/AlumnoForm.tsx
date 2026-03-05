import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { CommonTooltips, HelpTooltip } from "@/components/HelpTooltip";
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
import { Alumno, Caballo } from "@/lib/api";
import { AlumnoFormValues, alumnoSchema } from "@/lib/schemas/forms.schemas";
import { CuotaPension, TipoPension } from "@/types/enums";

// El tipo que el padre espera (compatible con la API)
export interface AlumnoFormData {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  codigoArea: string;
  telefono: string;
  email: string;
  fechaInscripcion: string;
  cantidadClases: number;
  tipoPension: TipoPension;
  cuotaPension: CuotaPension | null;
  propietario: boolean;
  activo: boolean;
  caballoId?: number | null;
}

interface AlumnoFormProps {
  alumno?: Alumno;
  caballos: Caballo[];
  onSubmit: (data: AlumnoFormData) => void;
  isPending: boolean;
  onCancel?: () => void;
  validacionDni?: { duplicado: boolean; mensaje: string };
  onDniChange?: (dni: string) => void;
}

export function AlumnoForm({
  alumno,
  caballos,
  onSubmit,
  isPending,
  onCancel,
  validacionDni,
  onDniChange,
}: AlumnoFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AlumnoFormValues>({
    resolver: zodResolver(alumnoSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      dni: "",
      fechaNacimiento: "",
      codigoArea: "",
      telefono: "",
      email: "",
      fechaInscripcion: format(new Date(), "yyyy-MM-dd"),
      cantidadClases: 4,
      tipoPension: "SIN_CABALLO",
      cuotaPension: null,
      caballoId: null,
      activo: true,
    },
  });

  // Observar tipoPension para renderizado condicional
  const tipoPension = useWatch({ control, name: "tipoPension" });

  // Pre-poblar en modo edición
  useEffect(() => {
    if (alumno) {
      reset({
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        dni: alumno.dni,
        fechaNacimiento: alumno.fechaNacimiento,
        codigoArea: alumno.codigoArea ?? "",
        telefono: alumno.telefono,
        email: alumno.email ?? "",
        fechaInscripcion: alumno.fechaInscripcion,
        cantidadClases: alumno.cantidadClases,
        tipoPension: alumno.tipoPension ?? "SIN_CABALLO",
        cuotaPension: alumno.cuotaPension ?? null,
        caballoId: alumno.caballoId ?? null,
        activo: alumno.activo,
      } as AlumnoFormValues);
    }
  }, [alumno, reset]);

  // Filtrar caballos según tipoPension
  const caballosFiltrados = caballos.filter((c) =>
    tipoPension === "CABALLO_PROPIO"
      ? c.tipo === "PRIVADO"
      : c.tipo === "ESCUELA",
  );

  const onValid = (data: AlumnoFormValues) => {
    if (validacionDni?.duplicado) {
      toast.error("Ya existe un alumno con este DNI");
      return;
    }

    // Normalizar código de área
    let codigoArea = data.codigoArea ?? "";
    if (codigoArea && !codigoArea.startsWith("+549")) {
      codigoArea = `+549${codigoArea.replace(/^\+/, "")}`;
    }

    const propietario = data.tipoPension === "CABALLO_PROPIO";

    // Derivar cuotaPension y caballoId según tipoPension
    let caballoId: number | null = null;
    let cuotaPension: CuotaPension | null = null;

    if (data.tipoPension === "CABALLO_PROPIO") {
      caballoId = data.caballoId ? Number(data.caballoId) : null;
      cuotaPension = (data as { cuotaPension: CuotaPension }).cuotaPension;
    } else if (data.tipoPension === "RESERVA_ESCUELA") {
      caballoId = data.caballoId ? Number(data.caballoId) : null;
    }

    onSubmit({
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      dni: data.dni.trim(),
      fechaNacimiento: data.fechaNacimiento,
      codigoArea,
      telefono: data.telefono ?? "",
      email: (data.email ?? "").trim(),
      fechaInscripcion: data.fechaInscripcion,
      cantidadClases: data.cantidadClases,
      tipoPension: data.tipoPension,
      cuotaPension,
      propietario,
      activo: data.activo,
      caballoId,
    });
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
              placeholder="Nombre/s del alumno"
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
              placeholder="Apellido del alumno"
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
            <Label htmlFor="dni">
              DNI
              <HelpTooltip content={CommonTooltips.alumno.dni} />
            </Label>
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

        {/* Fecha Inscripción y Cantidad Clases */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fechaInscripcion">
              Fecha de Inscripción
              <HelpTooltip content={CommonTooltips.alumno.fechaInscripcion} />
            </Label>
            <Input
              id="fechaInscripcion"
              type="date"
              {...register("fechaInscripcion")}
              className={errors.fechaInscripcion ? "border-red-500" : ""}
            />
            {errors.fechaInscripcion && (
              <p className="text-sm text-red-500">
                {errors.fechaInscripcion.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cantidadClases">Clases por Mes</Label>
            <Controller
              name="cantidadClases"
              control={control}
              render={({ field }) => (
                <Select
                  value={String(field.value)}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger id="cantidadClases">
                    <SelectValue placeholder="Seleccionar cantidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 clases</SelectItem>
                    <SelectItem value="8">8 clases</SelectItem>
                    <SelectItem value="12">12 clases</SelectItem>
                    <SelectItem value="16">16 clases</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Tipo Pensión y Activo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipoPension">Caballo</Label>
            <Controller
              name="tipoPension"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v as TipoPension);
                    // Limpiar campos dependientes al cambiar tipo
                    if (v === "SIN_CABALLO") {
                      setValue("caballoId", null);
                      setValue("cuotaPension" as keyof AlumnoFormValues, null);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIN_CABALLO">
                      Sin caballo asignado
                    </SelectItem>
                    <SelectItem value="RESERVA_ESCUELA">
                      Reserva caballo de escuela
                    </SelectItem>
                    <SelectItem value="CABALLO_PROPIO">
                      Caballo propio
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Activo — solo en edición */}
          {alumno && (
            <Controller
              name="activo"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3 pt-6">
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

        {/* Cuota y Caballo — CABALLO_PROPIO */}
        {tipoPension === "CABALLO_PROPIO" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cuotaPension">Cuota de pensión</Label>
              <Controller
                name={"cuotaPension" as keyof AlumnoFormValues}
                control={control}
                render={({ field }) => (
                  <Select
                    value={String(field.value ?? "ENTERA")}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="cuotaPension">
                      <SelectValue placeholder="Seleccionar cuota" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENTERA">Entera</SelectItem>
                      <SelectItem value="MEDIA">Media</SelectItem>
                      <SelectItem value="TERCIO">Tercio</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caballo">Nombre Caballo</Label>
              <Controller
                name="caballoId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => field.onChange(v ? Number(v) : null)}
                  >
                    <SelectTrigger id="caballo">
                      <SelectValue placeholder="Seleccionar caballo" />
                    </SelectTrigger>
                    <SelectContent>
                      {caballosFiltrados.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        )}

        {/* Caballo — RESERVA_ESCUELA */}
        {tipoPension === "RESERVA_ESCUELA" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caballo">Nombre Caballo</Label>
              <Controller
                name="caballoId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => field.onChange(v ? Number(v) : null)}
                  >
                    <SelectTrigger id="caballo">
                      <SelectValue placeholder="Seleccionar caballo" />
                    </SelectTrigger>
                    <SelectContent>
                      {caballosFiltrados.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
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
            : alumno
              ? "Guardar Cambios"
              : "Crear Alumno"}
        </Button>
      </div>
    </form>
  );
}
