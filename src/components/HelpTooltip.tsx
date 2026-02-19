/**
 * HelpTooltip.tsx - VERSIÓN ACTUALIZADA Y COMPLETA
 * Componente de tooltip inline para ayuda contextual en formularios
 * 
 * ACTUALIZACIONES:
 * ✅ Tooltips para tipos de pensión
 * ✅ Tooltips para cuota de pensión
 * ✅ Tooltips para duración de clases
 * ✅ Tooltips para clases de prueba
 * ✅ Tooltips para validaciones
 * ✅ Tooltips para estados extendidos (ACA/ASA)
 * 
 * USO:
 * import { HelpTooltip, CommonTooltips } from '@/components/HelpTooltip';
 * 
 * <Label htmlFor="dni">
 *   DNI
 *   <HelpTooltip content={CommonTooltips.alumno.dni} />
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
  // ========================================
  // ALUMNOS
  // ========================================
  alumno: {
    dni: 'Ingresa solo números sin puntos. Ejemplo: 12345678. El sistema valida automáticamente duplicados.',
    telefono: 'Sin 0 ni 15. Ejemplo: 221234567. El sistema agrega automáticamente +549.',
    email: 'Email opcional pero recomendado para comunicaciones y notificaciones.',
    cantidadClases: 'Plan mensual: 4, 8, 12 o 16 clases según lo contratado.',
    fechaInscripcion: 'Fecha en que el alumno se inscribió en la escuela. Por defecto: hoy.',
    fechaNacimiento: 'Necesaria para cálculo de edad, seguro y registro legal.',
    activo: 'Los alumnos inactivos NO aparecen al programar clases (excepto clases de prueba).',
    
    // NUEVOS - TIPOS DE PENSIÓN
    tipoPension: 'Sin caballo: se asigna por clase. Reserva escuela: reserva un caballo específico. Caballo propio: el alumno tiene su caballo.',
    cuotaPension: 'Entera: pensión completa. Media: media pensión. Tercio: un tercio de pensión.',
    caballoPropio: 'Selecciona el caballo asignado al alumno (escuela o privado según el tipo de pensión).',
    
    // VALIDACIONES
    dniDuplicado: '⚠️ Ya existe un alumno con este DNI. El DNI debe ser único.',
    clasesRestantes: 'Clases restantes del mes según el plan contratado. Se calcula automáticamente.',
  },
  
  // ========================================
  // INSTRUCTORES
  // ========================================
  instructor: {
    dni: 'Solo números sin puntos. El sistema valida duplicados automáticamente.',
    color: 'Color único para identificar visualmente al instructor en el calendario. Hay 7 colores disponibles.',
    activo: 'Los instructores inactivos NO aparecen al programar clases.',
    telefono: 'Sin 0 ni 15. El sistema agrega automáticamente +549.',
    fechaNacimiento: 'Fecha de nacimiento del instructor para registros.',
  },
  
  // ========================================
  // CABALLOS
  // ========================================
  caballo: {
    nombre: 'Nombre del caballo. Debe ser único para evitar confusiones.',
    tipo: 'ESCUELA: propiedad de la escuela, disponible para todos. PRIVADO: pertenece a un alumno específico y solo puede usarlo su propietario.',
    disponible: 'Desmarca si el caballo está enfermo, lesionado, en descanso o no disponible temporalmente.',
  },
  
  // ========================================
  // CLASES
  // ========================================
  clase: {
    dia: 'Fecha en que se realizará la clase. Formato: dd/mm/yyyy',
    hora: 'Hora de inicio. IMPORTANTE: Las clases NO pueden terminar después de las 18:30.',
    duracion: '30 minutos (una franja) o 60 minutos (dos franjas consecutivas en el calendario).',
    
    // ALUMNOS Y PARTICIPANTES
    alumno: 'Alumno que tomará la clase. Si tiene caballo asignado, aparecerá preseleccionado.',
    instructor: 'Instructor que dictará la clase. Se identifica por color en el calendario.',
    caballo: 'Caballo para la clase. Los privados solo pueden usarlos sus propietarios.',
    
    // ESPECIALIDADES
    especialidad: 'EQUITACIÓN: clase regular. ADIESTRAMIENTO: entrenamiento del caballo. EQUINOTERAPIA: terapia asistida. MONTA: monta libre (asigna automáticamente alumno comodín).',
    
    // ESTADOS
    estado: 'PROGRAMADA: pendiente de realizar. INICIADA: en progreso. COMPLETADA: finalizada exitosamente. CANCELADA: clase cancelada. ACA: Ausencia Con Aviso. ASA: Ausencia Sin Aviso.',
    estadoProgramada: '🟠 Clase agendada, pendiente de realizarse.',
    estadoIniciada: '🔵 Clase en progreso actualmente.',
    estadoCompletada: '🟢 Clase finalizada exitosamente. No se puede editar.',
    estadoCancelada: '🔴 Clase cancelada. No se puede editar.',
    estadoACA: '🟣 Ausencia Con Aviso: el alumno avisó que no asistiría.',
    estadoASA: '🌸 Ausencia Sin Aviso: el alumno no asistió sin previo aviso.',
    
    // CLASES DE PRUEBA
    esPrueba: '🎓 Clase de prueba para evaluar a un nuevo alumno o especialidad nueva. NO cuenta para la cuota mensual.',
    pruebaPersonaNueva: 'Persona sin cuenta de alumno. Solo necesitas nombre y apellido.',
    pruebaAlumnoExistente: 'Alumno registrado que quiere probar una especialidad nueva. Debe estar INACTIVO.',
    
    // VALIDACIONES
    horarioLimite: '⚠️ Las clases NO pueden terminar después de las 18:30. El sistema calcula automáticamente.',
    conflictoHorario: '⚠️ El caballo o instructor ya tiene otra clase a esta hora.',
    restriccionEdicion: '⚠️ No se pueden editar clases COMPLETADAS, INICIADAS o CANCELADAS (son registro histórico).',
    
    // OBSERVACIONES
    observaciones: 'Notas adicionales sobre la clase. Ej: Motivo de cancelación, condiciones especiales, etc.',
  },
  
  // ========================================
  // CALENDARIO
  // ========================================
  calendario: {
    vistasModo: 'Mes: vista mensual. Semana: 7 días. Día: tipo Excel con columnas por caballo.',
    filtroAlumno: 'Mostrar solo clases de un alumno específico.',
    filtroInstructor: 'Mostrar solo clases de un instructor específico.',
    copiarSemana: 'Copia TODAS las clases de una semana completa (lun-dom) a otra semana.',
    eliminarRango: 'Elimina TODAS las clases entre dos fechas. ⚠️ No se puede deshacer.',
    cancelarDia: 'Cancela TODAS las clases PROGRAMADAS del día (no afecta completadas ni canceladas).',
    exportarExcel: 'Descarga el calendario del día en formato Excel profesional con colores y leyenda.',
  },
  
  // ========================================
  // REPORTES
  // ========================================
  reportes: {
    periodo: 'Rango de fechas para el análisis. Por defecto: mes actual.',
    tipoReporte: 'General: resumen completo. Alumnos: estadísticas de alumnos. Clases: análisis de clases. Instructores: carga de trabajo. Caballos: uso de caballos.',
    exportar: 'Descarga el reporte en formato Excel con formato profesional.',
  },
  
  // ========================================
  // VALIDACIONES GLOBALES
  // ========================================
  validaciones: {
    campoRequerido: '* Campo obligatorio',
    formatoInvalido: 'El formato ingresado no es válido',
    valorMinimo: 'El valor debe ser mayor al mínimo permitido',
    valorMaximo: 'El valor debe ser menor al máximo permitido',
  },
};

/**
 * ========================================
 * EJEMPLOS DE USO COMPLETOS
 * ========================================
 */

