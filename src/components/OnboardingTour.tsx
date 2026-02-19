/**
 * OnboardingTour.tsx - VERSIÓN ACTUALIZADA Y COMPLETA
 * Tour guiado para nuevos usuarios del sistema
 * 
 * ACTUALIZACIONES:
 * ✅ Información sobre clases de prueba
 * ✅ Tipos de pensión y cuotas
 * ✅ Estados de clase extendidos (ACA/ASA)
 * ✅ Validaciones del sistema
 * ✅ Herramientas del calendario
 * 
 * INSTRUCCIONES:
 * 1. Importar en Layout.tsx: import { OnboardingTour } from '@/components/OnboardingTour';
 * 2. Agregar al Layout: <OnboardingTour />
 * 3. El tour se mostrará automáticamente la primera vez
 * 4. Se guarda en localStorage que el usuario ya lo vio
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
} from 'lucide-react';

const TOUR_STEPS = [
  {
    title: '¡Bienvenido! 🎉',
    description: 'Gracias por usar nuestro sistema de gestión de escuela de equitación. Este tour rápido te mostrará las funciones principales y características avanzadas del sistema.',
    icon: Sparkles,
    color: 'text-amber-500',
    image: null,
  },
  {
    title: 'Gestión de Alumnos 👥',
    description: 'Registra alumnos con planes flexibles (4, 8, 12 o 16 clases mensuales). Gestiona tipos de pensión: sin caballo, reserva de caballo de escuela, o caballo propio.',
    icon: Users,
    color: 'text-blue-500',
    path: '/alumnos',
    features: [
      'Planes de 4, 8, 12 o 16 clases mensuales',
      'Tipos de pensión: Sin caballo / Reserva escuela / Caballo propio',
      'Cuotas de pensión: Entera, Media, Tercio',
      'Contacto directo (WhatsApp/Email)',
      'Validación automática de DNI duplicado',
      'Gestión de alumnos activos e inactivos',
      'Filtros y búsqueda avanzada',
    ],
  },
  {
    title: 'Equipo de Instructores 👨‍🏫',
    description: 'Administra tu equipo de instructores. Cada uno tiene un color único que lo identifica visualmente en el calendario, facilitando la organización.',
    icon: UserCheck,
    color: 'text-green-500',
    path: '/instructores',
    features: [
      'Registro completo de instructores',
      'Sistema de colores único (7 colores disponibles)',
      'Los colores se reflejan en las clases del calendario',
      'Control de disponibilidad (activo/inactivo)',
      'Validación de DNI duplicado',
    ],
  },
  {
    title: 'Caballos 🐴',
    description: 'Gestiona caballos de escuela (disponibles para todos) y caballos privados (exclusivos de su propietario). Control de disponibilidad para descanso o lesiones.',
    icon: Landmark,
    color: 'text-orange-500',
    path: '/caballos',
    features: [
      'Caballos de ESCUELA: disponibles para cualquier alumno',
      'Caballos PRIVADOS: solo para su propietario',
      'Control de disponibilidad temporal',
      'Asignación automática según tipo de pensión',
    ],
  },
  {
    title: 'Programación de Clases 📅',
    description: 'Crea clases regulares, clases de prueba para nuevos alumnos, y más. El sistema valida automáticamente horarios, conflictos y restricciones.',
    icon: CalendarDays,
    color: 'text-purple-500',
    path: '/clases',
    features: [
      '🎓 Clases de Prueba para Persona Nueva (sin cuenta)',
      '🎓 Clases de Prueba para Alumno Existente (inactivo)',
      '4 Especialidades: Equitación, Adiestramiento, Equinoterapia, Monta',
      'Duración: 30 o 60 minutos',
      'Estados: PROGRAMADA, INICIADA, COMPLETADA, CANCELADA, ACA, ASA',
      '⚠️ Validación automática: límite 18:30, conflictos, DNI duplicados',
      'Restricción de edición en clases completadas',
      'Filtros avanzados y búsqueda',
    ],
  },
  {
    title: 'Clases de Prueba 🎓',
    description: 'Ofrece clases de prueba sin impactar la cuota mensual. Dos modalidades: persona nueva sin cuenta de alumno, o alumno existente probando nueva especialidad.',
    icon: Sparkles,
    color: 'text-orange-500',
    path: '/clases',
    features: [
      'Persona Nueva: Solo necesitas nombre y apellido',
      'Alumno Existente: Debe estar INACTIVO',
      'NO cuentan para la cuota mensual',
      'Validación: No repetir especialidad ya tomada',
      'Identificación visual: 🎓 y borde naranja',
      'Perfectas para evaluar nuevos estudiantes',
    ],
  },
  {
    title: 'Calendario Visual 🗓️',
    description: 'Vista interactiva con 3 modos: Mes (resumen), Semana (7 días), y Día (estilo Excel). Herramientas avanzadas para copiar semanas, cancelar días completos y exportar a Excel.',
    icon: Calendar,
    color: 'text-cyan-500',
    path: '/calendario',
    features: [
      'Vista MES: Resumen mensual con indicadores',
      'Vista SEMANA: 7 días con detalle',
      'Vista DÍA: Estilo Excel, columnas por caballo',
      '📋 Copiar Semana Completa a otra semana',
      '🗑️ Eliminar Clases en Rango de fechas',
      '❌ Cancelar Día Completo (con motivos: lluvia, feriado, etc)',
      '📊 Exportar a Excel con formato profesional',
      'Colores por instructor + bordes por estado',
      'Crear clases con un clic en celdas vacías',
    ],
  },
  {
    title: 'Estados de Clase 🔄',
    description: 'Sistema completo de estados para gestionar el ciclo de vida de cada clase, desde la programación hasta su finalización o cancelación.',
    icon: ShieldCheck,
    color: 'text-indigo-500',
    path: '/clases',
    features: [
      '🟠 PROGRAMADA: Clase agendada, pendiente',
      '🔵 INICIADA: Clase en progreso',
      '🟢 COMPLETADA: Finalizada exitosamente',
      '🔴 CANCELADA: Clase cancelada',
      '🟣 ACA: Ausencia Con Aviso',
      '🌸 ASA: Ausencia Sin Aviso',
      'Cambio rápido de estado desde el calendario',
      'Restricción: No editar clases completadas/iniciadas',
    ],
  },
  {
    title: 'Validaciones Inteligentes ⚠️',
    description: 'El sistema valida automáticamente reglas de negocio críticas para garantizar la calidad de los datos y evitar errores.',
    icon: ShieldCheck,
    color: 'text-red-500',
    path: '/clases',
    features: [
      '🔴 Horario límite: Ninguna clase termina después de las 18:30',
      '🔴 DNI único: No permite duplicados en alumnos/instructores',
      '🔴 Clase de prueba: Solo alumnos INACTIVOS',
      '🔴 Especialidad nueva: No repetir clase de prueba',
      '⚠️ Conflictos: Detecta caballo/instructor en 2 clases a la vez',
      '⚠️ Restricción de edición: Clases completadas son históricas',
      'ℹ️ Clases restantes: Monitorea cupo mensual del alumno',
    ],
  },
  {
    title: 'Reportes y Estadísticas 📊',
    description: 'Análisis completo de la operación. KPIs en tiempo real, reportes por período, análisis de carga de trabajo y exportación profesional a Excel.',
    icon: BarChart,
    color: 'text-pink-500',
    path: '/reportes',
    features: [
      'KPIs: Alumnos Activos, Total Clases, Instructores, Ingresos',
      'Reportes por período personalizado',
      'Análisis de asistencia por alumno',
      'Distribución de clases por día y estado',
      'Eficiencia de instructores',
      'Uso de caballos',
      'Exportación a Excel con formato profesional',
      'Actualización en tiempo real',
    ],
  },
  {
    title: 'Herramientas del Calendario 🛠️',
    description: 'Funciones avanzadas para gestionar semanas completas, eliminar rangos de fechas, cancelar días por motivos específicos y exportar calendarios.',
    icon: Calendar,
    color: 'text-teal-500',
    path: '/calendario',
    features: [
      '📋 Copiar Semana: Replica lun-dom completo',
      '🗑️ Eliminar Rango: Borra clases entre 2 fechas',
      '❌ Cancelar Día: Con motivos (lluvia/feriado/emergencia)',
      '📊 Exportar Excel: Calendario profesional listo para imprimir',
      'Filtros por alumno y/o instructor',
      'Todo con validaciones para no afectar historial',
    ],
  },
  {
    title: '¿Necesitas ayuda? 💡',
    description: 'En cualquier momento, haz clic en el botón de ayuda (?) flotante en la esquina inferior derecha. Cada página tiene guías paso a paso, validaciones y consejos específicos.',
    icon: Sparkles,
    color: 'text-amber-500',
    features: [
      '📖 Guías paso a paso para cada acción',
      '⚠️ Validaciones del sistema explicadas',
      '💡 Consejos contextuales por página',
      '🔍 Búsqueda en la ayuda',
      'Tooltips inline en formularios',
      'Tour interactivo (este mismo)',
    ],
  },
];

const STORAGE_KEY = 'escuela-equitacion-tour-completed';

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
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
    setCurrentStep(0);
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
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
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
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
              <h4 className="text-sm font-semibold">Características principales:</h4>
              <ul className="space-y-1.5">
                {step.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>
                    <span className="flex-1">{feature}</span>
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
                'Finalizar'
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
 * ========================================
 * 🎯 INTEGRACIÓN
 * ========================================
 * 
 * 1. En tu Layout.tsx o página principal:
 * 
 * import { OnboardingTour } from '@/components/OnboardingTour';
 * 
 * export function Layout({ children }) {
 *   return (
 *     <div>
 *       <Sidebar />
 *       <main>{children}</main>
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
 *    - Edita el array TOUR_STEPS en este archivo
 *    - Agrega o quita pasos según necesites
 *    - Mantén el formato de objetos con title, description, icon, etc.
 * 
 * 4. Para cambiar el delay inicial:
 *    - En el useEffect, ajusta el valor en setTimeout (actualmente 1000ms)
 * 
 * 5. Para cambiar el storage key (si tienes múltiples instancias):
 *    - Modifica STORAGE_KEY en la línea 112
 */

