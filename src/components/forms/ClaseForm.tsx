import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  ALUMNO_COMODIN_ID,
  ESPECIALIDADES_OPTIONS,
  obtenerHoraArgentina,
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
  personasPrueba,
  currentDate,
  prefilledHora,
  prefilledCaballoId,
  onSubmit,
  isPending,
  onCancel,
}: ClaseFormProps) {
  // Estados locales del form
  const [especialidad, setEspecialidad] = useState<string>("");
  const [alumnoId, setAlumnoId] = useState<string>("");
  const [instructorId, setInstructorId] = useState<string>("");
  const [caballoId, setCaballoId] = useState<string>("");
  const [dia, setDia] = useState<string>("");
  const [hora, setHora] = useState<string>("09:00");
  const [duracion, setDuracion] = useState<number>(30);
  const [estado, setEstado] = useState<Clase["estado"]>("PROGRAMADA");
  const [observaciones, setObservaciones] = useState<string>("");

  // Estados para clase de prueba
  const [esPruebaChecked, setEsPruebaChecked] = useState(false);
  const [tipoPrueba, setTipoPrueba] = useState<
    "alumno_existente" | "persona_nueva"
  >("persona_nueva");
  const [nombrePrueba, setNombrePrueba] = useState("");
  const [apellidoPrueba, setApellidoPrueba] = useState("");

  // Filtrar alumnos según especialidad (excluir ALUMNO_COMODIN si no es MONTA)
  const alumnosValidos = alumnos.filter((a: Alumno) => {
    if (especialidad === "MONTA") return true;
    return a.id !== ALUMNO_COMODIN_ID;
  });

  // Pre-poblar en modo edición
  // ✅ LÍNEAS 99-128 - CORREGIDO
  useEffect(() => {
    if (clase) {
      // Modo edición
      setEspecialidad(clase.especialidad);
      setAlumnoId(clase.alumnoId ? String(clase.alumnoId) : "");
      setInstructorId(clase.instructorId ? String(clase.instructorId) : "");
      setCaballoId(clase.caballoId ? String(clase.caballoId) : "");
      setDia(clase.dia);
      setHora(clase.hora.slice(0, 5));
      setDuracion(Number(clase.duracion) || 30);
      setEstado(clase.estado ?? "PROGRAMADA");
      setObservaciones(clase.observaciones ?? "");
      setEsPruebaChecked(false);
    } else {
      // Modo creación
      if (currentDate) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");
        setDia(`${year}-${month}-${day}`);
      }

      // ✅ Prefilled desde el calendario (doble click en celda)
      if (prefilledHora) {
        setHora(prefilledHora);
      }
      if (prefilledCaballoId) {
        setCaballoId(String(prefilledCaballoId));
      }
    }
  }, [clase, currentDate, prefilledCaballoId, prefilledHora]);

  // Auto-seleccionar caballo del alumno
  // ✅ LÍNEAS 131-144 - CORREGIDO
  useEffect(() => {
    if (!clase && alumnoId) {
      const alumno = alumnosValidos.find((a) => a.id === Number(alumnoId));
      if (alumno?.caballoPropio) {
        const id =
          typeof alumno.caballoPropio === "number"
            ? alumno.caballoPropio
            : alumno.caballoPropio.id;
        setCaballoId(String(id));
      }
      // ✅ NO limpiar el caballo si no tiene propio
      // Dejarlo como está para que mantenga la selección manual
    }
  }, [alumnoId, clase, alumnosValidos]);

  // Manejador para cambio de especialidad
  const handleEspecialidadChange = (value: string) => {
    handleEspecialidadChangeEffect(
      value,
      ALUMNO_COMODIN_ID,
      setEspecialidad,
      setAlumnoId,
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let alumnoIdFinal: number | null = null;
    let personaPruebaId: number | null = null;

    // ✅ LÍNEAS 170-210 CORREGIDAS
    if (esPruebaChecked && tipoPrueba === "persona_nueva") {
      // Validar campos de persona nueva
      if (!nombrePrueba.trim() || !apellidoPrueba.trim()) {
        toast.error("Ingresá nombre y apellido de la persona de prueba");
        return;
      }

      try {
        const personaPrueba = await personasPruebaApi.crear({
          nombre: nombrePrueba.trim(),
          apellido: apellidoPrueba.trim(),
        });
        personaPruebaId = personaPrueba.id;
        alumnoIdFinal = null; // ✅ Explícitamente null para persona nueva
      } catch {
        toast.error("Error al registrar la persona de prueba");
        return;
      }
    } else {
      // Caso normal: alumno existente O clase de prueba con alumno existente
      if (!alumnoId) {
        toast.error("Debe seleccionar un alumno");
        return;
      }
      alumnoIdFinal = Number(alumnoId);
    }

    // ✅ Validación: Clase de prueba para alumno existente
    const alumno = alumnoIdFinal
      ? alumnosValidos.find((a: Alumno) => a.id === alumnoIdFinal)
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

    // ✅ Resolver caballo
    let caballoIdFinal: number;

    if (caballoId) {
      // Caballo seleccionado manualmente
      caballoIdFinal = Number(caballoId);
    } else if (alumno?.caballoPropio) {
      // Auto-asignar caballo del alumno
      caballoIdFinal =
        typeof alumno.caballoPropio === "object"
          ? alumno.caballoPropio.id
          : alumno.caballoPropio;
    } else {
      // No hay caballo seleccionado ni predeterminado
      toast.error("Debe seleccionar un caballo");
      return;
    }

    // ✅ Validación: Horario límite
    const { esValido: horarioOk, mensaje: mensajeHorario } =
      validarHorarioLimite(hora, duracion);
    if (!horarioOk) {
      toast.error(mensajeHorario);
      return;
    }

    // ✅ Construir datos
    const data: ClaseFormData = {
      especialidad: especialidad as Clase["especialidad"],
      dia,
      hora: parsearHoraParaApi(hora),
      duracion,
      estado: clase?.estado ?? "PROGRAMADA",
      observaciones,
      instructorId: Number(instructorId),
      caballoId: caballoIdFinal,
      diaHoraCompleto: "", // El backend lo genera
      alumnoId: alumnoIdFinal,
      personaPruebaId,
      esPrueba: esPruebaChecked,
    };

    onSubmit(data);
  };

  const isReadonly =
    especialidad === "MONTA" ||
    (esPruebaChecked && tipoPrueba === "persona_nueva");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {/* Especialidad */}
        <div className="space-y-2">
          <Label htmlFor="especialidad">Especialidad</Label>
          <Select value={especialidad} onValueChange={handleEspecialidadChange}>
            <SelectTrigger>
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
        </div>

        {/* Alumno */}
        <div className="space-y-2">
          <Label htmlFor="alumno">Alumno</Label>
          <Select
            value={alumnoId}
            onValueChange={setAlumnoId}
            disabled={isReadonly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar alumno" />
            </SelectTrigger>
            <SelectContent>
              {alumnosValidos.map((a: Alumno) => (
                <SelectItem key={a.id} value={String(a.id)}>
                  {a.nombre} {a.apellido}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clase de prueba (solo en creación) */}
        {!clase && (
          <div className="space-y-3 rounded-md border p-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="esPrueba"
                checked={esPruebaChecked}
                onCheckedChange={(checked) =>
                  setEsPruebaChecked(checked as boolean)
                }
              />
              <Label htmlFor="esPrueba" className="font-normal cursor-pointer">
                Es clase de prueba
              </Label>
            </div>

            {esPruebaChecked && (
              <RadioGroup
                value={tipoPrueba}
                onValueChange={(value) =>
                  setTipoPrueba(value as "alumno_existente" | "persona_nueva")
                }
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
                  <RadioGroupItem value="persona_nueva" id="persona_nueva" />
                  <Label htmlFor="persona_nueva" className="font-normal">
                    Persona nueva (registrar temporalmente)
                  </Label>
                </div>
              </RadioGroup>
            )}

            {esPruebaChecked && tipoPrueba === "persona_nueva" && (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Nombre"
                  value={nombrePrueba}
                  onChange={(e) => setNombrePrueba(e.target.value)}
                />
                <Input
                  placeholder="Apellido"
                  value={apellidoPrueba}
                  onChange={(e) => setApellidoPrueba(e.target.value)}
                />
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
              value={dia}
              onChange={(e) => setDia(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hora">Hora</Label>
            <Input
              id="hora"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duracion">Duración (min)</Label>
            <Select
              value={String(duracion)}
              onValueChange={(v) => setDuracion(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Instructor y Caballo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instructor">Instructor</Label>
            <Select value={instructorId} onValueChange={setInstructorId}>
              <SelectTrigger>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="caballo">Caballo</Label>
            <Select value={caballoId} onValueChange={setCaballoId}>
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
          </div>
        </div>

        {/* Observaciones */}
        <div className="space-y-2">
          <Label htmlFor="observaciones">Observaciones</Label>
          <Input
            id="observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Observaciones opcionales"
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
