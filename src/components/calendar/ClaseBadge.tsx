/**
 * ClaseBadge.tsx
 * Badge que muestra información de una clase
 * ✅ Con color de instructor como fondo
 * ✅ Texto contrastante automático
 * ✅ Borde sólido según estado de la clase
 */

import { Clase } from "@/lib/api";
import { cn } from "@/lib/utils";

import { getContrastColor } from "./calendar.styles";

interface ClaseBadgeProps {
  clase: Clase;
  alumnoNombre: string;
  caballoNombre?: string;
  compact?: boolean;
  instructorColor?: string;
}

export function ClaseBadge({
  clase,
  alumnoNombre,
  caballoNombre,
  compact = false,
  instructorColor = "#6B7280", // gris por defecto
}: ClaseBadgeProps) {
  // Calcular color de texto según el fondo del instructor
  const textColor = getContrastColor(instructorColor);

  // Mapeo de estados a colores de borde
  const borderColors: Record<string, string> = {
    PROGRAMADA: "#F59E0B", // amber
    INICIADA: "#3B82F6", // blue
    COMPLETADA: "#10B981", // green
    CANCELADA: "#EF4444", // red
    ACA: "#8B5CF6", // purple
    ASA: "#EC4899", // pink
  };

  const borderColor = borderColors[clase.estado] || "#D1D5DB"; // gris por defecto

  return (
    <div
      className={cn(
        "rounded-md px-2 py-1 text-xs font-medium transition-all cursor-pointer hover:shadow-md",
        compact ? "text-[10px] px-1.5 py-0.5" : "text-xs",
      )}
      style={{
        backgroundColor: instructorColor,
        color: textColor,
        borderLeft: `12px solid ${borderColor}`,
        boxSizing: "border-box",
      }}
    >
      <div className="truncate font-semibold text-[12px]">
        <span>{alumnoNombre}</span>
        {caballoNombre && (
          <span title={`Clase ${clase.estado.toLowerCase()}`}>
            {" / "}
            {caballoNombre}
          </span>
        )}
      </div>
    </div>
  );
}
