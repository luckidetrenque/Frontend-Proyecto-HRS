/**
 * HelpSystem.tsx - VERSIÓN ACTUALIZADA Y COMPLETA
 * Sistema de Ayuda Integrado para Escuela de Equitación
 *
 * INSTRUCCIONES DE USO:
 * 1. Importar en Layout.tsx: import { HelpSystem } from '@/components/HelpSystem';
 * 2. Agregar al final del Layout: <HelpSystem />
 * 3. El botón flotante aparecerá automáticamente en todas las páginas
 *
 * ACTUALIZACIONES:
 * ✅ Documentación completa de Clases de Prueba
 * ✅ Validaciones del sistema detalladas
 * ✅ Tipos de pensión completos
 * ✅ Herramientas del calendario
 * ✅ Estados de clase (ACA/ASA)
 * ✅ Sección de Validaciones separada
 * ✅ Problemas comunes y soluciones
 */

import {
  AlertTriangle,
  BarChart,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  HelpCircle,
  Info,
  Landmark,
  Lightbulb,
  Search,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type WorkflowStep = {
  title: string;
  content: string;
};

type Workflow = {
  title: string;
  icon: string;
  steps: WorkflowStep[];
};

// 📚 CONTENIDO DE AYUDA ESPECÍFICO PARA CADA PÁGINA
const helpContent = {
  "/": {
    title: "Página Principal",
    description: "Bienvenido al sistema de gestión de la escuela",
    workflows: [
      {
        title: "Primeros Pasos",
        icon: "🚀",
        steps: [
          {
            title: "Acceso Rápido",
            content:
              "Haz clic en cualquier tarjeta para acceder directamente a esa sección del sistema.",
          },
          {
            title: "Navegación",
            content:
              "Usa el menú lateral izquierdo para moverte entre las diferentes secciones.",
          },
          {
            title: "Búsqueda Global",
            content:
              "Utiliza la barra de búsqueda superior para encontrar alumnos, instructores o caballos rápidamente.",
          },
        ],
      },
    ],
    tips: [
      "Las tarjetas muestran estadísticas en tiempo real",
      "El sistema guarda automáticamente tu sesión",
      "Puedes volver al inicio en cualquier momento haciendo clic en el logo",
    ],
    validations: [],
  },
  "/alumnos": {
    title: "Gestión de Alumnos",
    description: "Administra la información de todos los alumnos inscriptos",
    workflows: [
      {
        title: "Agregar un Nuevo Alumno",
        icon: "➕",
        steps: [
          {
            title: "Paso 1: Abrir formulario",
            content:
              'Haz clic en el botón "Nuevo Alumno" en la esquina superior derecha.',
          },
          {
            title: "Paso 2: Completar datos personales",
            content:
              "Ingresa nombre, apellido, DNI (solo números sin puntos) y fecha de nacimiento.",
          },
          {
            title: "Paso 3: Datos de contacto",
            content:
              "Completa teléfono (sin 0 ni 15, ej: 221234567) y email opcional. El sistema agregará automáticamente +549 al teléfono.",
          },
          {
            title: "Paso 4: Seleccionar plan de clases",
            content:
              "Elige la cantidad de clases mensuales: 4, 8, 12 o 16 clases.",
          },
          {
            title: "Paso 5: Configurar pensión de caballo",
            content:
              "Selecciona el tipo: Sin caballo asignado, Reserva caballo de escuela, o Caballo propio.",
          },
          {
            title: "Paso 6: Asignar caballo (si aplica)",
            content:
              "Si seleccionaste reserva o caballo propio, elige el caballo y la cuota de pensión (Entera/Media/Tercio).",
          },
          {
            title: "Paso 7: Guardar",
            content:
              'Haz clic en "Crear Alumno". El sistema validará el DNI y creará el registro automáticamente.',
          },
        ],
      },
      {
        title: "Editar un Alumno Existente",
        icon: "✏️",
        steps: [
          {
            title: "Método 1: Desde la tabla",
            content:
              'Haz clic en el menú de tres puntos (⋮) al final de la fila del alumno y selecciona "Editar".',
          },
          {
            title: "Método 2: Desde el perfil",
            content:
              'Haz clic en la fila del alumno para ver su perfil completo, luego clic en "Editar".',
          },
          {
            title: "Realizar cambios",
            content:
              "Modifica los campos necesarios. Puedes cambiar el plan, el caballo asignado, o marcar como inactivo.",
          },
          {
            title: "Guardar cambios",
            content:
              'Haz clic en "Guardar Cambios". El sistema validará y actualizará la información.',
          },
        ],
      },
      {
        title: "Eliminar un Alumno",
        icon: "🗑️",
        steps: [
          {
            title: "Acceder al menú",
            content:
              "Haz clic en el menú de tres puntos (⋮) al final de la fila del alumno.",
          },
          {
            title: "Seleccionar eliminar",
            content: 'Elige "Eliminar" del menú desplegable.',
          },
          {
            title: "Confirmar",
            content:
              "Confirma la acción en el diálogo. Esta acción no se puede deshacer.",
          },
        ],
      },
      {
        title: "Contactar Alumno",
        icon: "📱",
        steps: [
          {
            title: "Abrir menú de acciones",
            content:
              "Haz clic en el menú de tres puntos (⋮) al final de la fila.",
          },
          {
            title: "Elegir método",
            content:
              'Selecciona "Enviar WhatsApp" o "Enviar correo" según prefieras.',
          },
          {
            title: "Mensaje automático",
            content:
              "Para WhatsApp, se abre un mensaje pre-cargado que puedes personalizar antes de enviar.",
          },
        ],
      },
      {
        title: "Filtrar y Buscar Alumnos",
        icon: "🔍",
        steps: [
          {
            title: "Usar búsqueda global",
            content:
              "Escribe nombre o apellido en la barra de búsqueda superior para filtrado en tiempo real.",
          },
          {
            title: "Aplicar filtros",
            content:
              "Usa los selectores de filtro para mostrar solo alumnos por plan (4/8/12/16 clases), estado (Activo/Inactivo), o propietarios.",
          },
          {
            title: "Resetear filtros",
            content:
              'Haz clic en "Limpiar Filtros" para volver a ver todos los alumnos.',
          },
        ],
      },
      {
        title: "Cambiar Vista: Tabla / Cards",
        icon: "👁️",
        steps: [
          {
            title: "Vista Tabla",
            content:
              'Haz clic en "Tabla" para ver todos los alumnos en formato tradicional de filas y columnas.',
          },
          {
            title: "Vista Cards",
            content:
              'Haz clic en "Cards" para ver tarjetas visuales con información clave de cada alumno.',
          },
        ],
      },
    ],
    tips: [
      "El teléfono se formatea automáticamente con el prefijo argentino +549",
      "Los alumnos inactivos no aparecen al programar clases",
      "Haz clic en cualquier fila de la tabla para ver el perfil completo del alumno",
      "Los alumnos propietarios tienen asignado un caballo específico (escuela o privado)",
      "La validación de DNI duplicado es automática al escribir",
    ],
    validations: [
      {
        rule: "DNI único",
        description:
          "No se permiten DNI duplicados. El sistema valida automáticamente al escribir 9 o más dígitos.",
        severity: "error",
      },
      {
        rule: "Formato de teléfono",
        description:
          "El sistema agrega automáticamente +549 para números argentinos. Ingresa sin 0 ni 15.",
        severity: "info",
      },
      {
        rule: "Estado activo/inactivo",
        description:
          "Solo los alumnos activos aparecen al programar clases. Los inactivos pueden tomar clases de prueba.",
        severity: "warning",
      },
    ],
  },
  "/instructores": {
    title: "Gestión de Instructores",
    description: "Administra el equipo de instructores de la escuela",
    workflows: [
      {
        title: "Agregar un Nuevo Instructor",
        icon: "➕",
        steps: [
          {
            title: "Paso 1: Abrir formulario",
            content:
              'Haz clic en el botón "Nuevo Instructor" en la esquina superior derecha.',
          },
          {
            title: "Paso 2: Datos personales",
            content:
              "Completa nombre, apellido, DNI (solo números), y fecha de nacimiento.",
          },
          {
            title: "Paso 3: Contacto",
            content: "Ingresa teléfono (sin 0 ni 15) y email opcional.",
          },
          {
            title: "Paso 4: Asignar color",
            content:
              "Selecciona un color único para identificar al instructor en el calendario. Hay 7 colores predefinidos.",
          },
          {
            title: "Paso 5: Guardar",
            content:
              'Haz clic en "Crear Instructor". El instructor quedará activo automáticamente.',
          },
        ],
      },
      {
        title: "Editar un Instructor",
        icon: "✏️",
        steps: [
          {
            title: "Abrir formulario",
            content:
              'Haz clic en el menú (⋮) y selecciona "Editar", o accede desde el perfil del instructor.',
          },
          {
            title: "Modificar datos",
            content:
              "Cambia cualquier campo necesario, incluyendo el color de identificación.",
          },
          {
            title: "Cambiar estado",
            content:
              'Usa el switch "Está activo" para activar/desactivar al instructor.',
          },
          {
            title: "Guardar",
            content: 'Haz clic en "Guardar Cambios" para actualizar.',
          },
        ],
      },
      {
        title: "Sistema de Colores",
        icon: "🎨",
        steps: [
          {
            title: "Colores en el calendario",
            content:
              "Cada clase se muestra con el color del instructor asignado para fácil identificación visual.",
          },
          {
            title: "Colores predefinidos",
            content:
              "Hay 7 colores disponibles: rojo, púrpura, naranja, rosa, amarillo, azul y verde.",
          },
          {
            title: "Cambiar color",
            content:
              "Puedes cambiar el color de un instructor en cualquier momento desde su formulario de edición.",
          },
        ],
      },
    ],
    tips: [
      "El color del instructor se usa en el calendario para identificar rápidamente quién da cada clase",
      "Los instructores inactivos no aparecen al programar clases",
      "La validación de DNI duplicado funciona igual que en alumnos",
    ],
    validations: [
      {
        rule: "DNI único",
        description: "No se permiten instructores con DNI duplicado.",
        severity: "error",
      },
      {
        rule: "Color único recomendado",
        description:
          "Aunque no es obligatorio, se recomienda asignar colores diferentes para mejor identificación.",
        severity: "info",
      },
      {
        rule: "Estado activo",
        description:
          "Solo los instructores activos pueden ser asignados a nuevas clases.",
        severity: "warning",
      },
    ],
  },
  "/caballos": {
    title: "Gestión de Caballos",
    description: "Control de caballos de la escuela y privados",
    workflows: [
      {
        title: "Registrar un Caballo de Escuela",
        icon: "🐴",
        steps: [
          {
            title: "Paso 1: Abrir formulario",
            content: 'Haz clic en "Nuevo Caballo".',
          },
          {
            title: "Paso 2: Ingresar nombre",
            content: "Escribe el nombre del caballo.",
          },
          {
            title: "Paso 3: Seleccionar tipo",
            content:
              'Elige "Escuela" del selector de tipo. Los caballos de escuela están disponibles para todos los alumnos.',
          },
          {
            title: "Paso 4: Guardar",
            content:
              'Haz clic en "Crear Caballo". Quedará disponible automáticamente.',
          },
        ],
      },
      {
        title: "Registrar un Caballo Privado",
        icon: "🏇",
        steps: [
          {
            title: "Paso 1: Crear el caballo",
            content:
              'Sigue los pasos anteriores pero selecciona "Privado" como tipo.',
          },
          {
            title: "Paso 2: Vincular al propietario",
            content:
              'Ve a la sección Alumnos, edita el alumno propietario y asigna este caballo en el campo "Caballo propio".',
          },
          {
            title: "Paso 3: Configurar pensión",
            content:
              "Al asignar el caballo al alumno, selecciona la cuota de pensión (Entera/Media/Tercio).",
          },
        ],
      },
      {
        title: "Marcar Caballo como No Disponible",
        icon: "⚠️",
        steps: [
          {
            title: "Editar caballo",
            content: "Accede al formulario de edición del caballo.",
          },
          {
            title: "Desactivar disponibilidad",
            content:
              'Desmarca el switch "Está disponible" si el caballo está enfermo, lesionado o en descanso.',
          },
          {
            title: "Guardar",
            content:
              "El caballo no aparecerá en los selectores al programar clases.",
          },
        ],
      },
    ],
    tips: [
      "Los caballos de tipo ESCUELA pueden ser usados por cualquier alumno",
      "Los caballos PRIVADOS solo pueden ser usados por su propietario",
      'Marca como "no disponible" temporalmente en lugar de eliminar',
    ],
    validations: [
      {
        rule: "Caballos privados restringidos",
        description:
          "Los caballos privados solo pueden ser asignados a clases de su propietario.",
        severity: "error",
      },
      {
        rule: "Disponibilidad",
        description:
          "Los caballos marcados como no disponibles no aparecen al programar clases.",
        severity: "warning",
      },
    ],
  },
  "/clases": {
    title: "Gestión de Clases",
    description: "Programa y gestiona las clases de equitación",
    workflows: [
      {
        title: "Programar una Clase Regular",
        icon: "📝",
        steps: [
          {
            title: "Paso 1: Abrir formulario",
            content: 'Haz clic en "Nueva Clase".',
          },
          {
            title: "Paso 2: Seleccionar fecha y hora",
            content:
              "Elige el día y la hora de inicio. El sistema validará que no termine después de las 18:30.",
          },
          {
            title: "Paso 3: Elegir alumno",
            content:
              "Selecciona el alumno del selector. Si tiene caballo asignado, aparecerá preseleccionado.",
          },
          {
            title: "Paso 4: Asignar instructor",
            content: "Elige el instructor que dará la clase.",
          },
          {
            title: "Paso 5: Seleccionar caballo",
            content:
              "Si el alumno tiene caballo asignado, aparecerá por defecto. Puedes cambiarlo si es necesario.",
          },
          {
            title: "Paso 6: Especialidad y duración",
            content:
              "Selecciona la especialidad (Equitación/Adiestramiento/Equinoterapia/Monta) y duración (30 o 60 minutos).",
          },
          {
            title: "Paso 7: Guardar",
            content:
              "La clase se creará con estado PROGRAMADA automáticamente.",
          },
        ],
      },
      {
        title: "Crear Clase de Prueba - Persona Nueva",
        icon: "🎓",
        steps: [
          {
            title: "Paso 1: Marcar como clase de prueba",
            content: 'Al crear la clase, marca el checkbox "Clase de Prueba".',
          },
          {
            title: "Paso 2: Seleccionar tipo",
            content: 'Elige la opción "Persona nueva" en los radio buttons.',
          },
          {
            title: "Paso 3: Ingresar datos",
            content:
              "Escribe el nombre y apellido de la persona que tomará la clase de prueba. NO es necesario crear una cuenta de alumno.",
          },
          {
            title: "Paso 4: Completar resto de datos",
            content:
              "Selecciona instructor, caballo, especialidad y horario como en una clase normal.",
          },
          {
            title: "Paso 5: Guardar",
            content:
              "La clase se creará y aparecerá con el emoji 🎓 y borde naranja en el calendario.",
          },
        ],
      },
      {
        title: "Crear Clase de Prueba - Alumno Existente",
        icon: "🎯",
        steps: [
          {
            title: "Paso 1: Marcar como clase de prueba",
            content: 'Marca el checkbox "Clase de Prueba" al crear la clase.',
          },
          {
            title: "Paso 2: Seleccionar tipo",
            content: 'Elige "Alumno existente" en los radio buttons.',
          },
          {
            title: "Paso 3: Seleccionar alumno",
            content:
              "Busca y selecciona el alumno en el selector. IMPORTANTE: El alumno debe estar INACTIVO.",
          },
          {
            title: "Paso 4: Validación automática",
            content:
              "El sistema verificará: (1) Que el alumno no tenga clases de esa especialidad, (2) Que no haya tomado clase de prueba de esa especialidad antes.",
          },
          {
            title: "Paso 5: Completar y guardar",
            content:
              "Si pasa las validaciones, completa los demás datos y guarda.",
          },
        ],
      },
      {
        title: "Clase de Especialidad MONTA",
        icon: "🏇",
        steps: [
          {
            title: "Seleccionar especialidad",
            content: 'Elige "MONTA" del selector de especialidad.',
          },
          {
            title: "Alumno asignado automáticamente",
            content:
              "El sistema asignará automáticamente el alumno comodín (ID 1) para monta libre.",
          },
          {
            title: "Completar datos",
            content:
              "Solo necesitas elegir instructor, caballo, hora y duración.",
          },
        ],
      },
      {
        title: "Cambiar Estado de una Clase",
        icon: "🔄",
        steps: [
          {
            title: "Desde la lista",
            content: "Accede al detalle de la clase haciendo clic en la fila.",
          },
          {
            title: "Usar selector de estado",
            content:
              "En el detalle, verás un selector con todos los estados disponibles.",
          },
          {
            title: "Seleccionar nuevo estado",
            content:
              "Elige entre: PROGRAMADA, INICIADA, COMPLETADA, CANCELADA, ACA (Ausencia Con Aviso), ASA (Ausencia Sin Aviso).",
          },
          {
            title: "Confirmar",
            content: 'Haz clic en "Actualizar Estado" para guardar el cambio.',
          },
        ],
      },
      {
        title: "Editar una Clase",
        icon: "✏️",
        steps: [
          {
            title: "Verificar estado",
            content:
              "Solo se pueden editar clases en estado PROGRAMADA. Las clases COMPLETADAS, INICIADAS o CANCELADAS no son editables.",
          },
          {
            title: "Abrir formulario",
            content: 'Haz clic en el menú (⋮) y selecciona "Editar".',
          },
          {
            title: "Modificar datos",
            content:
              "Cambia los campos necesarios: hora, instructor, caballo, etc.",
          },
          {
            title: "Guardar",
            content:
              "El sistema volverá a validar horarios y conflictos antes de guardar.",
          },
        ],
      },
    ],
    tips: [
      "Las clases de prueba NO cuentan para la cuota mensual del alumno",
      "El sistema valida automáticamente que no haya conflictos de horario (mismo caballo o instructor)",
      "Las clases de 60 minutos ocupan dos franjas horarias en el calendario",
      "Los alumnos con clases restantes del mes verán una alerta al programar",
    ],
    validations: [
      {
        rule: "Horario límite 18:30",
        description:
          "Ninguna clase puede terminar después de las 18:30. El sistema calcula automáticamente la hora de fin según la duración.",
        severity: "error",
      },
      {
        rule: "Clase de prueba - Alumno inactivo",
        description:
          "Las clases de prueba para alumnos existentes solo pueden asignarse a alumnos INACTIVOS.",
        severity: "error",
      },
      {
        rule: "Clase de prueba - Sin especialidad previa",
        description:
          "Un alumno no puede tener clase de prueba de una especialidad que ya tomó antes.",
        severity: "error",
      },
      {
        rule: "Clase de prueba - No repetible",
        description:
          "No se puede asignar más de una clase de prueba de la misma especialidad al mismo alumno.",
        severity: "error",
      },
      {
        rule: "Restricción de edición",
        description:
          "No se pueden editar clases COMPLETADAS, INICIADAS o CANCELADAS. Son registro histórico.",
        severity: "warning",
      },
      {
        rule: "Conflictos de horario",
        description:
          "El sistema verifica que el caballo y el instructor no tengan otra clase a la misma hora.",
        severity: "warning",
      },
      {
        rule: "Clases restantes",
        description:
          "El sistema monitorea las clases restantes del alumno y muestra alertas, pero permite crear clases aunque se agote el cupo.",
        severity: "info",
      },
    ],
  },
  "/calendario": {
    title: "Calendario de Clases",
    description: "Vista interactiva de las clases programadas",
    workflows: [
      {
        title: "Crear Clase desde el Calendario",
        icon: "➕",
        steps: [
          {
            title: "Cambiar a Vista Día",
            content:
              'Haz doble clic en el selector de vista y elige "Día" para ver el calendario estilo Excel.',
          },
          {
            title: "Hacer doble clic en celda vacía",
            content:
              "Haz doble clic en cualquier celda vacía (intersección de hora + caballo).",
          },
          {
            title: "Datos precargados",
            content:
              "El formulario se abre con el día, hora y caballo ya seleccionados automáticamente.",
          },
          {
            title: "Completar resto",
            content: "Solo necesitas elegir alumno, instructor y especialidad.",
          },
          {
            title: "Guardar",
            content: "La clase aparecerá inmediatamente en el calendario.",
          },
        ],
      },
      {
        title: "Ver Detalle de una Clase",
        icon: "👁️",
        steps: [
          {
            title: "Hacer clic en la clase",
            content: "En cualquier vista, haz clic sobre una clase existente.",
          },
          {
            title: "Popover de información",
            content:
              "Se abre un popover mostrando: Alumno, Instructor, Caballo, Estado, Observaciones.",
          },
          {
            title: "Acciones rápidas",
            content:
              "Desde el popover puedes cambiar el estado, editar o eliminar la clase.",
          },
        ],
      },
      {
        title: "Copiar Clases de una Semana",
        icon: "📋",
        steps: [
          {
            title: "Abrir herramienta",
            content:
              'Haz clic en el botón "Copiar Clases" en la barra de herramientas.',
          },
          {
            title: "Seleccionar semana origen",
            content: "Elige un día cualquiera de la semana que quieres copiar.",
          },
          {
            title: "Seleccionar semana destino",
            content:
              "Elige un día de la semana donde quieres pegar las clases.",
          },
          {
            title: "Cantidad de semanas",
            content:
              "Indica cuántas semanas consecutivas quieres copiar (por defecto: 1).",
          },
          {
            title: "Confirmar",
            content:
              "El sistema copiará TODAS las clases de la semana completa (lunes a domingo).",
          },
        ],
      },
      {
        title: "Eliminar Clases en Rango",
        icon: "🗑️",
        steps: [
          {
            title: "Abrir herramienta",
            content:
              'Haz clic en "Eliminar Clases" en la barra de herramientas.',
          },
          {
            title: "Seleccionar fechas",
            content: "Elige la fecha de inicio y fecha de fin del rango.",
          },
          {
            title: "Confirmar",
            content:
              "El sistema eliminará TODAS las clases entre esas fechas. Esta acción no se puede deshacer.",
          },
        ],
      },
      {
        title: "Cancelar Todas las Clases del Día",
        icon: "❌",
        steps: [
          {
            title: "Ir a Vista Día",
            content: "Cambia a la vista de día del calendario.",
          },
          {
            title: "Abrir herramienta",
            content:
              'Haz clic en el botón "Cancelar Día" (visible solo en vista día).',
          },
          {
            title: "Seleccionar motivo",
            content:
              "Elige entre: Lluvia, Feriado, Mantenimiento, Evento Especial, Emergencia, u Otro.",
          },
          {
            title: "Observaciones (opcional)",
            content: 'Si eliges "Otro", escribe el motivo de la cancelación.',
          },
          {
            title: "Confirmar",
            content:
              "Solo se cancelarán las clases en estado PROGRAMADA. Las COMPLETADAS o CANCELADAS no se tocarán.",
          },
        ],
      },
      {
        title: "Exportar Calendario a Excel",
        icon: "📊",
        steps: [
          {
            title: "Vista Día",
            content:
              "El botón de exportación solo está disponible en Vista Día.",
          },
          {
            title: "Hacer clic en Exportar",
            content:
              'Haz clic en el botón "Exportar Excel" en la barra de herramientas.',
          },
          {
            title: "Descarga automática",
            content:
              "Se descargará un archivo Excel con formato profesional: título, fecha, clases con colores de instructores, leyenda, y listo para imprimir.",
          },
        ],
      },
      {
        title: "Cambiar Estado Rápido",
        icon: "⚡",
        steps: [
          {
            title: "Hacer clic en la clase",
            content: "Abre el popover de la clase haciendo clic sobre ella.",
          },
          {
            title: "Usar selector de estado",
            content: "En el popover, selecciona el nuevo estado del dropdown.",
          },
          {
            title: "Confirmación instantánea",
            content:
              "El cambio se guarda automáticamente y el color de la clase se actualiza.",
          },
        ],
      },
      {
        title: "Aplicar Filtros",
        icon: "🔍",
        steps: [
          {
            title: "Filtro por alumno",
            content:
              "Selecciona un alumno del filtro para ver solo sus clases.",
          },
          {
            title: "Filtro por instructor",
            content:
              "Selecciona un instructor para ver solo las clases que él/ella dicta.",
          },
          {
            title: "Combinar filtros",
            content:
              "Puedes combinar ambos filtros para búsquedas más específicas.",
          },
          {
            title: "Limpiar",
            content:
              'Haz clic en "Limpiar Filtros" para volver a ver todas las clases.',
          },
        ],
      },
    ],
    tips: [
      "En Vista Mes, se muestran hasta 3 clases por día + indicador de más",
      "En Vista Día, las clases de 60 minutos ocupan dos celdas consecutivas",
      "El color de fondo de cada clase corresponde al instructor asignado",
      "El borde izquierdo indica el estado: Naranja=Programada, Azul=Iniciada, Verde=Completada, Rojo=Cancelada",
      "Las clases de prueba tienen el emoji 🎓 y borde naranja",
      'Los días con "Copiar Semana" replican toda la semana completa (lun-dom)',
    ],
    validations: [
      {
        rule: "Cancelación masiva",
        description:
          'La herramienta "Cancelar Día" solo afecta clases PROGRAMADAS. No modifica clases ya completadas o canceladas.',
        severity: "info",
      },
      {
        rule: "Conflictos visuales",
        description:
          "Las celdas con conflicto (mismo caballo o instructor a la misma hora) se marcan con ⚠️.",
        severity: "warning",
      },
    ],
  },
  "/reportes": {
    title: "Reportes y Estadísticas",
    description: "Análisis detallado de la actividad de la escuela",
    workflows: [
      {
        title: "Generar Reporte por Período",
        icon: "📅",
        steps: [
          {
            title: "Seleccionar fechas",
            content:
              "En la parte superior, elige Fecha Inicio y Fecha Fin del período a analizar.",
          },
          {
            title: "Ver KPIs",
            content:
              "Las tarjetas superiores muestran: Alumnos Activos, Total Clases, Instructores, Ingresos Estimados.",
          },
          {
            title: "Navegar por tabs",
            content:
              "Usa las pestañas: General, Alumnos, Clases, Instructores, Caballos para ver reportes específicos.",
          },
        ],
      },
      {
        title: "Exportar Reporte a Excel",
        icon: "📊",
        steps: [
          {
            title: "Ir a la pestaña deseada",
            content:
              "Elige la sección que quieres exportar: Alumnos, Clases, Instructores, o Caballos.",
          },
          {
            title: "Hacer clic en Exportar",
            content:
              'Busca el botón "Exportar" en la esquina superior derecha de la tabla.',
          },
          {
            title: "Descarga automática",
            content:
              "Se descarga un archivo Excel con formato profesional, cabeceras, totales y listo para imprimir.",
          },
        ],
      },
      {
        title: "Interpretar Reportes de Clases",
        icon: "📈",
        steps: [
          {
            title: "Distribución por estado",
            content:
              "Muestra cuántas clases están en cada estado (Programadas, Completadas, Canceladas, etc.).",
          },
          {
            title: "Distribución por día",
            content:
              "Indica qué días de la semana tienen más clases programadas.",
          },
          {
            title: "Asistencia por alumno",
            content:
              "Tabla detallada con % de asistencia de cada alumno en el período.",
          },
        ],
      },
    ],
    tips: [
      "El período por defecto es el mes actual",
      "Los ingresos estimados se calculan multiplicando clases contratadas por $5000",
      "La eficiencia de instructores es el % de clases completadas vs. total asignadas",
      "Los reportes se actualizan en tiempo real al cambiar las fechas",
    ],
    validations: [],
  },
};

// 🎯 COMPONENTE PRINCIPAL
export function HelpSystem() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "workflows" | "validations" | "tips"
  >("workflows");

  // Obtener contenido según la ruta actual
  const currentHelp =
    helpContent[location.pathname as keyof typeof helpContent] ||
    helpContent["/"];

  // Filtrar workflows según búsqueda
  const filteredWorkflows = searchTerm
    ? currentHelp.workflows.filter(
        (workflow) =>
          workflow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          workflow.steps.some(
            (step) =>
              step.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              step.content.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
    : currentHelp.workflows;

  // Resetear búsqueda al cambiar de página
  useEffect(() => {
    setSearchTerm("");
    setActiveTab("workflows");
  }, [location.pathname]);

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 hover:scale-110 transition-transform"
        aria-label="Abrir sistema de ayuda"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>

      {/* MODAL DE AYUDA */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  {currentHelp.title}
                </DialogTitle>
                <DialogDescription className="text-base mt-1">
                  {currentHelp.description}
                </DialogDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {location.pathname}
              </Badge>
            </div>
          </DialogHeader>

          {/* BUSCADOR */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en la ayuda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* TABS */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab("workflows")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "workflows"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              📖 Guías Paso a Paso
            </button>
            {currentHelp.validations && currentHelp.validations.length > 0 && (
              <button
                onClick={() => setActiveTab("validations")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "validations"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                ⚠️ Validaciones
              </button>
            )}
            <button
              onClick={() => setActiveTab("tips")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "tips"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              💡 Consejos
            </button>
          </div>

          {/* CONTENIDO */}
          <div className="flex-1 overflow-y-auto">
            {/* TAB: WORKFLOWS */}
            {activeTab === "workflows" && (
              <div className="space-y-3 py-4">
                {filteredWorkflows.length > 0 ? (
                  filteredWorkflows.map((workflow, idx) => (
                    <WorkflowCard key={idx} workflow={workflow} />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No se encontraron resultados para "{searchTerm}"</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: VALIDATIONS */}
            {activeTab === "validations" && (
              <div className="space-y-3 py-4">
                {currentHelp.validations &&
                currentHelp.validations.length > 0 ? (
                  currentHelp.validations.map((validation, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 rounded-lg border p-4 ${
                        validation.severity === "error"
                          ? "bg-red-50 dark:bg-red-950/20 border-red-200"
                          : validation.severity === "warning"
                            ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200"
                            : "bg-blue-50 dark:bg-blue-950/20 border-blue-200"
                      }`}
                    >
                      {validation.severity === "error" ? (
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
                      ) : validation.severity === "warning" ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">
                          {validation.rule}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {validation.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    No hay validaciones específicas para esta página
                  </p>
                )}
              </div>
            )}

            {/* TAB: TIPS */}
            {activeTab === "tips" && (
              <div className="space-y-3 py-4">
                {currentHelp.tips && currentHelp.tips.length > 0 ? (
                  currentHelp.tips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 rounded-lg border bg-amber-50 dark:bg-amber-950/20 p-4"
                    >
                      <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    No hay consejos disponibles para esta página
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// 🎯 COMPONENTE DE WORKFLOW CARD
function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border bg-card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{workflow.icon}</span>
          <h3 className="font-semibold text-lg">{workflow.title}</h3>
        </div>
        <ChevronRight
          className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {workflow.steps.map((step: WorkflowStep, idx: number) => (
            <div key={idx} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {idx + 1}
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-medium text-sm">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
