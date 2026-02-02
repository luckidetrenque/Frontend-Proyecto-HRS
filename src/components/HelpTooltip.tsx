/**
 * HelpTooltip.tsx
 * Componente de tooltip inline para ayuda contextual en formularios
 * 
 * USO:
 * import { HelpTooltip } from '@/components/HelpTooltip';
 * 
 * <Label htmlFor="dni">
 *   DNI
 *   <HelpTooltip content="Solo números sin puntos ni guiones" />
 * </Label>
 */

import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTooltipProps {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function HelpTooltip({ content, side = 'top' }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Ayuda"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// 📚 TOOLTIPS PREDEFINIDOS PARA CAMPOS COMUNES
export const CommonTooltips = {
  // ALUMNOS
  alumno: {
    dni: 'Ingresa solo números sin puntos. Ejemplo: 12345678',
    telefono: 'Incluye código de área sin 0 ni 15. Ejemplo: 221234567',
    email: 'Email opcional pero recomendado para comunicaciones',
    cantidadClases: 'Cantidad de clases mensuales según el plan contratado',
    propietario: 'Marca si el alumno tiene su propio caballo',
    activo: 'Los alumnos inactivos no aparecen al programar clases',
    fechaInscripcion: 'Fecha en que el alumno se inscribió en la escuela',
    fechaNacimiento: 'Necesaria para cálculo de edad y seguro',
  },
  
  // INSTRUCTORES
  instructor: {
    color: 'Color único para identificar al instructor en el calendario',
    activo: 'Los instructores inactivos no aparecen al programar clases',
  },
  
  // CABALLOS
  caballo: {
    tipo: 'Escuela: propiedad de la escuela, disponible para todos. Privado: pertenece a un alumno específico',
    disponible: 'Desmarca si el caballo está enfermo, lesionado o en descanso',
  },
  
  // CLASES
  clase: {
    dia: 'Fecha en que se realizará la clase',
    hora: 'Hora de inicio de la clase',
    especialidad: 'EQUINOTERAPIA: terapia asistida. EQUITACION: clase regular. ADIESTRAMIENTO: entrenamiento del caballo. MONTA: monta libre',
    estado: 'PROGRAMADA: pendiente. INICIADA: en curso. COMPLETADA: finalizada. CANCELADA: cancelada. ACA: ausencia con aviso. ASA: ausencia sin aviso',
    esPrueba: 'Marca si es una clase de prueba para evaluar un nuevo alumno (debe estar inactivo)',
  },
};

/**
 * Ejemplo de uso en un formulario:
 * 
 * <div className="space-y-2">
 *   <Label htmlFor="dni">
 *     DNI
 *     <HelpTooltip content={CommonTooltips.alumno.dni} />
 *   </Label>
 *   <Input id="dni" name="dni" type="text" required />
 * </div>
 * 
 * O con tooltip personalizado:
 * 
 * <Label htmlFor="custom">
 *   Campo Personalizado
 *   <HelpTooltip content="Ayuda específica para este campo" side="right" />
 * </Label>
 */