/**
 * EJEMPLO 1: Formulario de Alumno con tooltips
 * 
 * <div className="grid grid-cols-2 gap-4">
 *   <div className="space-y-2">
 *     <Label htmlFor="dni">
 *       DNI *
 *       <HelpTooltip content={CommonTooltips.alumno.dni} />
 *     </Label>
 *     <Input id="dni" name="dni" type="text" required />
 *   </div>
 * 
 *   <div className="space-y-2">
 *     <Label htmlFor="telefono">
 *       Teléfono *
 *       <HelpTooltip content={CommonTooltips.alumno.telefono} />
 *     </Label>
 *     <Input id="telefono" name="telefono" type="tel" required />
 *   </div>
 * </div>
 * 
 * <div className="space-y-2">
 *   <Label htmlFor="tipoPension">
 *     Tipo de Pensión
 *     <HelpTooltip content={CommonTooltips.alumno.tipoPension} />
 *   </Label>
 *   <Select name="tipoPension">
 *     <SelectTrigger><SelectValue /></SelectTrigger>
 *     <SelectContent>
 *       <SelectItem value="SIN_CABALLO">Sin caballo asignado</SelectItem>
 *       <SelectItem value="RESERVA_ESCUELA">Reserva caballo de escuela</SelectItem>
 *       <SelectItem value="CABALLO_PROPIO">Caballo propio</SelectItem>
 *     </SelectContent>
 *   </Select>
 * </div>
 * 
 * {tipoPension !== "SIN_CABALLO" && (
 *   <div className="space-y-2">
 *     <Label htmlFor="cuotaPension">
 *       Cuota de Pensión
 *       <HelpTooltip content={CommonTooltips.alumno.cuotaPension} />
 *     </Label>
 *     <Select name="cuotaPension">
 *       <SelectTrigger><SelectValue /></SelectTrigger>
 *       <SelectContent>
 *         <SelectItem value="ENTERA">Entera</SelectItem>
 *         <SelectItem value="MEDIA">Media</SelectItem>
 *         <SelectItem value="TERCIO">Tercio</SelectItem>
 *       </SelectContent>
 *     </Select>
 *   </div>
 * )}
 */

