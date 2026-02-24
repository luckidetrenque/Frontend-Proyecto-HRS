/**
 * calendar.styles.ts
 * Constantes, estilos y configuraciones del calendario
 */

import { Clase } from "@/lib/api";

// Horarios disponibles (cada 30 minutos de 9:00 a 18:30)
export const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
];

// Especialidades disponibles
export const ESPECIALIDADES = [
  "EQUINOTERAPIA",
  "EQUITACION",
  "ADIESTRAMIENTO",
  "MONTA",
] as const;

// Motivos de cancelación predefinidos
export const MOTIVOS_CANCELACION = [
  "Lluvia",
  "Feriado",
  "Mantenimiento",
  "Evento Especial",
  "Emergencia",
  "Otro",
];

// Colores por estado (para StatusBadge)
export const ESTADO_COLORS: Record<
  string,
  "success" | "warning" | "error" | "info" | "default"
> = {
  PROGRAMADA: "warning",
  INICIADA: "info",
  COMPLETADA: "success",
  CANCELADA: "error",
  ACA: "info",
  ASA: "info",
};

// Estilos Tailwind por estado (para celdas y badges)
export const ESTADO_STYLES: Record<string, string> = {
  PROGRAMADA: "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100",
  INICIADA: "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100",
  COMPLETADA:
    "bg-emerald-50 text-emerald-700 border-emerald hover:bg-emerald-100",
  CANCELADA: "bg-red-50 text-red-700 border-red-300 hover:bg-red-100",
  ACA: "bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100",
  ASA: "bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100",
};

// Estilos específicos para clases de prueba
export const CLASE_PRUEBA_STYLE =
  "bg-orange-50 border-orange-400 border-l-4 text-orange-900";
export const CLASE_PRUEBA_BADGE =
  "bg-orange-500/20 text-orange-700 border-orange-400";

// Estados disponibles
export const ESTADOS: Clase["estado"][] = [
  "PROGRAMADA",
  "INICIADA",
  "COMPLETADA",
  "CANCELADA",
  "ACA",
  "ASA",
];

export const COLOR = "#FFFFFF";

// Íconos por estado (para uso en badges o listas)
export const ESTADO_ICONS: Record<string, string> = {
  PROGRAMADA: "Clock",
  INICIADA: "Play",
  COMPLETADA: "Check",
  CANCELADA: "X",
  ACA: "AlertTriangle", // Ausencia con aviso
  ASA: "AlertTriangle", // Ausencia sin aviso
};

// Tipos de vista
export type ViewMode = "month" | "week" | "day";

// Configuración de días de la semana
export const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const DIAS_SEMANA_COMPLETOS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

// Límites de clases mostradas por celda según la vista
export const MAX_CLASES_POR_CELDA = {
  month: 3,
  week: 10,
  day: Infinity,
};

/**
 * Obtiene el estilo de una clase según su estado y si es de prueba
 */
export const getClaseStyle = (estado: string, esPrueba?: boolean): string => {
  // Si es clase de prueba, usar estilo naranja con borde izquierdo destacado
  if (esPrueba) {
    return CLASE_PRUEBA_STYLE;
  }

  // Si no es de prueba, usar el estilo normal del estado
  return ESTADO_STYLES[estado] || ESTADO_STYLES["PROGRAMADA"];
};

/**
 * Calcula el color de texto óptimo (blanco o negro) según el color de fondo
 * para garantizar buen contraste y accesibilidad
 */
export const getContrastColor = (hexColor: string): string => {
  // Remover el # si existe
  const hex = hexColor.replace("#", "");

  // Convertir a RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calcular luminancia relativa (fórmula W3C)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Retornar blanco para fondos oscuros, negro para fondos claros
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

// Etiquetas legibles por estado
export const ESTADO_LABELS: Record<string, string> = {
  PROGRAMADA: "Programada",
  INICIADA: "Iniciada",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  ACA: "Ausente con Aviso",
  ASA: "Ausente sin Aviso",
};

/**
 * Devuelve la hora en formato HH:mm usando zona America/Argentina/Buenos_Aires.
 * Útil para poblar inputs type="time" con el valor correcto.
 */
export const obtenerHoraArgentina = (isoString?: string): string => {
  if (!isoString) return "";
  const fecha = new Date(isoString);
  if (isNaN(fecha.getTime())) return "";
  return fecha
    .toLocaleTimeString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(":", ":");
};

/**
 * Formatea una fecha ISO completa mostrando sólo la hora HH:mm
 * con zona America/Argentina/Buenos_Aires.
 * Útil para mostrar la hora en tablas y tarjetas.
 */
export const formatearConZona = (diaHoraIso?: string): string => {
  if (!diaHoraIso) return "-";
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(diaHoraIso));
};

/**
 * Convierte una hora HH:mm de un input de formulario al formato HH:mm
 * que espera la API (normalizado sin offsets de timezone).
 * Usar siempre que se procese el campo "hora" de un formulario de clase.
 */
export const parsearHoraParaApi = (horaInput: string): string => {
  if (!horaInput) return "09:00";
  // Devolver directamente HH:mm sin ninguna conversión de zona horaria
  return horaInput.slice(0, 5);
};

/**
 * Opciones de estado con label legible para usar en FilterBar y Selects.
 * Combina el valor de la API con el texto para el usuario.
 */
export const ESTADOS_OPTIONS = ESTADOS.map((estado) => ({
  value: estado,
  label: ESTADO_LABELS[estado] ?? estado,
}));

/**
 * Opciones de especialidad para usar en FilterBar y Selects.
 */
export const ESPECIALIDADES_OPTIONS = ESPECIALIDADES.map((esp) => ({
  value: esp,
  label: esp,
}));
