/**
 * OnboardingTour.tsx - VERSIÓN 3.0 — TOUR ADAPTADO POR ROL
 *
 * NOVEDADES v3.0:
 * ✅ Pasos diferentes para ADMIN, INSTRUCTOR y ALUMNO
 * ✅ ADMIN: 10 pasos (visión completa del sistema)
 * ✅ INSTRUCTOR: 7 pasos (clases, calendario, estados, reservas)
 * ✅ ALUMNO: 5 pasos (mis clases, reservar, estados, perfil)
 * ✅ Badge de rol en el header del modal
 * ✅ Storage key versionado por rol para no interferir entre usuarios
 *
 * Para forzar el tour nuevamente (testing):
 *   localStorage.removeItem('tour-v3-ADMIN')    // o INSTRUCTOR / ALUMNO
 *   // Recargar la página
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  UserCheck,
  Landmark,
  CalendarDays,
  Calendar,
  BarChart,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  ShieldCheck,
  CircleDollarSign,
  BookOpen,
} from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Role = "ADMIN" | "INSTRUCTOR" | "ALUMNO";

type TourStep = {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  path?: string;
  features?: string[];
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function normalizeRole(rol?: string): Role {
  if (!rol) return "ALUMNO";
  const r = rol.replace("ROLE_", "").toUpperCase();
  if (r === "ADMIN" || r === "INSTRUCTOR") return r as Role;
  return "ALUMNO";
}

// ─── Pasos por rol ────────────────────────────────────────────────────────────

const STEPS_ADMIN: TourStep[] = [
  {
    title: "¡Bienvenido, Administrador! 🎉",
    description: "Tenés acceso completo al sistema de gestión de la escuela de equitación. Este tour te guiará por los módulos principales y sus funciones avanzadas.",
    icon: Sparkles,
    color: "text-amber-500",
  },
  {
    title: "Gestión de Alumnos 👥",
    description: "Registrá alumnos con planes flexibles (4, 8, 12 o 16 clases/mes) y configurá su tipo de pensión: sin caballo asignado, reserva de escuela, o caballo propio con cuota.",
    icon: Users,
    color: "text-blue-500",
    path: "/alumnos",
    features: [
      "Planes de 4, 8, 12 o 16 clases mensuales",
      "Tipos de pensión: Sin caballo / Reserva escuela / Caballo propio",
      "Cuotas: Entera, Media, Tercio (solo para Caballo Propio)",
      "Validación automática de DNI duplicado en tiempo real",
      "Contacto directo por WhatsApp o Email",
      "Columna de clases restantes del mes",
    ],
  },
  {
    title: "Instructores y Colores 👨‍🏫",
    description: "Administrá el equipo de instructores. Cada uno tiene un color único que lo identifica en el calendario.",
    icon: UserCheck,
    color: "text-green-500",
    path: "/instructores",
    features: [
      "7 colores predefinidos para identificar instructores",
      "Los colores se reflejan en todas sus clases del calendario",
      "Solo el administrador puede cambiar el color de un instructor",
      "Control de estado activo/inactivo",
    ],
  },
  {
    title: "Caballos — Escuela y Privados 🐴",
    description: "Gestioná caballos de escuela (disponibles para todos) y privados (exclusivos del propietario). Controlá la disponibilidad para bajas temporales.",
    icon: Landmark,
    color: "text-orange-500",
    path: "/caballos",
    features: [
      "ESCUELA: disponibles para cualquier alumno",
      "PRIVADOS: solo para su propietario registrado",
      "Disponibilidad temporal (enfermedad, descanso)",
      "Ficha con historial de clases y propietarios",
    ],
  },
  {
    title: "Clases y Clases de Prueba 📅",
    description: "Programá clases regulares y clases de prueba. Las pruebas no cuentan para la cuota mensual y tienen identificación visual especial (🎓).",
    icon: CalendarDays,
    color: "text-purple-500",
    path: "/clases",
    features: [
      "4 especialidades: Equitación, Adiestramiento, Equinoterapia, Monta",
      "Duración: 30 o 60 minutos",
      "🎓 Prueba Persona Nueva: solo nombre y apellido",
      "🎓 Prueba Alumno Existente: el alumno debe estar INACTIVO",
      "Las pruebas NO cuentan para la cuota mensual",
      "6 estados: PROGRAMADA, INICIADA, COMPLETADA, CANCELADA, ACA, ASA",
      "Estado RESERVADA para solicitudes de alumnos",
    ],
  },
  {
    title: "Calendario y Herramientas 🗓️",
    description: "Vista interactiva con 3 modos. Vista Día es el centro de operaciones: grilla tipo Excel por caballo. Herramientas avanzadas para copiar semanas, cancelar días y exportar.",
    icon: Calendar,
    color: "text-cyan-500",
    path: "/calendario",
    features: [
      "Vista Día: doble clic en celda para crear clase con datos pre-cargados",
      "📋 Copiar Semana: replica toda la semana (lun-dom) a otro período",
      "🗑️ Eliminar Rango: borra todas las clases entre dos fechas",
      "❌ Cancelar Día: cancela todas las PROGRAMADAS del día con motivo",
      "📊 Exportar Excel: día, semana o mes con formato profesional",
      "Panel de Reservas Pendientes para confirmar o rechazar",
    ],
  },
  {
    title: "Estados de Clase 🔄",
    description: "Sistema completo de estados. Las clases COMPLETADAS, INICIADAS y CANCELADAS son históricas e inmutables.",
    icon: ShieldCheck,
    color: "text-indigo-500",
    path: "/clases",
    features: [
      "🟠 PROGRAMADA: confirmada, próxima a realizarse",
      "🔵 INICIADA: en progreso actualmente",
      "🟢 COMPLETADA: finalizada (inmutable)",
      "🔴 CANCELADA: cancelada con motivo (inmutable)",
      "🟣 ACA: Ausencia Con Aviso",
      "🌸 ASA: Ausencia Sin Aviso",
      "⏳ RESERVADA: solicitud del alumno pendiente",
      "Cambio rápido desde el popover del calendario",
    ],
  },
  {
    title: "Validaciones Automáticas ⚠️",
    description: "El sistema valida automáticamente las reglas de negocio para garantizar la integridad de los datos.",
    icon: ShieldCheck,
    color: "text-red-500",
    features: [
      "🔴 ERROR: Ninguna clase puede terminar después de las 18:30",
      "🔴 ERROR: DNI duplicados (valida en tiempo real)",
      "🔴 ERROR: Prueba solo para alumnos INACTIVOS",
      "🔴 ERROR: No se puede repetir especialidad en clase de prueba",
      "⚠️ ADVERTENCIA: Conflicto de horario (caballo o instructor ocupado)",
      "⚠️ ADVERTENCIA: Clases COMPLETADAS/INICIADAS/CANCELADAS son inmutables",
      "ℹ️ INFO: Monitor de clases restantes del mes",
    ],
  },
  {
    title: "Reportes y Finanzas 📊",
    description: "Reportes completos por período con exportación a Excel. Finanzas calcula automáticamente cuotas, pensiones y honorarios.",
    icon: BarChart,
    color: "text-pink-500",
    path: "/reportes",
    features: [
      "Tabs: General, Alumnos, Clases, Instructores, Caballos, Clases de Prueba",
      "Filtros por período, instructor y alumno",
      "Tasa de conversión: prueba → alumno activo",
      "Finanzas: Cuotas proyectadas, Pensiones, Honorarios y Balance",
      "Configuración de precios editable (solo administrador)",
      "Exportación a Excel desde cada tab",
    ],
  },
  {
    title: "Usuarios y Ayuda 💡",
    description: "El módulo Usuarios permite gestionar roles y accesos. El sistema de ayuda contextual (?) está disponible en cada página con guías adaptadas a cada rol.",
    icon: Sparkles,
    color: "text-amber-500",
    path: "/usuarios",
    features: [
      "Módulo Usuarios: cambiar roles, suspender y eliminar cuentas",
      "Roles: ADMIN (acceso total), INSTRUCTOR (clases y alumnos), ALUMNO (solo sus clases)",
      "Botón (?) flotante con guías paso a paso por página y por rol",
      "Tab Validaciones para consultar reglas del sistema",
      "Tab Consejos con tips específicos",
      "Buscador en la ayuda para encontrar guías rápidamente",
    ],
  },
];

const STEPS_INSTRUCTOR: TourStep[] = [
  {
    title: "¡Bienvenido, Instructor! 🎉",
    description: "Tenés acceso a la gestión de clases, alumnos, caballos y el calendario. Este tour te mostrará las funciones que más vas a usar día a día.",
    icon: Sparkles,
    color: "text-blue-500",
  },
  {
    title: "Tus Clases 📅",
    description: "Podés crear, editar y gestionar las clases que te son asignadas. El sistema valida horarios y conflictos automáticamente.",
    icon: CalendarDays,
    color: "text-purple-500",
    path: "/clases",
    features: [
      "Creá clases para cualquier alumno activo",
      "Tu nombre se preselecciona automáticamente como instructor",
      "Especialidades: Equitación, Adiestramiento, Equinoterapia, Monta",
      "30 o 60 minutos de duración",
      "El sistema valida que no haya conflictos de horario",
      "Filtrá por nombre de alumno, estado o especialidad",
    ],
  },
  {
    title: "Estados de Clase 🔄",
    description: "Actualizá el estado de tus clases durante y después de cada jornada.",
    icon: ShieldCheck,
    color: "text-indigo-500",
    path: "/clases",
    features: [
      "🟠 PROGRAMADA → 🔵 INICIADA → 🟢 COMPLETADA",
      "🔴 CANCELADA: requiere seleccionar un motivo",
      "🟣 ACA: el alumno avisó que no vendría",
      "🌸 ASA: el alumno no asistió sin aviso",
      "Las clases COMPLETADAS y CANCELADAS son inmutables (registro histórico)",
      "Cambio rápido desde el popover del calendario",
    ],
  },
  {
    title: "Calendario — Tu Vista Diaria 🗓️",
    description: "El Calendario es tu herramienta principal del día a día. Filtrá por tu nombre para ver solo tus clases y gestioná las reservas de tus alumnos.",
    icon: Calendar,
    color: "text-cyan-500",
    path: "/calendario",
    features: [
      "Vista Día: doble clic en celda vacía para crear clase pre-cargada",
      "Filtrá por tu nombre para ver solo tus clases",
      "Clic en una clase → popover con detalles y cambio rápido de estado",
      "Expandí el calendario a pantalla completa con el ícono ↔",
      "Panel inferior: confirmá o rechazá las reservas de tus alumnos",
      "El color de fondo de tus clases es tu color de instructor",
    ],
  },
  {
    title: "Reservas de Alumnos ⏳",
    description: "Los alumnos pueden solicitar clases desde el Calendario. Esas solicitudes llegan en estado RESERVADA y vos decidís si confirmarlas o rechazarlas.",
    icon: Sparkles,
    color: "text-teal-500",
    path: "/calendario",
    features: [
      "Las reservas aparecen en el panel inferior del Calendario",
      "Cada reserva muestra: alumno, fecha, hora y caballo solicitado",
      "\"Confirmar\" cambia el estado a PROGRAMADA",
      "\"X\" rechaza la reserva (pasa a CANCELADA)",
      "También podés confirmar desde el popover de la clase",
    ],
  },
  {
    title: "Alumnos y Caballos 👥",
    description: "Podés consultar y editar datos de alumnos y ver la disponibilidad de caballos.",
    icon: Users,
    color: "text-green-500",
    path: "/alumnos",
    features: [
      "Buscá alumnos por nombre o apellido",
      "Ver el perfil completo con historial de clases",
      "Contactar por WhatsApp o email",
      "Ver disponibilidad de caballos antes de programar",
      "Los caballos privados solo son asignables al propietario",
    ],
  },
  {
    title: "Reportes y Ayuda 📊",
    description: "Consultá tus estadísticas y usá el sistema de ayuda contextual en cualquier momento.",
    icon: BarChart,
    color: "text-pink-500",
    path: "/reportes",
    features: [
      "Reportes filtrados automáticamente a tus datos",
      "Tab Instructores: tu carga de trabajo y eficiencia",
      "Tab Alumnos: asistencia de tus alumnos",
      "Botón (?) flotante con guías paso a paso en cada página",
      "Las guías están adaptadas al rol de Instructor",
    ],
  },
];

const STEPS_ALUMNO: TourStep[] = [
  {
    title: "¡Bienvenido! 🎉",
    description: "Podés consultar tus clases, ver el calendario de la escuela y reservar nuevas clases. Este tour te muestra todo lo que podés hacer.",
    icon: Sparkles,
    color: "text-green-500",
  },
  {
    title: "Mis Clases 📋",
    description: "En 'Mis Clases' encontrás el historial completo de todas tus clases con estadísticas y el detalle de tu plan.",
    icon: CalendarDays,
    color: "text-blue-500",
    path: "/mis-clases",
    features: [
      "Total de clases, completadas, próximas y canceladas",
      "Tu plan: cuántas clases tenés contratadas por mes",
      "Tu tipo de pensión y caballo asignado (si corresponde)",
      "Historial completo con estados y observaciones",
      "Las clases se renuevan cada mes (no son acumulables)",
    ],
  },
  {
    title: "Reservar una Clase 📅",
    description: "Desde el Calendario podés solicitar nuevas clases. Tu reserva queda pendiente hasta que el instructor o el admin la confirmen.",
    icon: Calendar,
    color: "text-purple-500",
    path: "/calendario",
    features: [
      "Clic en el número del día (Vista Mes/Semana) para reservar",
      "En Vista Día: clic en una celda vacía",
      "Tu nombre se preselecciona automáticamente",
      "Elegí especialidad, caballo y hora",
      "La clase queda en estado RESERVADA hasta ser confirmada",
      "Filtrá por tu nombre para ver solo tus clases",
    ],
  },
  {
    title: "Estados de tus Clases 🔄",
    description: "Cada clase puede estar en diferentes estados. Si no podés asistir, avisá marcando ACA desde el popover de la clase.",
    icon: ShieldCheck,
    color: "text-indigo-500",
    features: [
      "⏳ RESERVADA: enviaste la solicitud, pendiente de confirmación",
      "🟠 PROGRAMADA: confirmada y próxima a realizarse",
      "🟢 COMPLETADA: clase realizada exitosamente",
      "🔴 CANCELADA: clase cancelada",
      "🟣 ACA: avisaste que no podías asistir (clic en la clase del calendario)",
      "🌸 ASA: no asististe sin haber avisado",
      "Las clases COMPLETADAS y ASA se cuentan como clases usadas del mes",
    ],
  },
  {
    title: "Tu Perfil y Ayuda 💡",
    description: "Podés actualizar tus datos de contacto desde Mi Perfil. El botón (?) de ayuda está disponible en cada página.",
    icon: Sparkles,
    color: "text-amber-500",
    path: "/profile",
    features: [
      "Mi Perfil: actualizá teléfono y email de contacto",
      "Cambiar contraseña desde la sección Seguridad",
      "El plan de clases y el caballo lo gestiona el administrador",
      "Botón (?) flotante con guías específicas para alumnos",
      "Si tenés dudas, contactá a tu instructor o al administrador",
    ],
  },
];

// ─── Mapa de pasos por rol ────────────────────────────────────────────────────
const STEPS_BY_ROLE: Record<Role, TourStep[]> = {
  ADMIN: STEPS_ADMIN,
  INSTRUCTOR: STEPS_INSTRUCTOR,
  ALUMNO: STEPS_ALUMNO,
};

const STORAGE_KEY_BY_ROLE: Record<Role, string> = {
  ADMIN: "tour-v3-ADMIN",
  INSTRUCTOR: "tour-v3-INSTRUCTOR",
  ALUMNO: "tour-v3-ALUMNO",
};

const ROLE_LABELS: Record<Role, { label: string; className: string }> = {
  ADMIN:      { label: "Administrador", className: "bg-red-100 text-red-800 border border-red-200" },
  INSTRUCTOR: { label: "Instructor",    className: "bg-blue-100 text-blue-800 border border-blue-200" },
  ALUMNO:     { label: "Alumno",        className: "bg-green-100 text-green-800 border border-green-200" },
};

// ─── Componente ───────────────────────────────────────────────────────────────
export function OnboardingTour() {
  const { user } = useAuth();
  const role = normalizeRole(user?.rol);

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const TOUR_STEPS = STEPS_BY_ROLE[role];
  const storageKey = STORAGE_KEY_BY_ROLE[role];

  useEffect(() => {
    if (!user) return; // esperar a que cargue el usuario
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [user, storageKey]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, "true");
    setIsOpen(false);
    setCurrentStep(0);
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, "true");
    setIsOpen(false);
  };

  const handleGoToPage = () => {
    const step = TOUR_STEPS[currentStep];
    if (step.path) {
      navigate(step.path);
      handleComplete();
    }
  };

  if (!isOpen) return null;

  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;
  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;
  const roleInfo = ROLE_LABELS[role];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`rounded-full bg-secondary p-3 shrink-0 ${step.color}`}>
                <StepIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold">{step.title}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Paso {currentStep + 1} de {TOUR_STEPS.length}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Badge de rol */}
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleInfo.className}`}>
                {roleInfo.label}
              </span>
              <Button variant="ghost" size="icon" onClick={handleSkip} title="Saltar tour">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Barra de progreso */}
        <div className="space-y-1.5">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}% completado</p>
        </div>

        {/* Contenido */}
        <div className="space-y-4 py-4">
          <p className="text-sm leading-relaxed">{step.description}</p>

          {step.features && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Características principales:</h4>
              <ul className="space-y-1.5">
                {step.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step.path && (
            <Button variant="outline" onClick={handleGoToPage} className="w-full">
              Ir a esta sección
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navegación */}
        <DialogFooter className="flex-row justify-between items-center gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
            Saltar tour
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <Button onClick={handleNext}>
              {currentStep === TOUR_STEPS.length - 1 ? "¡Empezar!" : (
                <>Siguiente <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
