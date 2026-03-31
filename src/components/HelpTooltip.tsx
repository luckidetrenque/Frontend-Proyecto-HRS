/**
 * HelpTooltip.tsx - VERSIÓN 3.0
 * Tooltip contextual inline para formularios.
 *
 * El componente HelpTooltip es siempre el mismo — lo que varía es el contenido
 * que se le pasa desde CommonTooltips, que ahora está organizado por sección
 * con variantes donde el texto difiere según el rol.
 *
 * USO BÁSICO:
 * import { HelpTooltip, CommonTooltips } from '@/components/HelpTooltip';
 *
 * <Label htmlFor="dni">
 *   DNI
 *   <HelpTooltip content={CommonTooltips.alumno.dni} />
 * </Label>
 *
 * USO CON ROL:
 * const { user } = useAuth();
 * const esAlumno = user?.rol === 'ALUMNO';
 *
 * <HelpTooltip content={
 *   esAlumno
 *     ? CommonTooltips.clase.estadoParaAlumno
 *     : CommonTooltips.clase.estado
 * } />
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

// ─── Tooltips organizados por sección ────────────────────────────────────────
export const CommonTooltips = {

  // ══════════════════════════════════════════════════════════════════════════
  // ALUMNOS — usados principalmente por ADMIN e INSTRUCTOR
  // ══════════════════════════════════════════════════════════════════════════
  alumno: {
    dni:             'Solo números sin puntos. El sistema valida duplicados en tiempo real.',
    telefono:        'Sin 0 ni 15. Ejemplo: 221234567. El sistema agrega +549 automáticamente.',
    codigoArea:      'Código de área sin el 0 inicial. Ejemplo: 221 para La Plata.',
    email:           'Email opcional pero recomendado para comunicaciones.',
    cantidadClases:  'Plan mensual contratado: 4, 8, 12 o 16 clases.',
    fechaInscripcion:'Fecha de inscripción en la escuela. Por defecto: hoy.',
    fechaNacimiento: 'Necesaria para registros legales y de seguro.',
    activo:          'Los alumnos inactivos no aparecen al programar clases regulares. Sí pueden tener clases de prueba.',

    // Pensión — solo relevante para ADMIN
    tipoPension:    'Sin caballo: se asigna uno disponible por clase. Reserva escuela: siempre el mismo caballo de escuela. Caballo propio: el alumno tiene su caballo en pensión.',
    cuotaPension:   'Solo para Caballo Propio. Entera = pensión completa. Media = 50%. Tercio ≈ 33%.',
    caballoPropio:  'Seleccioná el caballo asignado. Para "Reserva escuela" elegí tipo ESCUELA; para "Caballo propio" elegí tipo PRIVADO.',

    // Validaciones
    dniDuplicado:    '⚠️ Ya existe un alumno con este DNI. El DNI debe ser único.',
    clasesRestantes: 'Clases disponibles este mes. Se descuentan las COMPLETADAS y las ASA.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // INSTRUCTORES — usados principalmente por ADMIN
  // ══════════════════════════════════════════════════════════════════════════
  instructor: {
    dni:            'Solo números sin puntos. Se valida duplicados automáticamente.',
    color:          'Color único para identificar al instructor en el calendario. Solo el admin puede cambiarlo.',
    activo:         'Los instructores inactivos no aparecen al programar clases.',
    telefono:       'Sin 0 ni 15. El sistema agrega +549.',
    fechaNacimiento:'Fecha de nacimiento para registros.',
    email:          'Email de contacto visible para el admin y los alumnos.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CABALLOS
  // ══════════════════════════════════════════════════════════════════════════
  caballo: {
    nombre:     'Nombre del caballo. Debe ser identificable para evitar confusiones.',
    tipo:       'ESCUELA: disponible para todos. PRIVADO: solo para su propietario registrado.',
    disponible: 'Desmarcá si el caballo está enfermo, en descanso o fuera de servicio temporalmente.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CLASES — con variantes por rol
  // ══════════════════════════════════════════════════════════════════════════
  clase: {
    dia:         'Fecha en que se realizará la clase.',
    hora:        'Hora de inicio. Las clases no pueden terminar después de las 18:30.',
    duracion:    '30 minutos: una franja en el calendario. 60 minutos: dos franjas consecutivas.',

    alumno:      'Alumno que tomará la clase. Si tiene caballo asignado, se preselecciona. No aplica para MONTA.',
    instructor:  'Instructor que dictará la clase. Se identifica por color en el calendario.',
    caballo:     'Caballo para la clase. Los privados solo pueden usarlos sus propietarios.',

    especialidad:
      'EQUITACIÓN: clase regular. ADIESTRAMIENTO: entrenamiento del caballo. EQUINOTERAPIA: terapia asistida. MONTA: monta libre (sin alumno específico).',

    // Estados — versión general (ADMIN/INSTRUCTOR)
    estado:
      'PROGRAMADA: pendiente. INICIADA: en progreso. COMPLETADA: finalizada. CANCELADA: cancelada. ACA: Ausente Con Aviso. ASA: Ausente Sin Aviso. RESERVADA: solicitud del alumno pendiente.',

    // Estados — versión simplificada para ALUMNO
    estadoParaAlumno:
      '⏳ RESERVADA: pendiente de confirmación. 🟠 PROGRAMADA: confirmada. 🟢 COMPLETADA: realizada. 🟣 ACA: avisaste tu ausencia. 🌸 ASA: no asististe sin aviso.',

    // Detalle de cada estado
    estadoProgramada: '🟠 Clase confirmada, pendiente de realizarse.',
    estadoIniciada:   '🔵 Clase en progreso actualmente.',
    estadoCompletada: '🟢 Clase finalizada. No se puede editar ni eliminar.',
    estadoCancelada:  '🔴 Clase cancelada. No se puede editar ni eliminar.',
    estadoACA:        '🟣 Ausencia Con Aviso: el alumno avisó que no vendría.',
    estadoASA:        '🌸 Ausencia Sin Aviso: el alumno no asistió sin previo aviso.',
    estadoReservada:  '⏳ Solicitud enviada por el alumno. Pendiente de confirmación por el instructor o admin.',

    // Clases de prueba — relevantes para ADMIN/INSTRUCTOR
    esPrueba:
      '🎓 Clase de prueba. No cuenta para la cuota mensual del alumno. Tiene identificación visual especial.',
    pruebaPersonaNueva:
      'Persona sin cuenta de alumno. Solo necesitás nombre y apellido. Se registra temporalmente.',
    pruebaAlumnoExistente:
      'Alumno ya registrado que quiere probar una especialidad nueva. Debe estar INACTIVO en el sistema.',

    // Validaciones
    horarioLimite:
      '⚠️ Las clases no pueden terminar después de las 18:30. El sistema calcula la hora de fin automáticamente.',
    conflictoHorario:
      '⚠️ El caballo o instructor ya tienen otra clase que se solapa con este horario.',
    restriccionEdicion:
      '⚠️ Las clases COMPLETADAS, INICIADAS y CANCELADAS son históricas. No se pueden editar ni eliminar.',

    observaciones: 'Notas adicionales: motivo de cancelación, condiciones especiales, novedades, etc.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CALENDARIO
  // ══════════════════════════════════════════════════════════════════════════
  calendario: {
    vistas:         'Mes: resumen mensual. Semana: 7 días con detalle. Día: grilla tipo Excel por caballo.',
    filtroAlumno:   'Mostrá solo las clases del alumno seleccionado.',
    filtroInstructor:'Mostrá solo las clases del instructor seleccionado.',

    // Solo relevantes para ADMIN
    copiarSemana:   'Copia TODAS las clases de lunes a domingo a otra semana. Útil para programaciones recurrentes.',
    eliminarRango:  '⚠️ Elimina TODAS las clases entre dos fechas. No se puede deshacer.',
    cancelarDia:    'Cancela todas las clases PROGRAMADAS del día. No afecta las completadas o ya canceladas.',
    exportarExcel:  'Descarga el calendario en Excel con colores de instructores y leyenda.',
    exportarSemana: 'Descarga la semana completa en Excel.',
    exportarMes:    'Descarga el mes completo en Excel.',
    expandir:       'Expandí el calendario a pantalla completa. Presioná Escape para cerrar.',

    // Para ALUMNO
    reservarClase:
      'Hacé clic en el número del día para solicitar una clase. Quedará en estado RESERVADA hasta que el instructor la confirme.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // REPORTES
  // ══════════════════════════════════════════════════════════════════════════
  reportes: {
    periodo:
      'Rango de fechas para el análisis. Por defecto: mes actual. Cambiar las fechas actualiza todos los datos.',
    filtroInstructor: 'Filtrá todos los reportes por instructor específico.',
    filtroAlumno:     'Filtrá todos los reportes por alumno específico.',
    exportar:
      'Descarga el reporte en Excel con formato profesional, cabeceras y totales.',
    tasaConversion:
      'Porcentaje de personas que tomaron una clase de prueba y luego se inscribieron como alumnos activos.',
    eficiencia:
      '% de clases completadas sobre el total de clases asignadas al instructor.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // FINANZAS — solo ADMIN
  // ══════════════════════════════════════════════════════════════════════════
  finanzas: {
    cuotasProyectadas: 'Total de cuotas de todos los alumnos activos según sus planes contratados.',
    pensiones:         'Total mensual de pensiones (Reserva de Escuela o Caballo Propio).',
    honorarios:        'Total a pagar a instructores = base mensual + (clases completadas × honorario por clase).',
    balanceProyectado: 'Ingresos (cuotas + pensiones) − Egresos (honorarios).',
    configuracion:     'Valores base para los cálculos. Solo el administrador puede modificarlos.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // USUARIOS — solo ADMIN
  // ══════════════════════════════════════════════════════════════════════════
  usuarios: {
    rol:     'ADMIN: acceso total. INSTRUCTOR: gestión de clases y alumnos. ALUMNO: solo sus propias clases.',
    activo:  'Suspender bloquea el acceso sin eliminar los datos ni el historial.',
    eliminar:'Eliminar un usuario es permanente y no se puede deshacer.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // VALIDACIONES GENÉRICAS
  // ══════════════════════════════════════════════════════════════════════════
  validaciones: {
    campoRequerido: '* Campo obligatorio.',
    formatoInvalido:'El formato ingresado no es válido.',
  },
};

/**
 * ═══════════════════════════════════════════════════════════════
 * EJEMPLOS DE USO POR ROL
 * ═══════════════════════════════════════════════════════════════
 *
 * ── ADMIN / INSTRUCTOR: formulario de alumno ──────────────────
 *
 * import { HelpTooltip, CommonTooltips } from '@/components/HelpTooltip';
 *
 * <Label htmlFor="tipoPension">
 *   Tipo de Pensión
 *   <HelpTooltip content={CommonTooltips.alumno.tipoPension} />
 * </Label>
 *
 * <Label htmlFor="cuotaPension">
 *   Cuota de Pensión
 *   <HelpTooltip content={CommonTooltips.alumno.cuotaPension} />
 * </Label>
 *
 * ── Con validación dinámica de DNI ────────────────────────────
 *
 * <Label htmlFor="dni">
 *   DNI *
 *   <HelpTooltip content={
 *     validacionDni?.duplicado
 *       ? CommonTooltips.alumno.dniDuplicado
 *       : CommonTooltips.alumno.dni
 *   } />
 * </Label>
 *
 * ── Formulario de clase con variante de rol ───────────────────
 *
 * const { user } = useAuth();
 * const esAlumno = user?.rol === 'ALUMNO' || user?.rol === 'ROLE_ALUMNO';
 *
 * <Label>Estado
 *   <HelpTooltip content={
 *     esAlumno
 *       ? CommonTooltips.clase.estadoParaAlumno
 *       : CommonTooltips.clase.estado
 *   } />
 * </Label>
 *
 * ── Clase de prueba ───────────────────────────────────────────
 *
 * <Label>
 *   Clase de Prueba
 *   <HelpTooltip content={CommonTooltips.clase.esPrueba} />
 * </Label>
 *
 * {esPrueba && tipoPrueba === 'persona_nueva' && (
 *   <Label>
 *     Nombre
 *     <HelpTooltip
 *       content={CommonTooltips.clase.pruebaPersonaNueva}
 *       side="right"
 *     />
 *   </Label>
 * )}
 *
 * {esPrueba && tipoPrueba === 'alumno_existente' && (
 *   <Label>
 *     Alumno
 *     <HelpTooltip
 *       content={CommonTooltips.clase.pruebaAlumnoExistente}
 *       side="right"
 *     />
 *   </Label>
 * )}
 *
 * ── ALUMNO: reservar clase ────────────────────────────────────
 *
 * <Label>Reservar una clase
 *   <HelpTooltip content={CommonTooltips.calendario.reservarClase} />
 * </Label>
 */
