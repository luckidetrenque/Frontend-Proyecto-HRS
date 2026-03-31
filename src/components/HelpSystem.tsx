/**
 * HelpSystem.tsx - VERSIÓN 3.0 — AYUDA ADAPTADA POR ROL
 * Sistema de Ayuda Integrado para Escuela de Equitación
 *
 * NOVEDADES v3.0:
 * ✅ Contenido diferente para ADMIN, INSTRUCTOR y ALUMNO
 * ✅ Workflows, validaciones y tips filtrados según lo que cada rol puede hacer
 * ✅ Badge de rol visible en el header del modal
 * ✅ Soporte para rutas con parámetros (/alumnos/:id → /alumnos)
 * ✅ Fallback: si un rol no tiene contenido para una ruta, usa el de ADMIN
 */

import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  HelpCircle,
  Info,
  Lightbulb,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Role = "ADMIN" | "INSTRUCTOR" | "ALUMNO";

type WorkflowStep = { title: string; content: string };
type Workflow = { title: string; icon: string; steps: WorkflowStep[] };
type Validation = {
  rule: string;
  description: string;
  severity: "error" | "warning" | "info";
};
type HelpContent = {
  title: string;
  description: string;
  workflows: Workflow[];
  tips: string[];
  validations: Validation[];
};

// ─── Helper: normalizar rol ───────────────────────────────────────────────────

function normalizeRole(rol?: string): Role {
  if (!rol) return "ALUMNO";
  const r = rol.replace("ROLE_", "").toUpperCase();
  if (r === "ADMIN" || r === "INSTRUCTOR") return r as Role;
  return "ALUMNO";
}

// ─── Contenido por ruta y rol ─────────────────────────────────────────────────
// Estructura: helpContent[basePath][role] = HelpContent
// Si el rol no tiene entrada para esa ruta, se usa ADMIN como fallback.

