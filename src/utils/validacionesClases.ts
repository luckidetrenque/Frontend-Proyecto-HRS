import { Alumno, Caballo, Clase } from "@/lib/api";

export const puedeEditarClase = (clase: Clase): boolean => {
  return !["COMPLETADA", "INICIADA", "CANCELADA"].includes(clase.estado);
};

export const verificarConflictoHorario = (
  clases: Clase[],
  dia: string,
  hora: string,
  duracion: number,
  caballoId: number,
  instructorId: number,
  claseActualId?: number,
): { tieneConflicto: boolean; mensaje: string } => {
  // Convertir hora a minutos
  const [hh, mm] = hora.split(":").map(Number);
  const inicioMinutos = hh * 60 + mm;
  const finMinutos = inicioMinutos + duracion;

  const conflicto = clases.find((c) => {
    if (claseActualId && c.id === claseActualId) return false;
    if (c.dia !== dia || c.estado === "CANCELADA") return false;

    // Calcular rango de la clase existente
    const [cHH, cMM] = c.hora.slice(0, 5).split(":").map(Number);
    const cInicio = cHH * 60 + cMM;
    const cFin = cInicio + (c.duracion || 30);

    // ✅ Verificar solapamiento de rangos
    const haySolapamiento = !(finMinutos <= cInicio || inicioMinutos >= cFin);

    if (haySolapamiento) {
      return c.caballoId === caballoId || c.instructorId === instructorId;
    }

    return false;
  });

  if (conflicto) {
    const tipo = conflicto.caballoId === caballoId ? "caballo" : "instructor";
    return {
      tieneConflicto: true,
      mensaje: `El ${tipo} ya tiene una clase programada que se solapa con este horario (${conflicto.hora.slice(0, 5)} - ${conflicto.duracion} min)`,
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
  alumno: Alumno | null,
  especialidad: string,
  claseActualId?: number,
): { esValido: boolean; mensaje: string } => {
  if (!alumno) return { esValido: true, mensaje: "" };
  // REGLA 1: No puede tener clase de prueba si ya tiene esa especialidad
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
      mensaje: `No se puede asignar una clase de prueba de ${especialidad} porque ${alumno.nombre} ${alumno.apellido} ya tiene una clase de esa especialidad`,
    };
  }

  // REGLA 2: No puede repetir clase de prueba de la misma especialidad
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
      mensaje: `${alumno.nombre} ${alumno.apellido} ya ha tomado una clase de prueba de ${especialidad} anteriormente`,
    };
  }

  return { esValido: true, mensaje: "" };
};

/**
 * Resuelve el ID del caballo a usar en la clase:
 * prioriza el del formulario, luego el caballo propio del alumno, si no retorna 0.
//  */
// export const resolverCaballoId = (
//   caballoIdForm: FormDataEntryValue | null,
//   alumno?: Alumno,
// ): number => {
//   if (caballoIdForm) return Number(caballoIdForm);
//   if (alumno?.caballoPropio && typeof alumno.caballoPropio === "object") {
//     return alumno.caballoPropio.id;
//   }
//   return 0;
// };

/**
 * Efecto secundario al cambiar la especialidad en el formulario.
 * Si es MONTA, fuerza el alumno comodín.
 * Retorna el alumnoId que corresponde (o el actual si no cambió).
 */
export const handleEspecialidadChangeEffect = (
  value: string,
  setEspecialidad: (v: string) => void,
  setAlumnoId: (v: string) => void,
) => {
  setEspecialidad(value);
  if (value === "MONTA") {
    setAlumnoId(null);
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