/**
 * EJEMPLO 2: Formulario de Clase con tooltips
 * 
 * <div className="grid grid-cols-2 gap-4">
 *   <div className="space-y-2">
 *     <Label htmlFor="hora">
 *       Hora de Inicio *
 *       <HelpTooltip content={CommonTooltips.clase.horarioLimite} />
 *     </Label>
 *     <Input id="hora" name="hora" type="time" required />
 *   </div>
 * 
 *   <div className="space-y-2">
 *     <Label htmlFor="duracion">
 *       Duración
 *       <HelpTooltip content={CommonTooltips.clase.duracion} />
 *     </Label>
 *     <Select name="duracion">
 *       <SelectTrigger><SelectValue /></SelectTrigger>
 *       <SelectContent>
 *         <SelectItem value="30">30 minutos</SelectItem>
 *         <SelectItem value="60">60 minutos</SelectItem>
 *       </SelectContent>
 *     </Select>
 *   </div>
 * </div>
 * 
 * <div className="space-y-2">
 *   <Label>
 *     Tipo de Clase
 *     <HelpTooltip content={CommonTooltips.clase.esPrueba} />
 *   </Label>
 *   <div className="flex items-center gap-3 rounded-md border border-orange-300 bg-orange-50 p-2.5">
 *     <input type="checkbox" id="esPrueba" name="esPrueba" />
 *     <Label htmlFor="esPrueba">Clase de Prueba 🎓</Label>
 *   </div>
 * </div>
 * 
 * {esPrueba && (
 *   <div className="rounded-md border border-orange-200 bg-orange-50 p-4 space-y-3">
 *     <div className="flex gap-6">
 *       <label className="flex items-center gap-2">
 *         <input type="radio" name="tipoPrueba" value="persona_nueva" />
 *         <span className="text-sm">
 *           Persona nueva
 *           <HelpTooltip content={CommonTooltips.clase.pruebaPersonaNueva} side="right" />
 *         </span>
 *       </label>
 *       <label className="flex items-center gap-2">
 *         <input type="radio" name="tipoPrueba" value="alumno_existente" />
 *         <span className="text-sm">
 *           Alumno existente
 *           <HelpTooltip content={CommonTooltips.clase.pruebaAlumnoExistente} side="right" />
 *         </span>
 *       </label>
 *     </div>
 *   </div>
 * )}
 */

/**
 * EJEMPLO 3: Tooltip personalizado
 * 
 * <Label htmlFor="custom">
 *   Campo Personalizado
 *   <HelpTooltip 
 *     content="Este es un tooltip específico para este campo único" 
 *     side="right" 
 *   />
 * </Label>
 */

/**
 * EJEMPLO 4: Tooltip con validación dinámica
 * 
 * <div className="space-y-2">
 *   <Label htmlFor="dni">
 *     DNI *
 *     <HelpTooltip content={
 *       validacionDni?.duplicado 
 *         ? CommonTooltips.alumno.dniDuplicado 
 *         : CommonTooltips.alumno.dni
 *     } />
 *   </Label>
 *   <Input 
 *     id="dni" 
 *     name="dni" 
 *     className={validacionDni?.duplicado ? "border-red-500" : ""}
 *   />
 * </div>
 */
