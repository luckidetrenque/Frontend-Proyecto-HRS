import { Alumno, Caballo, Clase } from "@/lib/api";

export const puedeEditarClase = (clase: Clase): boolean => {
  return !["COMPLETADA", "INICIADA", "CANCELADA"].includes(clase.estado);
};

export const verificarConflictoHorario = (
  clases: Clase[],
  dia: string,
  hora: string,
  caballoId: number,
  instructorId: number,
  claseActualId?: number,
): { tieneConflicto: boolean; mensaje: string } => {
  const conflicto = clases.find((c) => {
    if (claseActualId && c.id === claseActualId) return false;

    if (c.dia === dia && c.hora.startsWith(hora) && c.estado !== "CANCELADA") {
      return c.caballoId === caballoId || c.instructorId === instructorId;
    }
    return false;
  });

  if (conflicto) {
    const tipo = conflicto.caballoId === caballoId ? "caballo" : "instructor";
    return {
      tieneConflicto: true,
      mensaje: `El ${tipo} ya tiene una clase programada a esa hora`,
    };
  }

  return { tieneConflicto: false, mensaje: "" };
};

export const filtrarCaballosDisponibles = (
  caballos: Caballo[],
  alumnoId: number | undefined,
): Caballo[] => {
  return caballos.filter((c: Caballo) => {
    if (!c.disponible) return false;

    // Si el caballo es privado, solo puede usarlo su dueño
    if (c.tipo === "PRIVADO") {
      return c.propietarios.some((p) => p.id === alumnoId);
    }

    return true;
  });
};

/**
 * Valida las reglas de negocio para clases de prueba.
 * Retorna { esValido, mensaje } para que el llamador decida cómo mostrar el error.
 */
export const validarClasePrueba = (
  clases: Clase[],
  alumno: Alumno | null, // ← acepta null
  especialidad: string,
  claseActualId?: number,
): { esValido: boolean; mensaje: string } => {
  if (!alumno) return { esValido: true, mensaje: "" };
  // Regla 1: No puede tener clase de prueba si ya tiene esa especialidad activa
  const yaTomoEspecialidad = clases.some(
    (c) =>
      c.alumnoId === alumno.id &&
      c.especialidad === especialidad &&
      (c.estado === "PROGRAMADA" ||
        c.estado === "INICIADA" ||
        c.estado === "COMPLETADA"),
  );

  if (yaTomoEspecialidad) {
    return {
      esValido: false,
      mensaje: `No se puede asignar una clase de prueba de ${especialidad} a ${alumno.nombre} ${alumno.apellido} porque ya tiene una clase de esa especialidad programada o completada`,
    };
  }

  // Regla 2: No puede repetir clase de prueba de la misma especialidad
  const yaTomoClaseDePrueba = clases.some(
    (c) =>
      c.alumnoId === alumno.id &&
      c.esPrueba &&
      c.especialidad === especialidad &&
      (!claseActualId || c.id !== claseActualId),
  );

  if (yaTomoClaseDePrueba) {
    return {
      esValido: false,
      mensaje: `${alumno.nombre} ${alumno.apellido} ya ha tomado una clase de prueba anteriormente`,
    };
  }

  return { esValido: true, mensaje: "" };
};

/**
 * Resuelve el ID del caballo a usar en la clase:
 * prioriza el del formulario, luego el caballo propio del alumno, si no retorna 0.
 */
export const resolverCaballoId = (
  caballoIdForm: FormDataEntryValue | null,
  alumno?: Alumno,
): number => {
  if (caballoIdForm) return Number(caballoIdForm);
  if (alumno?.caballoPropio && typeof alumno.caballoPropio === "object") {
    return alumno.caballoPropio.id;
  }
  return 0;
};

/**
 * Efecto secundario al cambiar la especialidad en el formulario.
 * Si es MONTA, fuerza el alumno comodín.
 * Retorna el alumnoId que corresponde (o el actual si no cambió).
 */
export const handleEspecialidadChangeEffect = (
  value: string,
  alumnoComodinId: number,
  setEspecialidad: (v: string) => void,
  setAlumnoId: (v: string) => void,
) => {
  setEspecialidad(value);
  if (value === "MONTA") {
    setAlumnoId(String(alumnoComodinId));
  }
};

/**
 * Valida que la clase no termine después de las 18:30.
 * Retorna { esValido, mensaje } para que el llamador muestre el error.
 */
export const validarHorarioLimite = (
  hora: string,
  duracion: number,
): { esValido: boolean; mensaje: string } => {
  if (!hora) return { esValido: true, mensaje: "" };

  const [hh, mm] = hora.slice(0, 5).split(":").map(Number);
  const inicioEnMinutos = hh * 60 + mm;
  const finEnMinutos = inicioEnMinutos + duracion;
  const limiteEnMinutos = 18 * 60 + 30; // 18:30

  if (finEnMinutos > limiteEnMinutos) {
    const finHH = String(Math.floor(finEnMinutos / 60)).padStart(2, "0");
    const finMM = String(finEnMinutos % 60).padStart(2, "0");
    return {
      esValido: false,
      mensaje: `La clase no puede terminar después de las 18:30. Con duración de ${duracion} minutos a las ${hora} terminaría a las ${finHH}:${finMM}.`,
    };
  }

  return { esValido: true, mensaje: "" };
};
