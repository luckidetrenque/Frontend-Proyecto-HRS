// 📚 TOOLTIPS PREDEFINIDOS PARA CAMPOS COMUNES
export const TOOLTIPS = {
  // ALUMNOS
  alumno: {
    dni: "Ingresa solo números sin puntos. Ejemplo: 12345678",
    telefono: "Incluye código de área sin 0 ni 15. Ejemplo: 221234567",
    email: "Email opcional pero recomendado para comunicaciones",
    cantidadClases: "Cantidad de clases mensuales según el plan contratado",
    propietario: "Marca si el alumno tiene su propio caballo",
    activo: "Los alumnos inactivos no aparecen al programar clases",
    fechaInscripcion: "Fecha en que el alumno se inscribió en la escuela",
    fechaNacimiento: "Necesaria para cálculo de edad y seguro",
    caballoPropio: "Selecciona el caballo que pertenece al alumno",
  },

  // INSTRUCTORES
  instructor: {
    color: "Color único para identificar al instructor en el calendario",
    activo: "Los instructores inactivos no aparecen al programar clases",
  },

  // CABALLOS
  caballo: {
    tipo: "Escuela: propiedad de la escuela, disponible para todos. Privado: pertenece a un alumno específico",
    disponible: "Desmarca si el caballo está enfermo, lesionado o en descanso",
  },

  // CLASES
  clase: {
    dia: "Fecha en que se realizará la clase",
    hora: "Hora de inicio de la clase",
    especialidad:
      "EQUINOTERAPIA: terapia asistida. EQUITACION: clase regular. ADIESTRAMIENTO: entrenamiento del caballo. MONTA: monta libre",
    estado:
      "PROGRAMADA: pendiente. INICIADA: en curso. COMPLETADA: finalizada. CANCELADA: cancelada. ACA: ausencia con aviso. ASA: ausencia sin aviso",
    esPrueba:
      "Marca si es una clase de prueba para evaluar un nuevo alumno (debe estar inactivo)",
  },
};