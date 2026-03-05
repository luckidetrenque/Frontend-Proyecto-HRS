import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PRESET_COLORS } from "@/constants/instructor.constants";
import { Instructor } from "@/lib/api";

export interface InstructorFormData {
  nombre: string;
  apellido: string;
  codigoArea: string;
  telefono: string;
  email: string;
  fechaNacimiento: string;
  activo: boolean;
  color: string;
  dni: string;
}

interface InstructorFormProps {
  instructor?: Instructor;
  onSubmit: (data: InstructorFormData) => void;
  isPending: boolean;
  onCancel?: () => void;
  // ✅ NUEVO: Recibir validación de DNI como prop
  validacionDni?: {
    duplicado: boolean;
    mensaje: string;
  };
  onDniChange?: (dni: string) => void; // ✅ Para notificar al padre cuando cambia DNI
}

export function InstructorForm({
  instructor,
  onSubmit,
  isPending,
  onCancel,
  validacionDni, // ✅ Viene del padre
  onDniChange, // ✅ Viene del padre
}: InstructorFormProps) {
  // Estados locales del form
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [codigoArea, setCodigoArea] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [activo, setActivo] = useState(true);
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [dni, setDni] = useState("");

  // Pre-poblar en modo edición
  useEffect(() => {
    if (instructor) {
      setNombre(instructor.nombre);
      setApellido(instructor.apellido);
      setCodigoArea(instructor.codigoArea);
      setTelefono(instructor.telefono);
      setEmail(instructor.email ?? "");
      setFechaNacimiento(instructor.fechaNacimiento);
      setActivo(instructor.activo);
      setColor(instructor.color || PRESET_COLORS[0]);
      setDni(instructor.dni);
    }
  }, [instructor]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ✅ Validación: DNI duplicado
    if (validacionDni?.duplicado) {
      toast.error("Ya existe un instructor con este DNI");
      return;
    }

    // ✅ Validación: campos obligatorios
    if (!nombre.trim() || !apellido.trim() || !dni.trim()) {
      toast.error("Nombre, apellido y DNI son obligatorios");
      return;
    }

    // ✅ Normalizar teléfono (igual que en tu código original)
    let codigoAreaNormalizado = codigoArea;
    if (codigoAreaNormalizado && !codigoAreaNormalizado.startsWith("+549")) {
      codigoAreaNormalizado = `+549${codigoAreaNormalizado.replace(/^\+/, "")}`;
    }

    onSubmit({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      codigoArea: codigoAreaNormalizado,
      telefono: telefono,
      email: email.trim(),
      fechaNacimiento,
      activo,
      color,
      dni: dni.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre/s</Label>
            <Input
              id="nombre"
              type="text"
              autoComplete="given-name"
              placeholder="Nombre/s del instructor"
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
              placeholder="Apellido del instructor"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              name="dni"
              autoComplete="off"
              type="text"
              value={dni}
              onChange={(e) => {
                setDni(e.target.value);
                onDniChange?.(e.target.value); // ✅ Notificar al padre
              }}
              placeholder="Solo números sin puntos"
              className={validacionDni?.duplicado ? "border-red-500" : ""} // ✅ Ahora sí existe
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="codigoArea"
              type="tel"
              autoComplete="tel"
              placeholder="Código de area"
              value={codigoArea}
              onChange={(e) => setCodigoArea(e.target.value)}
            />
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

        <div className="space-y-2">
          <Label>Color del Instructor</Label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map((presetColor) => (
              <button
                type="button"
                key={presetColor}
                onClick={() => setColor(presetColor)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${color === presetColor
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
              style={{ backgroundColor: color }}
            />
            <span className="text-sm font-mono text-muted-foreground">
              {color}
            </span>
          </div>
        </div>

        {instructor && (
          <div className="flex items-center gap-3">
            <Switch id="activo" checked={activo} onCheckedChange={setActivo} />
            <Label htmlFor="activo">Está activo</Label>
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
            : instructor
              ? "Guardar Cambios"
              : "Crear Instructor"}
        </Button>
      </div>
    </form>
  );
}
