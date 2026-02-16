/**
 * CalendarControls.tsx
 * Barra de navegación del calendario (← Hoy →, selector de vista)
 */

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ViewMode } from "./clases.constants";

interface CalendarControlsProps {
  currentDate: Date;
  viewMode: ViewMode;
  onNavigate: (direction: "prev" | "next") => void;
  onToday: () => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export function CalendarControls({
  currentDate,
  viewMode,
  onNavigate,
  onToday,
  onViewModeChange,
}: CalendarControlsProps) {
  const getViewTitle = () => {
    if (viewMode === "month") {
      return format(currentDate, "MMMM yyyy", { locale: es });
    } else if (viewMode === "week") {
      return format(currentDate, "'Semana del' d 'de' MMMM", { locale: es });
    } else {
      return format(currentDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
    }
  };

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Navegación */}
      <div className="flex items-center gap-2">
        <h2 className="ml-4 font-display text-xl font-semibold capitalize">
          {getViewTitle()}
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onNavigate("prev")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onToday}>
          Hoy
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onNavigate("next")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Selector de Vista */}
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("month")}
        >
          Mes
        </Button>
        <Button
          variant={viewMode === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("week")}
        >
          Semana
        </Button>
        <Button
          variant={viewMode === "day" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("day")}
        >
          Día
        </Button>
      </div>
    </div>
  );
}
