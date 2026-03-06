import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  ESPECIALIDADES_OPTIONS,
  parsearHoraParaApi,
} from "@/components/calendar/clases.constants";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alumno,
  Caballo,
  Clase,
  Instructor,
  PersonaPrueba,
  personasPruebaApi,
} from "@/lib/api";
import { ClaseFormValues, claseSchema } from "@/lib/schemas/forms.schemas";
import {
  handleEspecialidadChangeEffect,
  validarClasePrueba,
  validarHorarioLimite,
} from "@/utils/validacionesClases";

export interface ClaseFormData {
  especialidad: Clase["especialidad"];
  dia: string;
  hora: string;
  duracion: number;
  estado: Clase["estado"];
  observaciones: string;
  instructorId: number;
  caballoId: number;
  diaHoraCompleto: string;
  alumnoId: number | null;
  personaPruebaId: number | null;
  esPrueba: boolean;
}

interface ClaseFormProps {
  clase?: Clase;
  alumnos: Alumno[];
  instructores: Instructor[];
  caballos: Caballo[];
  clases: Clase[];
  personasPrueba: PersonaPrueba[];
  currentDate?: Date;
  prefilledHora?: string;
  prefilledCaballoId?: number;
  onSubmit: (data: ClaseFormData) => void;
  isPending: boolean;
  onCancel?: () => void;
}

