import { useEffect, useState } from "react";
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

export interface CaballoFormData {
  nombre: string;
  tipo: "ESCUELA" | "PRIVADO";
  disponible: boolean;
}

interface CaballoFormProps {
  caballo?: Caballo;
  onSubmit: (data: CaballoFormData) => void;
  isPending: boolean;
  onCancel?: () => void;
}

export function CaballoForm({
  caballo,
  onSubmit,
  isPending,
  onCancel,
}: CaballoFormProps) {
  // Estados locales del form
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<"ESCUELA" | "PRIVADO">("ESCUELA");
  const [disponible, setDisponible] = useState(true);

  // Pre-poblar en modo edición
  useEffect(() => {
    if (caballo) {
      setNombre(caballo.nombre);
      setTipo(caballo.tipo);
      setDisponible(caballo.disponible);
    }
  }, [caballo]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1️⃣ Validación básica
    if (!nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    // TODO VALIDACIONES

    onSubmit({ nombre: nombre.trim(), tipo, disponible });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del caballo"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo</Label>
        <Select value={tipo} onValueChange={(v) => setTipo(v as typeof tipo)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ESCUELA">Escuela</SelectItem>
            <SelectItem value="PRIVADO">Privado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {caballo && (
        <div className="flex items-center gap-3">
          <Switch
            id="disponible"
            checked={disponible}
            onCheckedChange={setDisponible}
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
