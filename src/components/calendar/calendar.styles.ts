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
    "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100",
  CANCELADA: "bg-red-50 text-red-700 border-red-300 hover:bg-red-100",
  ACA: "bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100",
  ASA: "bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100",
};

// Estados disponibles
export const ESTADOS: Clase["estado"][] = [
  "PROGRAMADA",
  "INICIADA",
  "COMPLETADA",
  "CANCELADA",
  "ACA",
  "ASA",
];

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

// ID del alumno comodín para la especialidad MONTA
// Este ID debe coincidir con el alumno "Escuela - Comodín" en tu base de datos
export const ALUMNO_COMODIN_ID = 1; // Ajusta este ID según tu BD
