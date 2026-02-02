import { Alumno, Caballo,Clase } from "@/lib/api";

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
      return c.alumnoId === alumnoId;
    }

    return true;
  });
};