/**
 * ========================================
 * 💡 PERSONALIZACIÓN ADICIONAL
 * ========================================
 * 
 * Puedes agregar:
 * 
 * 1. Screenshots o imágenes:
 *    - Agrega propiedad 'image' a cada step con URL
 *    - Renderiza <img src={step.image} /> en el contenido
 * 
 * 2. Videos demostrativos:
 *    - Agrega propiedad 'video' con URL de YouTube/Vimeo
 *    - Renderiza iframe o video player
 * 
 * 3. Links a documentación:
 *    - Agrega propiedad 'docsUrl' a cada step
 *    - Renderiza botón "Ver documentación"
 * 
 * 4. Botón "Ver más tarde":
 *    - Agrega un estado para postponer el tour
 *    - Guarda timestamp en localStorage
 *    - Muestra el tour después de X días
 * 
 * 5. Métricas de uso:
 *    - Registra qué pasos ve cada usuario
 *    - Identifica dónde abandonan el tour
 *    - Mejora los pasos menos visualizados
 */

/**
 * ========================================
 * 🔄 ACTUALIZACIONES FUTURAS
 * ========================================
 * 
 * Si agregas nuevas funcionalidades al sistema:
 * 
 * 1. Agrega un nuevo paso al array TOUR_STEPS
 * 2. Incluye: title, description, icon, color, path, features
 * 3. Considera invalidar el localStorage si el cambio es muy importante:
 *    - Cambia STORAGE_KEY a una nueva versión
 *    - Los usuarios verán el tour actualizado
 * 
 * Ejemplo de versionado:
 * const STORAGE_KEY = 'escuela-equitacion-tour-completed-v2';
 */