export function ClaseForm({
  clase,
  alumnos,
  instructores,
  caballos,
  clases,
  currentDate,
  prefilledHora,
  prefilledCaballoId,
  onSubmit,
  isPending,
  onCancel,
}: ClaseFormProps) {
  const getDefaultDia = () => {
    if (!currentDate) return "";
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, "0");
    const d = String(currentDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ClaseFormValues>({
    resolver: zodResolver(claseSchema),
    defaultValues: {
      especialidad: "",
      alumnoId: "",
      instructorId: "",
      caballoId: prefilledCaballoId ? String(prefilledCaballoId) : "",
      dia: getDefaultDia(),
      hora: prefilledHora ?? "09:00",
      duracion: 30,
      observaciones: "",
      esPruebaChecked: false,
      tipoPrueba: "persona_nueva",
      nombrePrueba: "",
      apellidoPrueba: "",
    },
  });

  // Observar campos reactivos
  const especialidad = useWatch({ control, name: "especialidad" });
  const esPruebaChecked = useWatch({ control, name: "esPruebaChecked" });
  const tipoPrueba = useWatch({ control, name: "tipoPrueba" });
  const alumnoId = useWatch({ control, name: "alumnoId" });

  // Pre-poblar en modo edición / nuevo con prefills
  useEffect(() => {
    if (clase) {
      reset({
        especialidad: clase.especialidad,
        alumnoId: clase.alumnoId ? String(clase.alumnoId) : "",
        instructorId: clase.instructorId ? String(clase.instructorId) : "",
        caballoId: clase.caballoId ? String(clase.caballoId) : "",
        dia: clase.dia,
        hora: clase.hora.slice(0, 5),
        duracion: Number(clase.duracion) || 30,
        observaciones: clase.observaciones ?? "",
        esPruebaChecked: clase.esPrueba ?? false,
        tipoPrueba: clase.esPrueba
          ? clase.alumnoId
            ? "alumno_existente"
            : "persona_nueva"
          : "persona_nueva",
        nombrePrueba: "",
        apellidoPrueba: "",
      });
    } else {
      reset((prev) => ({
        ...prev,
        dia: getDefaultDia(),
        hora: prefilledHora ?? "09:00",
        caballoId: prefilledCaballoId ? String(prefilledCaballoId) : "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clase, currentDate, prefilledCaballoId, prefilledHora]);

  // Auto-seleccionar caballo del alumno
  useEffect(() => {
    if (!clase && alumnoId) {
      const alumno = alumnos.find((a) => a.id === Number(alumnoId));
      if (alumno?.caballoId) {
        setValue("caballoId", String(alumno.caballoId));
      }
    }
  }, [alumnoId, clase, alumnos, setValue]);

  const isReadonly =
    especialidad === "MONTA" ||
    (esPruebaChecked && tipoPrueba === "persona_nueva");

  const onValid = async (data: ClaseFormValues) => {
    let alumnoIdFinal: number | null = null;
    let personaPruebaId: number | null = null;

    if (especialidad === "MONTA") {
      alumnoIdFinal = null;
    } else if (esPruebaChecked && tipoPrueba === "persona_nueva") {
      if (!data.nombrePrueba?.trim() || !data.apellidoPrueba?.trim()) {
        toast.error("Ingresá nombre y apellido de la persona de prueba");
        return;
      }
      try {
        const personaPrueba = await personasPruebaApi.crear({
          nombre: data.nombrePrueba.trim(),
          apellido: data.apellidoPrueba.trim(),
        });
        personaPruebaId = personaPrueba.id;
        alumnoIdFinal = null;
      } catch {
        toast.error("Error al registrar la persona de prueba");
        return;
      }
    } else {
      if (!data.alumnoId) {
        toast.error("Debe seleccionar un alumno");
        return;
      }
      alumnoIdFinal = Number(data.alumnoId);
    }

    // Validar clase de prueba para alumno existente
    const alumno = alumnoIdFinal
      ? alumnos.find((a) => a.id === alumnoIdFinal)
      : undefined;

    if (
      !clase &&
      esPruebaChecked &&
      tipoPrueba === "alumno_existente" &&
      alumno
    ) {
      const { esValido, mensaje } = validarClasePrueba(
        clases,
        alumno,
        especialidad as Clase["especialidad"],
        clase?.id,
      );
      if (!esValido) {
        toast.error(mensaje);
        return;
      }
    }

    // Resolver caballo
    let caballoIdFinal: number;
    if (data.caballoId) {
      caballoIdFinal = Number(data.caballoId);
    } else if (alumno?.caballoId) {
      caballoIdFinal = alumno.caballoId;
    } else {
      toast.error("Debe seleccionar un caballo");
      return;
    }

    // Validar horario límite
    const { esValido: horarioOk, mensaje: mensajeHorario } =
      validarHorarioLimite(data.hora, data.duracion);
    if (!horarioOk) {
      toast.error(mensajeHorario);
      return;
    }

    onSubmit({
      especialidad: especialidad as Clase["especialidad"],
      dia: data.dia,
      hora: parsearHoraParaApi(data.hora),
      duracion: data.duracion,
      estado: clase?.estado ?? "PROGRAMADA",
      observaciones: data.observaciones ?? "",
      instructorId: Number(data.instructorId),
      caballoId: caballoIdFinal,
      diaHoraCompleto: "",
      alumnoId: alumnoIdFinal,
      personaPruebaId,
      esPrueba: esPruebaChecked ?? false,
    });
  };

  const onInvalid = () => {
    toast.error("Revisá los campos con errores antes de continuar");
  };

  return (
    <form onSubmit={handleSubmit(onValid, onInvalid)} className="space-y-4">
      <div className="space-y-4">
        {/* Especialidad */}
        <div className="space-y-2">
          <Label htmlFor="especialidad">Especialidad</Label>
          <Controller
            name="especialidad"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => {
                  handleEspecialidadChangeEffect(v, field.onChange, (val) =>
                    setValue("alumnoId", val ?? ""),
                  );
                }}
              >
                <SelectTrigger
                  className={errors.especialidad ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Seleccionar especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {ESPECIALIDADES_OPTIONS.map((esp) => (
                    <SelectItem key={esp.value} value={esp.value}>
                      {esp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.especialidad && (
            <p className="text-sm text-red-500">
              {errors.especialidad.message}
            </p>
          )}
        </div>

        {/* Alumno */}
        {especialidad !== "MONTA" ? (
          <div className="space-y-2">
            <Label htmlFor="alumno">Alumno</Label>
            <Controller
              name="alumnoId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isReadonly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar alumno" />
                  </SelectTrigger>
                  <SelectContent>
                    {alumnos.map((a: Alumno) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.nombre} {a.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Las clases de MONTA son exclusivamente para instructores
          </p>
        )}

        {/* Clase de prueba — solo en creación y no MONTA */}
        {!clase && especialidad !== "MONTA" && (
          <div className="space-y-3 rounded-md border p-3">
            <div className="flex items-center gap-2">
              <Controller
                name="esPruebaChecked"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="esPrueba"
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked as boolean)
                    }
                  />
                )}
              />
              <Label htmlFor="esPrueba" className="font-normal cursor-pointer">
                Es clase de prueba
              </Label>
            </div>

            {esPruebaChecked && (
              <Controller
                name="tipoPrueba"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="alumno_existente"
                        id="alumno_existente"
                      />
                      <Label htmlFor="alumno_existente" className="font-normal">
                        Alumno existente
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="persona_nueva"
                        id="persona_nueva"
                      />
                      <Label htmlFor="persona_nueva" className="font-normal">
                        Persona nueva (registrar temporalmente)
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            )}

            {esPruebaChecked && tipoPrueba === "persona_nueva" && (
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Nombre" {...register("nombrePrueba")} />
                <Input placeholder="Apellido" {...register("apellidoPrueba")} />
              </div>
            )}
          </div>
        )}

        {/* Día, Hora y Duración */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dia">Día</Label>
            <Input
              id="dia"
              type="date"
              {...register("dia")}
              className={errors.dia ? "border-red-500" : ""}
            />
            {errors.dia && (
              <p className="text-sm text-red-500">{errors.dia.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="hora">Hora</Label>
            <Input
              id="hora"
              type="time"
              min="09:00"
              max="18:00"
              step="1800"
              {...register("hora")}
              className={errors.hora ? "border-red-500" : ""}
            />
            {errors.hora && (
              <p className="text-sm text-red-500">{errors.hora.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="duracion">Duración (min)</Label>
            <Controller
              name="duracion"
              control={control}
              render={({ field }) => (
                <Select
                  value={String(field.value)}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Instructor y Caballo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instructor">Instructor</Label>
            <Controller
              name="instructorId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={errors.instructorId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Seleccionar instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructores.map((i: Instructor) => (
                      <SelectItem key={i.id} value={String(i.id)}>
                        {i.nombre} {i.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.instructorId && (
              <p className="text-sm text-red-500">
                {errors.instructorId.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="caballo">Caballo</Label>
            <Controller
              name="caballoId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar caballo" />
                  </SelectTrigger>
                  <SelectContent>
                    {caballos.map((c: Caballo) => (
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

        {/* Observaciones */}
        <div className="space-y-2">
          <Label htmlFor="observaciones">Observaciones</Label>
          <Input
            id="observaciones"
            placeholder="Observaciones opcionales"
            {...register("observaciones")}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Guardando..."
            : clase
              ? "Guardar Cambios"
              : "Crear Clase"}
        </Button>
      </div>
    </form>
  );
}
