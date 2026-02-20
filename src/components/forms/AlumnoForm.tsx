import { format } from "date-fns";
import { useEffect, useState } from "react";
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
import { CuotaPension, TipoPension } from "@/types/enums";

export interface AlumnoFormData {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
  fechaInscripcion: string;
  cantidadClases: number;
  tipoPension: TipoPension;
  cuotaPension: CuotaPension | null;
  propietario: boolean;
  activo: boolean;
  caballoPropio?: number | null;
}

interface AlumnoFormProps {
  alumno?: Alumno;
  caballos: Caballo[];
  onSubmit: (data: AlumnoFormData) => void;
  isPending: boolean;
  onCancel?: () => void;
  validacionDni?: {
    duplicado: boolean;
    mensaje: string;
  };
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
  // Estados locales del form
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [fechaInscripcion, setFechaInscripcion] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [cantidadClases, setCantidadClases] = useState(4);
  const [tipoPension, setTipoPension] = useState<TipoPension>("SIN_CABALLO");
  const [cuotaPension, setCuotaPension] = useState<CuotaPension>("ENTERA");
  const [caballoId, setCaballoId] = useState<string>("");
  const [activo, setActivo] = useState(true);

  // Helper para extraer caballoId del alumno
  const getCaballoIdFromAlumno = (alumno?: Alumno): string => {
    if (!alumno?.caballoPropio) return "";
    return typeof alumno.caballoPropio === "number"
      ? String(alumno.caballoPropio)
      : String(alumno.caballoPropio.id);
  };

  // Pre-poblar en modo edición
  useEffect(() => {
    if (alumno) {
      setNombre(alumno.nombre);
      setApellido(alumno.apellido);
      setDni(alumno.dni);
      setFechaNacimiento(alumno.fechaNacimiento);
      setTelefono(alumno.telefono);
      setEmail(alumno.email ?? "");
      setFechaInscripcion(alumno.fechaInscripcion);
      setCantidadClases(alumno.cantidadClases);
      setTipoPension(alumno.tipoPension ?? "SIN_CABALLO");
      setCuotaPension(alumno.cuotaPension ?? "ENTERA");
      setCaballoId(getCaballoIdFromAlumno(alumno));
      setActivo(alumno.activo);
    }
  }, [alumno]);

  // Filtrar caballos según tipoPension
  const caballosFiltrados = caballos.filter((c) =>
    tipoPension === "CABALLO_PROPIO"
      ? c.tipo === "PRIVADO"
      : c.tipo === "ESCUELA",
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ✅ Validación: DNI duplicado
    if (validacionDni?.duplicado) {
      toast.error("Ya existe un alumno con este DNI");
      return;
    }

    // ✅ Validación: campos obligatorios
    if (!nombre.trim() || !apellido.trim() || !dni.trim()) {
      toast.error("Nombre, apellido y DNI son obligatorios");
      return;
    }

    // ✅ Normalizar teléfono
    let telefonoNormalizado = telefono;
    if (telefonoNormalizado && !telefonoNormalizado.startsWith("+549")) {
      telefonoNormalizado = `+549${telefonoNormalizado.replace(/^\+/, "")}`;
    }

    // ✅ Derivar propietario según tipoPension
    const propietario = tipoPension === "CABALLO_PROPIO";

    onSubmit({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni.trim(),
      fechaNacimiento,
      telefono: telefonoNormalizado,
      email: email.trim(),
      fechaInscripcion,
      cantidadClases,
      tipoPension,
      cuotaPension: tipoPension === "SIN_CABALLO" ? null : cuotaPension,
      propietario,
      activo,
      caballoPropio:
        tipoPension === "SIN_CABALLO" || !caballoId ? null : Number(caballoId),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre/s</Label>
            <Input
              id="nombre"
              type="text"
              autoComplete="given-name"
              placeholder="Nombre/s del alumno"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellido">Apellido/s</Label>
            <Input
              id="apellido"
              type="text"
              autoComplete="family-name"
              placeholder="Apellido del alumno"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
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
              name="dni"
              autoComplete="off"
              type="text"
              value={dni}
              onChange={(e) => {
                setDni(e.target.value);
                onDniChange?.(e.target.value);
              }}
              placeholder="Solo números sin puntos"
              className={validacionDni?.duplicado ? "border-red-500" : ""}
              required
            />
            {validacionDni?.duplicado && (
              <p className="text-sm text-red-500 mt-1">
                {validacionDni.mensaje}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
            <Input
              id="fechaNacimiento"
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Teléfono y Email */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="tel"
              autoComplete="tel"
              placeholder="Teléfono de contacto"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
              value={fechaInscripcion}
              onChange={(e) => setFechaInscripcion(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cantidadClases">Clases por Mes</Label>
            <Select
              value={String(cantidadClases)}
              onValueChange={(value) => setCantidadClases(Number(value))}
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
          </div>
        </div>

        {/* Pensión y Activo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipoPension">Pensión</Label>
            <Select
              value={tipoPension}
              onValueChange={(v) => {
                const nuevo = v as TipoPension;
                setTipoPension(nuevo);
                if (nuevo === "SIN_CABALLO") {
                  setCuotaPension("ENTERA");
                  setCaballoId("");
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
                <SelectItem value="CABALLO_PROPIO">Caballo propio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {alumno && (
            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="activo"
                checked={activo}
                onCheckedChange={setActivo}
              />
              <Label htmlFor="activo">Está activo</Label>
            </div>
          )}
        </div>

        {/* Cuota y Caballo (solo si tiene caballo) */}
        {tipoPension !== "SIN_CABALLO" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cuotaPension">Cuota de pensión</Label>
              <Select
                value={cuotaPension}
                onValueChange={(value) =>
                  setCuotaPension(value as CuotaPension)
                }
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="caballo">Caballo</Label>
              <Select value={caballoId} onValueChange={setCaballoId}>
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
