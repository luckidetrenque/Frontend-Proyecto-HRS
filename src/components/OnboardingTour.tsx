/**
 * OnboardingTour.tsx
 * Tour guiado para nuevos usuarios del sistema
 *
 * INSTRUCCIONES:
 * 1. Importar en tu página principal o Layout
 * 2. El tour se mostrará automáticamente la primera vez
 * 3. Se guarda en localStorage que el usuario ya lo vio
 */

import {
  ArrowLeft,
  ArrowRight,
  BarChart,
  Calendar,
  CalendarDays,
  Landmark,
  Sparkles,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const TOUR_STEPS = [
  {
    title: "¡Bienvenido! 🎉",
    description:
      "Gracias por usar nuestro sistema de gestión de escuela de equitación. Este tour rápido te mostrará las funciones principales.",
    icon: Sparkles,
    color: "text-amber-500",
    image: null,
  },
  {
    title: "Gestión de Alumnos 👥",
    description:
      "Registra alumnos, gestiona sus datos de contacto, planes de clases y disponibilidad. Contacta directamente por WhatsApp o email.",
    icon: Users,
    color: "text-blue-500",
    path: "/alumnos",
    features: [
      "Agregar y editar alumnos",
      "Contacto directo (WhatsApp/Email)",
      "Gestión de planes de clases",
      "Filtros y búsqueda avanzada",
    ],
  },
  {
    title: "Equipo de Instructores 👨‍🏫",
    description:
      "Administra tu equipo de instructores. Asigna colores únicos para identificarlos fácilmente en el calendario.",
    icon: UserCheck,
    color: "text-green-500",
    path: "/instructores",
    features: [
      "Registro de instructores",
      "Sistema de colores para calendario",
      "Control de disponibilidad",
    ],
  },
  {
    title: "Caballos 🐴",
    description:
      "Gestiona los caballos de la escuela y privados. Controla su disponibilidad y tipo.",
    icon: Landmark,
    color: "text-orange-500",
    path: "/caballos",
    features: [
      "Caballos de escuela y privados",
      "Control de disponibilidad",
      "Asignación a clases",
    ],
  },
  {
    title: "Programación de Clases 📅",
    description:
      "Crea y gestiona clases con diferentes especialidades y estados. Soporte para clases de prueba.",
    icon: CalendarDays,
    color: "text-purple-500",
    path: "/clases",
    features: [
      "Múltiples especialidades",
      "Estados de clase (PROGRAMADA, COMPLETADA, etc.)",
      "Clases de prueba",
      "Filtros avanzados",
    ],
  },
  {
    title: "Calendario Visual 🗓️",
    description:
      "Vista interactiva de todas las clases. Cambia entre mes, semana y día. Herramientas para copiar/eliminar semanas completas.",
    icon: Calendar,
    color: "text-cyan-500",
    path: "/calendario",
    features: [
      "Vistas: Mes, Semana, Día",
      "Crear clases con un clic",
      "Copiar/Eliminar semanas",
      "Exportar a Excel",
    ],
  },
  {
    title: "Reportes y Estadísticas 📊",
    description:
      "Análisis completo de tu operación. Métricas de alumnos, clases, instructores y caballos. Exporta todo a Excel.",
    icon: BarChart,
    color: "text-pink-500",
    path: "/reportes",
    features: [
      "KPIs en tiempo real",
      "Reportes por período",
      "Análisis de carga de trabajo",
      "Exportación a Excel",
    ],
  },
  {
    title: "¿Necesitas ayuda? 💡",
    description:
      "En cualquier momento, haz clic en el botón de ayuda (?) en la esquina inferior derecha. Cada página tiene guías específicas y consejos.",
    icon: Sparkles,
    color: "text-amber-500",
    features: [
      "Guías paso a paso en cada página",
      "Consejos contextuales",
      "Búsqueda de ayuda",
      "Tooltips en formularios",
    ],
  },
];

const STORAGE_KEY = "escuela-equitacion-tour-completed";

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  // Verificar si es la primera vez del usuario
  useEffect(() => {
    const hasSeenTour = localStorage.getItem(STORAGE_KEY);
    if (!hasSeenTour) {
      // Esperar un poco antes de mostrar el tour
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
    setCurrentStep(0);
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleGoToPage = () => {
    const step = TOUR_STEPS[currentStep];
    if (step.path) {
      navigate(step.path);
      handleComplete();
    }
  };

  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;
  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-full bg-secondary p-3 ${step.color}`}>
                <StepIcon className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  {step.title}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Paso {currentStep + 1} de {TOUR_STEPS.length}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Barra de progreso */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {Math.round(progress)}% completado
          </p>
        </div>

        {/* Contenido del paso */}
        <div className="space-y-4 py-4">
          <p className="text-sm leading-relaxed">{step.description}</p>

          {step.features && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">
                Características principales:
              </h4>
              <ul className="space-y-1.5">
                {step.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step.path && (
            <Button
              variant="outline"
              onClick={handleGoToPage}
              className="w-full"
            >
              Ir a esta sección
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navegación */}
        <DialogFooter className="flex-row justify-between items-center gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Saltar tour
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            <Button onClick={handleNext}>
              {currentStep === TOUR_STEPS.length - 1 ? (
                "Finalizar"
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 🎯 INTEGRACIÓN:
 *
 * 1. En tu Layout.tsx o página principal:
 *
 * import { OnboardingTour } from '@/components/OnboardingTour';
 *
 * export function Layout({ children }) {
 *   return (
 *     <div>
 *       {children}
 *       <OnboardingTour />
 *     </div>
 *   );
 * }
 *
 * 2. Para forzar que el tour se muestre nuevamente (testing):
 *    - Abre la consola del navegador
 *    - Ejecuta: localStorage.removeItem('escuela-equitacion-tour-completed')
 *    - Recarga la página
 *
 * 3. Para personalizar los pasos:
 *    - Edita el array TOUR_STEPS
 *    - Agrega o quita pasos según necesites
 *
 * 4. Para cambiar el delay inicial:
 *    - En el useEffect, ajusta el valor en setTimeout (actualmente 1000ms)
 */

/**
 * 💡 PERSONALIZACIÓN ADICIONAL:
 *
 * Puedes agregar:
 * - Screenshots de cada sección
 * - Videos demostrativos
 * - Links a documentación externa
 * - Botón para volver a ver el tour más tarde
 */
