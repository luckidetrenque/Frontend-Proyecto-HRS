import { Alumno } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

interface AlumnoCardProps {
  alumno: Alumno;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export function AlumnoCard({
  alumno,
  onEdit,
  onDelete,
  onClick,
}: AlumnoCardProps) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl border bg-background p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {alumno.nombre} {alumno.apellido}
          </h3>
          <p className="text-sm text-muted-foreground">DNI: {alumno.dni}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="rounded-md p-1 opacity-0 transition group-hover:opacity-100 hover:bg-muted"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Teléfono</span>
          <p>{alumno.telefono}</p>
        </div>

        <div>
          <span className="text-muted-foreground">Email</span>
          <p className="truncate">{alumno.email || "-"}</p>
        </div>

        <div>
          <span className="text-muted-foreground">Clases / Mes</span>
          <p className="font-medium">{alumno.cantidadClases}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status={alumno.activo ? "success" : "default"}>
            {alumno.activo ? "Activo" : "Inactivo"}
          </StatusBadge>

          <StatusBadge status={alumno.propietario ? "success" : "default"}>
            {alumno.propietario ? "Propietario" : "No propietario"}
          </StatusBadge>
        </div>
      </div>
    </div>
  );
}
