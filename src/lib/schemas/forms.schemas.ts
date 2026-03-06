import { z } from "zod";

// ─────────────────────────────────────────────
// Caballo
// ─────────────────────────────────────────────
export const caballoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  tipo: z.enum(["ESCUELA", "PRIVADO"]),
  disponible: z.boolean(),
});

export type CaballoFormValues = z.infer<typeof caballoSchema>;

// ─────────────────────────────────────────────
// Instructor
// ─────────────────────────────────────────────
export const instructorSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellido: z.string().min(1, "El apellido es obligatorio"),
  dni: z
    .string()
    .min(7, "El DNI debe tener al menos 7 dígitos")
    .regex(/^\d+$/, "Solo números sin puntos"),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  codigoArea: z.string().optional().default(""),
  telefono: z.string().optional().default(""),
  email: z
    .union([z.literal(""), z.string().email("Email inválido")])
    .optional()
    .default(""),
  activo: z.boolean(),
  color: z.string().min(1, "Seleccioná un color"),
});

export type InstructorFormValues = z.infer<typeof instructorSchema>;

// ─────────────────────────────────────────────
// Alumno — schema discriminado por tipoPension
// ─────────────────────────────────────────────
const alumnoBase = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellido: z.string().min(1, "El apellido es obligatorio"),
  dni: z
    .string()
    .min(7, "El DNI debe tener al menos 7 dígitos")
    .regex(/^\d+$/, "Solo números sin puntos"),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  codigoArea: z.string().optional().default(""),
  telefono: z.string().optional().default(""),
  email: z
    .union([z.literal(""), z.string().email("Email inválido")])
    .optional()
    .default(""),
  fechaInscripcion: z.string().min(1, "La fecha de inscripción es obligatoria"),
  cantidadClases: z.coerce.number().int().min(1),
  activo: z.boolean(),
});

export const alumnoSchema = z.discriminatedUnion("tipoPension", [
  alumnoBase.extend({
    tipoPension: z.literal("SIN_CABALLO"),
    caballoId: z.null().optional(),
    cuotaPension: z.null().optional(),
  }),
  alumnoBase.extend({
    tipoPension: z.literal("RESERVA_ESCUELA"),
    caballoId: z.coerce.number().nullable().optional(),
    cuotaPension: z.null().optional(),
  }),
  alumnoBase.extend({
    tipoPension: z.literal("CABALLO_PROPIO"),
    caballoId: z.coerce.number().nullable().optional(),
    cuotaPension: z.enum(["ENTERA", "MEDIA", "TERCIO"]),
  }),
]);

export type AlumnoFormValues = z.infer<typeof alumnoSchema>;

// ─────────────────────────────────────────────
// Clase
// ─────────────────────────────────────────────
export const claseSchema = z.object({
  especialidad: z.string().min(1, "La especialidad es obligatoria"),
  alumnoId: z.string().optional(), // Se convierte a number | null en el handler
  instructorId: z.string().min(1, "Seleccioná un instructor"),
  caballoId: z.string().optional(),
  dia: z.string().min(1, "El día es obligatorio"),
  hora: z.string().min(1, "La hora es obligatoria"),
  duracion: z.coerce.number().int().positive(),
  observaciones: z.string().optional().default(""),
  esPruebaChecked: z.boolean().optional().default(false),
  tipoPrueba: z.enum(["alumno_existente", "persona_nueva"]).optional(),
  nombrePrueba: z.string().optional().default(""),
  apellidoPrueba: z.string().optional().default(""),
});

export type ClaseFormValues = z.infer<typeof claseSchema>;