const helpContent: Record<string, Partial<Record<Role, HelpContent>>> = {

  // ══════════════════════════════════════════════════════════════════════════
  "/": {
    ADMIN: {
      title: "Panel Principal — Administrador",
      description: "Acceso completo a todos los módulos del sistema",
      workflows: [{
        title: "Primeros pasos",
        icon: "🚀",
        steps: [
          { title: "Navegación", content: "Usá el menú lateral para acceder a Alumnos, Instructores, Caballos, Clases, Calendario, Reportes, Finanzas y Usuarios." },
          { title: "Accesos rápidos", content: "Las tarjetas del panel llevan directamente a cada módulo." },
          { title: "Sesión", content: "La sesión cierra automáticamente tras 15 minutos de inactividad." },
        ],
      }],
      tips: [
        "Como administrador tenés acceso total: usuarios, finanzas y configuración de precios",
        "El módulo Usuarios permite cambiar roles y suspender cuentas",
        "En Finanzas podés configurar cuotas, pensiones y honorarios",
      ],
      validations: [],
    },
    INSTRUCTOR: {
      title: "Panel Principal — Instructor",
      description: "Acceso a tus clases y la gestión de alumnos y caballos",
      workflows: [{
        title: "Primeros pasos",
        icon: "🚀",
        steps: [
          { title: "Tus módulos", content: "Tenés acceso a Alumnos, Caballos, Clases, Calendario y Reportes." },
          { title: "Tu calendario", content: "En el Calendario filtrá por tu nombre para ver solo tus clases." },
          { title: "Tu perfil", content: "En Mi Perfil podés actualizar tus datos de contacto. El color lo gestiona el administrador." },
        ],
      }],
      tips: [
        "Filtrá el calendario por tu nombre para ver solo tus clases del día",
        "Podés cambiar el estado de tus clases directamente desde el popover del calendario",
        "En Reportes podés ver estadísticas de tus clases y eficiencia",
      ],
      validations: [],
    },
    ALUMNO: {
      title: "Panel Principal — Alumno",
      description: "Consultá tus clases y el calendario de la escuela",
      workflows: [{
        title: "Por dónde empezar",
        icon: "🚀",
        steps: [
          { title: "Mis Clases", content: "En 'Mis Clases' encontrás el historial completo de tus clases con estadísticas." },
          { title: "Calendario", content: "En el Calendario podés ver todas las clases y reservar una nueva." },
          { title: "Tu perfil", content: "En Mi Perfil podés actualizar tus datos de contacto." },
        ],
      }],
      tips: [
        "Usá 'Mis Clases' para ver cuántas clases te quedan en el mes",
        "Podés reservar clases desde el Calendario haciendo clic en el día deseado",
        "Tus reservas quedan pendientes hasta que el instructor o admin las confirmen",
      ],
      validations: [],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  "/alumnos": {
    ADMIN: {
      title: "Gestión de Alumnos — Administrador",
      description: "Registrá y administrá alumnos, planes y pensiones",
      workflows: [
        {
          title: "Registrar un Nuevo Alumno",
          icon: "➕",
          steps: [
            { title: "Paso 1", content: 'Clic en "Nuevo Alumno".' },
            { title: "Paso 2: Datos personales", content: "Nombre, apellido, DNI (solo números), fecha de nacimiento." },
            { title: "Paso 3: Contacto", content: "Código de área y teléfono sin 0 ni 15. El sistema agrega +549." },
            { title: "Paso 4: Plan", content: "Elegí 4, 8, 12 o 16 clases mensuales." },
            { title: "Paso 5: Tipo de pensión", content: "Sin caballo asignado / Reserva caballo de escuela / Caballo propio." },
            { title: "Paso 6: Caballo y cuota", content: "Si elegiste Reserva o Caballo propio, seleccioná el caballo. Para Caballo propio elegís cuota: Entera, Media o Tercio." },
            { title: "Paso 7: Guardar", content: 'Clic en "Crear Alumno". Valida el DNI antes de guardar.' },
          ],
        },
        {
          title: "Tipos de Pensión",
          icon: "🐴",
          steps: [
            { title: "Sin Caballo Asignado", content: "Se le asigna un caballo disponible en cada clase." },
            { title: "Reserva Caballo de Escuela", content: "El alumno usa siempre el mismo caballo de escuela." },
            { title: "Caballo Propio", content: "El alumno tiene su propio caballo en pensión. Requiere cuota: Entera, Media o Tercio." },
          ],
        },
        {
          title: "Editar, Inactivar o Contactar",
          icon: "✏️",
          steps: [
            { title: "Editar", content: 'Clic en menú (⋮) → "Editar", o desde el perfil del alumno.' },
            { title: "Inactivar", content: 'Deseleccioná "Está activo". El alumno no aparecerá en la programación regular.' },
            { title: "Contactar", content: '"Enviar WhatsApp" abre un mensaje pre-cargado. "Enviar correo" abre el cliente de email.' },
          ],
        },
      ],
      tips: [
        "Los alumnos inactivos pueden tomar clases de prueba",
        "La columna de clases muestra restantes/contratadas para el mes actual",
        "Clic en cualquier fila para ver el perfil completo con historial de clases",
      ],
      validations: [
        { rule: "DNI único", description: "No se permiten DNI duplicados. Se valida en tiempo real.", severity: "error" },
        { rule: "Cuota requerida para Caballo Propio", description: "Si el tipo de pensión es Caballo Propio, la cuota (Entera/Media/Tercio) es obligatoria.", severity: "error" },
        { rule: "Caballo requerido para Caballo Propio", description: "Si el tipo de pensión es Caballo Propio, debés seleccionar el caballo.", severity: "error" },
        { rule: "Alumnos inactivos", description: "Los alumnos inactivos solo aparecen al crear clases de prueba.", severity: "warning" },
        { rule: "Teléfono", description: "Ingresá sin 0 ni 15. El sistema agrega +549 automáticamente.", severity: "info" },
      ],
    },
    INSTRUCTOR: {
      title: "Alumnos — Consulta e Inscripción",
      description: "Buscá, consultá y contactá a los alumnos",
      workflows: [
        {
          title: "Buscar un Alumno",
          icon: "🔍",
          steps: [
            { title: "Filtrar", content: "Escribí nombre o apellido en los campos de filtro." },
            { title: "Ver perfil", content: "Clic en cualquier fila para ver el perfil completo e historial de clases." },
            { title: "Contactar", content: 'Clic en menú (⋮) → "Enviar WhatsApp" o "Enviar correo".' },
          ],
        },
        {
          title: "Editar Datos Básicos",
          icon: "✏️",
          steps: [
            { title: "Editar", content: 'Clic en menú (⋮) → "Editar".' },
            { title: "Modificar", content: "Podés actualizar datos de contacto y estado activo/inactivo." },
          ],
        },
      ],
      tips: [
        "Podés ver el historial completo de clases de cada alumno en su perfil",
        "Filtrá por estado Activo para ver solo los alumnos programables",
      ],
      validations: [
        { rule: "DNI único", description: "No se permiten DNI duplicados.", severity: "error" },
        { rule: "Alumnos inactivos", description: "Los alumnos inactivos no aparecen al programar clases regulares.", severity: "warning" },
      ],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  "/instructores": {
    ADMIN: {
      title: "Gestión de Instructores — Administrador",
      description: "Administrá el equipo de instructores y sus colores de agenda",
      workflows: [
        {
          title: "Registrar un Nuevo Instructor",
          icon: "➕",
          steps: [
            { title: "Paso 1", content: 'Clic en "Nuevo Instructor".' },
            { title: "Paso 2: Datos", content: "Nombre, apellido, DNI, fecha de nacimiento, teléfono y email." },
            { title: "Paso 3: Color", content: "Elegí un color único de los 7 disponibles. Aparecerá en todas sus clases del calendario." },
            { title: "Paso 4", content: 'Clic en "Crear Instructor". Queda activo automáticamente.' },
          ],
        },
        {
          title: "Cambiar Color o Estado",
          icon: "🎨",
          steps: [
            { title: "Editar", content: 'Clic en menú (⋮) → "Editar".' },
            { title: "Color", content: "Solo el administrador puede cambiar el color del instructor." },
            { title: "Activar/Inactivar", content: 'Switch "Está activo". Los inactivos no aparecen al programar clases.' },
          ],
        },
      ],
      tips: [
        "Elegí colores bien diferenciados para facilitar la lectura del calendario",
        "Los instructores inactivos no aparecen en los selectores de clases",
      ],
      validations: [
        { rule: "DNI único", description: "No se permiten instructores con DNI duplicado.", severity: "error" },
        { rule: "Color único recomendado", description: "Asigná colores diferentes para identificar a cada instructor.", severity: "info" },
        { rule: "Estado activo", description: "Solo los instructores activos pueden asignarse a nuevas clases.", severity: "warning" },
      ],
    },
    INSTRUCTOR: {
      title: "Instructores — Consulta",
      description: "Información del equipo de instructores",
      workflows: [{
        title: "Ver perfil de un instructor",
        icon: "👁️",
        steps: [
          { title: "Buscar", content: "Filtrá por nombre o apellido." },
          { title: "Ver historial", content: "Clic en la fila para ver el perfil con estadísticas de clases." },
        ],
      }],
      tips: [
        "Cada instructor tiene un color único visible en el calendario",
        "Tu propio perfil está en 'Mi Perfil' (menú del usuario arriba a la derecha)",
      ],
      validations: [],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  "/caballos": {
    ADMIN: {
      title: "Gestión de Caballos — Administrador",
      description: "Control de caballos de escuela y privados",
      workflows: [
        {
          title: "Registrar Caballo de Escuela",
          icon: "🐴",
          steps: [
            { title: "Paso 1", content: 'Clic en "Nuevo Caballo".' },
            { title: "Paso 2", content: "Escribí el nombre." },
            { title: "Paso 3", content: 'Seleccioná tipo "Escuela". Disponible para todos los alumnos.' },
            { title: "Paso 4", content: 'Clic en "Crear Caballo".' },
          ],
        },
        {
          title: "Registrar Caballo Privado",
          icon: "🏇",
          steps: [
            { title: "Crear", content: 'Seleccioná tipo "Privado".' },
            { title: "Vincular", content: "Editá el alumno propietario → cambiá pensión a Caballo propio → seleccioná este caballo." },
            { title: "Cuota", content: "Elegí Entera, Media o Tercio en el alumno propietario." },
          ],
        },
        {
          title: "Marcar como No Disponible",
          icon: "⚠️",
          steps: [
            { title: "Editar", content: "Abrí el formulario de edición." },
            { title: "Deshabilitar", content: 'Desmarcá "Está disponible". No aparecerá al programar clases.' },
          ],
        },
      ],
      tips: [
        "Los caballos PRIVADOS solo los puede usar su propietario",
        "Marcá como no disponible en lugar de eliminar para bajas temporales",
        "En el perfil del caballo podés ver sus propietarios y el historial de clases",
      ],
      validations: [
        { rule: "Caballo privado restringido", description: "Los caballos privados solo pueden asignarse a clases de su propietario.", severity: "error" },
        { rule: "Disponibilidad", description: "Los caballos no disponibles no aparecen al programar.", severity: "warning" },
      ],
    },
    INSTRUCTOR: {
      title: "Caballos — Consulta",
      description: "Información de los caballos disponibles",
      workflows: [{
        title: "Ver disponibilidad",
        icon: "🔍",
        steps: [
          { title: "Filtrar disponibles", content: 'Usá el filtro "Disponibilidad: Disponible" para ver los caballos asignables.' },
          { title: "Ver perfil", content: "Clic en la fila para ver el historial de clases del caballo." },
        ],
      }],
      tips: [
        "Los caballos PRIVADOS solo pueden usarlos sus propietarios",
        "Si un caballo no aparece al crear una clase, está marcado como no disponible",
      ],
      validations: [
        { rule: "Caballo privado", description: "Los caballos privados solo son asignables a clases de su propietario.", severity: "warning" },
      ],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  "/clases": {
    ADMIN: {
      title: "Gestión de Clases — Administrador",
      description: "Programá, editá y gestioná todas las clases",
      workflows: [
        {
          title: "Crear Clase Regular",
          icon: "📝",
          steps: [
            { title: "Paso 1", content: 'Clic en "Nueva Clase".' },
            { title: "Especialidad", content: "Equitación, Adiestramiento, Equinoterapia o Monta." },
            { title: "Alumno", content: "Seleccioná el alumno. MONTA no requiere alumno específico." },
            { title: "Fecha, hora y duración", content: "30 o 60 minutos. El sistema valida el límite de 18:30." },
            { title: "Instructor y Caballo", content: "Seleccioná ambos. Si el alumno tiene caballo asignado, se preselecciona." },
            { title: "Guardar", content: "La clase se crea con estado PROGRAMADA." },
          ],
        },
        {
          title: "Clase de Prueba — Persona Nueva",
          icon: "🎓",
          steps: [
            { title: "Marcar como prueba", content: 'Activá el checkbox "Es clase de prueba".' },
            { title: "Tipo", content: 'Seleccioná "Persona nueva".' },
            { title: "Datos", content: "Solo nombre y apellido. No necesita cuenta de alumno." },
          ],
        },
        {
          title: "Clase de Prueba — Alumno Existente",
          icon: "🎯",
          steps: [
            { title: "Marcar como prueba", content: 'Activá el checkbox "Es clase de prueba".' },
            { title: "Tipo", content: 'Seleccioná "Alumno existente". El alumno debe estar INACTIVO.' },
            { title: "Validaciones", content: "El sistema verifica que no tenga esa especialidad ni prueba previa." },
          ],
        },
        {
          title: "Cambiar Estado de una Clase",
          icon: "🔄",
          steps: [
            { title: "Desde el detalle", content: "Clic en la fila → selector de estado." },
            { title: "Estados", content: "PROGRAMADA 🟠, INICIADA 🔵, COMPLETADA 🟢, CANCELADA 🔴, ACA 🟣, ASA 🌸." },
            { title: "Cancelar con motivo", content: "Al elegir CANCELADA el sistema pide seleccionar un motivo." },
          ],
        },
      ],
      tips: [
        "Las clases de prueba NO cuentan para la cuota mensual",
        "ACA = Ausencia Con Aviso, ASA = Ausencia Sin Aviso",
        "Las clases COMPLETADAS, INICIADAS y CANCELADAS no se pueden editar ni eliminar",
        "MONTA asigna automáticamente el alumno comodín (monta libre)",
      ],
      validations: [
        { rule: "Horario límite 18:30", description: "Ninguna clase puede terminar después de las 18:30.", severity: "error" },
        { rule: "Prueba — alumno inactivo", description: "Las clases de prueba para alumnos existentes requieren que esté INACTIVO.", severity: "error" },
        { rule: "Prueba — sin especialidad previa", description: "No se puede asignar prueba de una especialidad que el alumno ya tomó.", severity: "error" },
        { rule: "Prueba — no repetible", description: "No se puede repetir clase de prueba de la misma especialidad.", severity: "error" },
        { rule: "Restricción de edición", description: "Las clases COMPLETADAS, INICIADAS y CANCELADAS son históricas e inmutables.", severity: "warning" },
        { rule: "Conflictos de horario", description: "El sistema detecta si el caballo o instructor ya tienen otra clase solapada.", severity: "warning" },
        { rule: "Clases restantes", description: "Se monitorea el cupo mensual del alumno pero no bloquea la creación.", severity: "info" },
      ],
    },
    INSTRUCTOR: {
      title: "Clases — Instructor",
      description: "Creá y gestioná las clases que tenés asignadas",
      workflows: [
        {
          title: "Crear una Clase",
          icon: "📝",
          steps: [
            { title: "Paso 1", content: 'Clic en "Nueva Clase".' },
            { title: "Completar", content: "Elegí especialidad, alumno, fecha, hora, duración y caballo. Tu nombre se preselecciona." },
            { title: "Guardar", content: 'Clic en "Crear Clase".' },
          ],
        },
        {
          title: "Cambiar Estado",
          icon: "🔄",
          steps: [
            { title: "Desde el detalle", content: "Clic en la fila → selector de estado." },
            { title: "Estados", content: "PROGRAMADA 🟠, INICIADA 🔵, COMPLETADA 🟢, CANCELADA 🔴, ACA 🟣, ASA 🌸." },
          ],
        },
        {
          title: "Filtrar Tus Clases",
          icon: "🔍",
          steps: [
            { title: "Por alumno", content: "Filtrá por nombre o apellido del alumno." },
            { title: "Por estado", content: "Filtrá para ver solo las PROGRAMADAS o COMPLETADAS." },
          ],
        },
      ],
      tips: [
        "ACA = el alumno avisó que no vendría. ASA = no asistió sin aviso",
        "Las clases COMPLETADAS no se pueden editar: son registro histórico",
        "Usá el Calendario para la gestión diaria más cómoda",
      ],
      validations: [
        { rule: "Horario límite 18:30", description: "Las clases no pueden terminar después de las 18:30.", severity: "error" },
        { rule: "Conflictos de horario", description: "El sistema alerta si el caballo o vos ya tienen clase solapada.", severity: "warning" },
        { rule: "Restricción de edición", description: "Las clases COMPLETADAS, INICIADAS y CANCELADAS son inmutables.", severity: "warning" },
      ],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  "/calendario": {
    ADMIN: {
      title: "Calendario — Administrador",
      description: "Vista completa con todas las herramientas de gestión",
      workflows: [
        {
          title: "Crear desde el Calendario",
          icon: "➕",
          steps: [
            { title: "Vista Día", content: 'Cambiá a la vista "Día".' },
            { title: "Doble clic en celda", content: "Doble clic en cualquier celda vacía (hora + caballo). El formulario se pre-rellena." },
            { title: "Completar y guardar", content: "Solo necesitás elegir alumno, especialidad e instructor." },
          ],
        },
        {
          title: "Copiar Semana Completa",
          icon: "📋",
          steps: [
            { title: "Abrir herramienta", content: 'Clic en "Copiar Clases".' },
            { title: "Semana origen y destino", content: "Elegí un día de cada semana." },
            { title: "Confirmar", content: "Se copian TODAS las clases de lunes a domingo." },
          ],
        },
        {
          title: "Eliminar Clases en Rango",
          icon: "🗑️",
          steps: [
            { title: "Abrir herramienta", content: 'Clic en "Eliminar Clases".' },
            { title: "Seleccionar rango", content: "Elegí fecha de inicio y fin." },
            { title: "Confirmar", content: "⚠️ Elimina TODAS las clases del rango. No se puede deshacer." },
          ],
        },
        {
          title: "Cancelar Todas las Clases del Día",
          icon: "❌",
          steps: [
            { title: "Vista Día", content: "Solo disponible en vista Día." },
            { title: "Abrir herramienta", content: 'Clic en "Cancelar Día (N)".' },
            { title: "Motivo y confirmar", content: "Lluvia, Feriado, Mantenimiento, Emergencia u Otro. Solo cancela las PROGRAMADAS." },
          ],
        },
        {
          title: "Exportar a Excel",
          icon: "📊",
          steps: [
            { title: "Vista Día", content: '"Exportar Excel" descarga el día con colores y leyenda.' },
            { title: "Vista Semana", content: '"Exportar Semana" descarga la semana completa.' },
            { title: "Vista Mes", content: '"Exportar Mes" descarga el mes completo.' },
          ],
        },
        {
          title: "Gestionar Reservas Pendientes",
          icon: "⏳",
          steps: [
            { title: "Panel inferior", content: "Las reservas de alumnos aparecen al pie del calendario." },
            { title: "Confirmar o Rechazar", content: '"Confirmar" → PROGRAMADA. X → CANCELADA.' },
          ],
        },
      ],
      tips: [
        "Vista Día es la más cómoda para la gestión diaria",
        "Doble clic en celda vacía pre-rellena el formulario con caballo y hora",
        "Borde de la clase: Naranja=Programada, Azul=Iniciada, Verde=Completada, Rojo=Cancelada, Púrpura=ACA, Rosado=ASA",
        "Presioná Escape para cerrar el modo pantalla completa",
      ],
      validations: [
        { rule: "Cancelar Día", description: "Solo afecta clases PROGRAMADAS. Las completadas y ya canceladas no se modifican.", severity: "info" },
        { rule: "Conflictos", description: "Las celdas con ⚠️ indican que el caballo o instructor ya tienen clase solapada.", severity: "warning" },
        { rule: "Reservas pendientes", description: "Las clases RESERVADAS deben confirmarse o rechazarse.", severity: "info" },
      ],
    },
    INSTRUCTOR: {
      title: "Calendario — Instructor",
      description: "Tu vista de clases y gestión diaria",
      workflows: [
        {
          title: "Crear desde el Calendario",
          icon: "➕",
          steps: [
            { title: "Vista Día", content: 'Cambiá a la vista "Día".' },
            { title: "Doble clic", content: "Doble clic en una celda vacía. Tu nombre se preselecciona como instructor." },
            { title: "Completar y guardar", content: "Elegí alumno, especialidad y caballo." },
          ],
        },
        {
          title: "Filtrar Tus Clases",
          icon: "🔍",
          steps: [
            { title: "Filtrar por instructor", content: "Seleccioná tu nombre para ver solo tus clases." },
            { title: "Combinar filtros", content: "También podés filtrar por alumno." },
          ],
        },
        {
          title: "Cambiar Estado Rápido",
          icon: "⚡",
          steps: [
            { title: "Clic en la clase", content: "Se abre el popover con los detalles." },
            { title: "Nuevo estado", content: "Seleccioná el estado desde el popover." },
          ],
        },
        {
          title: "Gestionar Reservas Pendientes",
          icon: "⏳",
          steps: [
            { title: "Panel inferior", content: "Las reservas de tus alumnos aparecen al pie del calendario." },
            { title: "Confirmar o Rechazar", content: '"Confirmar" → PROGRAMADA. X → CANCELADA.' },
          ],
        },
      ],
      tips: [
        "Filtrá por tu nombre para ver solo tus clases del día",
        "El color de fondo de cada clase es tu color de instructor",
        "Podés expandir el calendario a pantalla completa con el ícono ↔",
        "Las reservas de tus alumnos aparecen en el panel inferior",
      ],
      validations: [
        { rule: "Conflictos", description: "Las celdas con ⚠️ indican solapamiento de horarios.", severity: "warning" },
        { rule: "Reservas pendientes", description: "Las clases RESERVADAS deben ser confirmadas o rechazadas.", severity: "info" },
      ],
    },
    ALUMNO: {
      title: "Calendario — Tu Vista",
      description: "Consultá el calendario y reservá tus clases",
      workflows: [
        {
          title: "Reservar una Clase",
          icon: "📅",
          steps: [
            { title: "Elegir el día", content: "Clic en el número del día en Vista Mes/Semana, o en una celda en Vista Día." },
            { title: "Completar", content: "Elegí especialidad, caballo y hora. Tu nombre se preselecciona." },
            { title: "Reservar", content: 'Clic en "Reservar Clase". El estado quedará RESERVADA hasta que el instructor confirme.' },
          ],
        },
        {
          title: "Ver el Estado de tus Clases",
          icon: "👁️",
          steps: [
            { title: "Filtrar", content: "Seleccioná tu nombre en el filtro para ver solo tus clases." },
            { title: "Estados", content: "⏳ RESERVADA = pendiente. 🟠 PROGRAMADA = confirmada. 🟢 COMPLETADA = realizada." },
            { title: "Avisar ausencia", content: "Si no podés asistir, marcá ACA en el popover de la clase." },
          ],
        },
      ],
      tips: [
        "Tus reservas quedan pendientes hasta que el instructor o admin las confirme",
        "Si no podés asistir, marcá ACA (Ausente Con Aviso) antes de la clase",
        "En 'Mis Clases' podés ver cuántas clases te quedan en el mes",
      ],
      validations: [
        { rule: "Horario límite", description: "Las clases no pueden terminar después de las 18:30.", severity: "error" },
        { rule: "Estado RESERVADA", description: "Tu clase queda RESERVADA hasta que el instructor o admin la confirme.", severity: "info" },
      ],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  "/mis-clases": {
    ALUMNO: {
      title: "Mis Clases",
      description: "Tu historial de clases y estadísticas personales",
      workflows: [
        {
          title: "Leer tu historial",
          icon: "📋",
          steps: [
            { title: "Estadísticas", content: "Las tarjetas superiores muestran: total, completadas, próximas y canceladas." },
            { title: "Tu plan", content: "'Mi Plan' muestra clases contratadas por mes y tu tipo de pensión." },
            { title: "Historial", content: "La tabla lista todas tus clases con estado y observaciones." },
          ],
        },
        {
          title: "Entender los Estados",
          icon: "🔄",
          steps: [
            { title: "⏳ RESERVADA", content: "Solicitud enviada, pendiente de confirmación." },
            { title: "🟠 PROGRAMADA", content: "Confirmada y próxima a realizarse." },
            { title: "🟢 COMPLETADA", content: "Clase realizada exitosamente." },
            { title: "🔴 CANCELADA", content: "Clase cancelada." },
            { title: "🟣 ACA", content: "Avisaste que no ibas a asistir." },
            { title: "🌸 ASA", content: "No asististe sin haber avisado." },
          ],
        },
      ],
      tips: [
        "Las clases COMPLETADAS y ASA se cuentan como clases usadas del mes",
        "Tu plan mensual no es acumulable: los cupos se renuevan cada mes",
        "Podés reservar nuevas clases desde el Calendario",
        "Si tenés muchas ASA, coordiná con tu instructor para reorganizar tu agenda",
      ],
      validations: [
        { rule: "Cupo mensual", description: "Tu plan tiene un límite de clases por mes. Los cupos del mes anterior no se acumulan.", severity: "info" },
      ],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  "/reportes": {
    ADMIN: {
      title: "Reportes — Administrador",
      description: "Análisis completo de la operación del club",
      workflows: [
        {
          title: "Generar Reporte",
          icon: "📅",
          steps: [
            { title: "Período", content: "Elegí fechas de inicio y fin." },
            { title: "Filtrar", content: "Opcionalmente filtrá por instructor o alumno." },
            { title: "Navegar tabs", content: "General, Alumnos, Clases, Instructores, Caballos, Clases de Prueba." },
          ],
        },
        {
          title: "Exportar a Excel",
          icon: "📊",
          steps: [
            { title: "Tab deseado", content: "Elegí la sección a exportar." },
            { title: "Exportar", content: 'Clic en "Exportar" en la esquina superior derecha de la tabla.' },
          ],
        },
      ],
      tips: [
        "El tab 'Clases de Prueba' muestra la tasa de conversión (prueba → alumno activo)",
        "La eficiencia del instructor = clases completadas / total asignadas",
        "Los reportes se actualizan en tiempo real al cambiar fechas o filtros",
      ],
      validations: [],
    },
    INSTRUCTOR: {
      title: "Reportes — Tu Actividad",
      description: "Estadísticas de tus clases y alumnos",
      workflows: [{
        title: "Ver tus Estadísticas",
        icon: "📊",
        steps: [
          { title: "Período", content: "Elegí las fechas del análisis." },
          { title: "Tab Instructores", content: "Mostrará tu carga de trabajo, completadas y eficiencia." },
          { title: "Tab Alumnos", content: "Mostrará la asistencia de tus alumnos en el período." },
        ],
      }],
      tips: [
        "Los datos se filtran automáticamente a tus clases",
        "Eficiencia = clases completadas / total de clases asignadas",
      ],
      validations: [],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  "/finanzas": {
    ADMIN: {
      title: "Finanzas — Administrador",
      description: "Ingresos proyectados, pensiones, honorarios y configuración",
      workflows: [
        {
          title: "Ver Resumen Financiero",
          icon: "💰",
          steps: [
            { title: "Período", content: "Elegí las fechas del análisis." },
            { title: "Filtrar por instructor", content: "Opcionalmente filtrá los honorarios por instructor." },
            { title: "Tarjetas resumen", content: "Cuotas Proyectadas, Pensiones, Honorarios y Balance Proyectado." },
          ],
        },
        {
          title: "Configurar Precios",
          icon: "⚙️",
          steps: [
            { title: "Tab Precios", content: 'Clic en la pestaña "Precios".' },
            { title: "Editar y guardar", content: 'Clic en "Editar precios" → modificar → "Guardar".' },
          ],
        },
      ],
      tips: [
        "Balance = (Cuotas + Pensiones) - Honorarios",
        "Las pensiones son fijas mensuales, independientemente del período",
        "Honorario = base mensual + (clases completadas × honorario por clase)",
      ],
      validations: [],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  "/usuarios": {
    ADMIN: {
      title: "Gestión de Usuarios — Administrador",
      description: "Administrá cuentas, roles y accesos al sistema",
      workflows: [
        {
          title: "Cambiar Rol",
          icon: "🔑",
          steps: [
            { title: "Menú de acciones", content: "Clic en menú (⋮) de la fila del usuario." },
            { title: "Elegir rol", content: "Administrador, Instructor o Alumno." },
          ],
        },
        {
          title: "Suspender o Activar",
          icon: "🔒",
          steps: [
            { title: "Menú de acciones", content: "Clic en menú (⋮)." },
            { title: "Cambiar estado", content: '"Bloquear Acceso" o "Desbloquear".' },
          ],
        },
        {
          title: "Eliminar Usuario",
          icon: "🗑️",
          steps: [
            { title: "Menú de acciones", content: "Clic en menú (⋮)." },
            { title: "Confirmar", content: '"Eliminar Usuario" → Confirmar. Acción irreversible.' },
          ],
        },
      ],
      tips: [
        "No podés modificar tu propia cuenta desde este módulo",
        "Suspender un usuario no elimina sus datos ni historial de clases",
        "ADMIN: acceso total. INSTRUCTOR: gestión de clases y alumnos. ALUMNO: solo sus clases",
      ],
      validations: [
        { rule: "Auto-modificación bloqueada", description: "No podés cambiar tu propio rol ni suspenderte.", severity: "warning" },
        { rule: "Eliminación irreversible", description: "Eliminar un usuario es permanente.", severity: "error" },
      ],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  "/profile": {
    ADMIN: {
      title: "Mi Perfil — Administrador",
      description: "Gestioná tu cuenta y contraseña",
      workflows: [
        {
          title: "Editar Datos de Cuenta",
          icon: "✏️",
          steps: [
            { title: "Editar", content: 'Clic en "Editar" en la sección Cuenta del Sistema.' },
            { title: "Modificar", content: "Podés cambiar nombre de usuario y email de acceso." },
            { title: "Guardar", content: 'Clic en "Guardar".' },
          ],
        },
        {
          title: "Cambiar Contraseña",
          icon: "🔐",
          steps: [
            { title: "Sección Seguridad", content: 'Clic en "Cambiar Contraseña".' },
            { title: "Completar y guardar", content: "Ingresá contraseña actual, nueva contraseña (mín. 8 caracteres) y confirmación." },
          ],
        },
      ],
      tips: [
        "El rol solo puede cambiarlo otro administrador desde el módulo Usuarios",
        "Cambiá el avatar pasando el mouse sobre tu foto y haciendo clic",
      ],
      validations: [],
    },
    INSTRUCTOR: {
      title: "Mi Perfil — Instructor",
      description: "Actualizá tus datos de contacto y contraseña",
      workflows: [
        {
          title: "Editar Datos de Instructor",
          icon: "✏️",
          steps: [
            { title: "Sección Instructor", content: 'Clic en "Editar" en la sección Perfil de Instructor.' },
            { title: "Modificar", content: "Podés cambiar teléfono, código de área y email de contacto." },
            { title: "Guardar", content: 'Clic en "Guardar".' },
          ],
        },
        {
          title: "Cambiar Contraseña",
          icon: "🔐",
          steps: [
            { title: "Sección Seguridad", content: 'Clic en "Cambiar Contraseña".' },
            { title: "Completar", content: "Contraseña actual, nueva (mín. 8 caracteres) y confirmación." },
          ],
        },
      ],
      tips: [
        "El color de agenda solo lo puede cambiar el administrador",
        "Tus datos de contacto son visibles para el admin y los alumnos",
      ],
      validations: [],
    },
    ALUMNO: {
      title: "Mi Perfil — Alumno",
      description: "Actualizá tus datos de contacto y contraseña",
      workflows: [
        {
          title: "Editar Datos de Contacto",
          icon: "✏️",
          steps: [
            { title: "Sección Alumno", content: 'Clic en "Editar" en la sección Perfil de Alumno.' },
            { title: "Modificar", content: "Podés cambiar teléfono, código de área y email." },
            { title: "Guardar", content: 'Clic en "Guardar".' },
          ],
        },
        {
          title: "Cambiar Contraseña",
          icon: "🔐",
          steps: [
            { title: "Sección Seguridad", content: 'Clic en "Cambiar Contraseña".' },
            { title: "Completar", content: "Contraseña actual, nueva (mín. 8 caracteres) y confirmación." },
          ],
        },
      ],
      tips: [
        "El plan de clases y el caballo asignado solo los puede modificar el administrador",
        "Tu email es visible para el instructor y el admin",
      ],
      validations: [],
    },
  },
};

// ─── Fallback genérico ────────────────────────────────────────────────────────
const defaultHelp: HelpContent = {
  title: "Ayuda del Sistema",
  description: "Guías de uso del sistema de gestión",
  workflows: [{
    title: "Navegación General",
    icon: "🧭",
    steps: [
      { title: "Menú lateral", content: "Usá el menú lateral para moverte entre las secciones disponibles para tu rol." },
      { title: "Botón de ayuda", content: "Este botón (?) abre la ayuda contextual específica de cada página." },
      { title: "Sesión", content: "La sesión cierra automáticamente tras 15 minutos de inactividad." },
    ],
  }],
  tips: ["Cada sección tiene su propia ayuda con guías adaptadas a tu rol."],
  validations: [],
};

// ─── Labels de rol ────────────────────────────────────────────────────────────
const ROLE_LABELS: Record<Role, { label: string; className: string }> = {
  ADMIN:      { label: "Administrador", className: "bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/30 dark:text-red-400" },
  INSTRUCTOR: { label: "Instructor",    className: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400" },
  ALUMNO:     { label: "Alumno",        className: "bg-green-100 text-green-800 border border-green-200 dark:bg-green-950/30 dark:text-green-400" },
};

// ─── Componente Principal ─────────────────────────────────────────────────────
export function HelpSystem() {
  const location = useLocation();
  const { user } = useAuth();
  const role = normalizeRole(user?.rol);

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"workflows" | "validations" | "tips">("workflows");

  // Ruta base sin parámetros dinámicos
  const basePath = "/" + location.pathname.split("/")[1];

  const getContent = (): HelpContent => {
    const pageContent = helpContent[basePath] ?? helpContent[location.pathname];
    if (!pageContent) return defaultHelp;
    // Intenta el rol actual, luego ADMIN como fallback, luego genérico
    return pageContent[role] ?? pageContent["ADMIN"] ?? defaultHelp;
  };

  const currentHelp = getContent();

  const filteredWorkflows = searchTerm
    ? currentHelp.workflows.filter(
        (w) =>
          w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.steps.some(
            (s) =>
              s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              s.content.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
    : currentHelp.workflows;

  useEffect(() => {
    setSearchTerm("");
    setActiveTab("workflows");
  }, [location.pathname]);

  const roleInfo = ROLE_LABELS[role];

  return (
    <>
      {/* Botón flotante */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 hover:scale-110 transition-transform"
        aria-label="Abrir ayuda"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>

      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary shrink-0" />
                  {currentHelp.title}
                </DialogTitle>
                <DialogDescription className="text-base mt-1">
                  {currentHelp.description}
                </DialogDescription>
              </div>
              {/* Badge de rol */}
              <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${roleInfo.className}`}>
                {roleInfo.label}
              </span>
            </div>
          </DialogHeader>

          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en la ayuda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b overflow-x-auto">
            <TabBtn active={activeTab === "workflows"} onClick={() => setActiveTab("workflows")}>
              📖 Guías Paso a Paso
            </TabBtn>
            {currentHelp.validations.length > 0 && (
              <TabBtn active={activeTab === "validations"} onClick={() => setActiveTab("validations")}>
                ⚠️ Validaciones
              </TabBtn>
            )}
            {currentHelp.tips.length > 0 && (
              <TabBtn active={activeTab === "tips"} onClick={() => setActiveTab("tips")}>
                💡 Consejos
              </TabBtn>
            )}
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto">

            {activeTab === "workflows" && (
              <div className="space-y-3 py-4">
                {filteredWorkflows.length > 0 ? (
                  filteredWorkflows.map((w, i) => <WorkflowCard key={i} workflow={w} />)
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No se encontraron resultados para "{searchTerm}"</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "validations" && (
              <div className="space-y-3 py-4">
                {currentHelp.validations.map((v, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 rounded-lg border p-4 ${
                      v.severity === "error"
                        ? "bg-red-50 dark:bg-red-950/20 border-red-200"
                        : v.severity === "warning"
                          ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200"
                          : "bg-blue-50 dark:bg-blue-950/20 border-blue-200"
                    }`}
                  >
                    {v.severity === "error" ? (
                      <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    ) : v.severity === "warning" ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{v.rule}</h4>
                      <p className="text-sm text-muted-foreground">{v.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "tips" && (
              <div className="space-y-3 py-4">
                {currentHelp.tips.map((tip, i) => (
                  <div key={i} className="flex gap-3 rounded-lg border bg-amber-50 dark:bg-amber-950/20 p-4">
                    <Lightbulb className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function TabBtn({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{workflow.icon}</span>
          <h3 className="font-semibold text-lg">{workflow.title}</h3>
        </div>
        <ChevronRight className={`h-5 w-5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {workflow.steps.map((step, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {idx + 1}
              </div>
              <div className="flex-1">
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
