/**
 * HelpSystem.tsx
 * Sistema de Ayuda Integrado para Escuela de Equitación
 * 
 * INSTRUCCIONES DE USO:
 * 1. Importar en Layout.tsx: import { HelpSystem } from '@/components/HelpSystem';
 * 2. Agregar al final del Layout: <HelpSystem />
 * 3. El botón flotante aparecerá automáticamente en todas las páginas
 */

import {
  BarChart,
  BookOpen,
  Calendar,
  CalendarDays,
  ChevronRight,
  HelpCircle,
  Landmark,
  Lightbulb,
  Search,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useEffect,useState } from 'react';
import { useLocation } from 'react-router-dom';

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

// 📚 CONTENIDO DE AYUDA ESPECÍFICO PARA CADA PÁGINA
const helpContent = {
  '/': {
    title: 'Página Principal',
    description: 'Bienvenido al sistema de gestión de la escuela',
    workflows: [
      {
        title: 'Primeros Pasos',
        icon: '🚀',
        steps: [
          {
            title: 'Acceso Rápido',
            content: 'Haz clic en cualquier tarjeta para acceder directamente a esa sección del sistema.',
          },
          {
            title: 'Navegación',
            content: 'Usa el menú lateral izquierdo para moverte entre las diferentes secciones.',
          },
          {
            title: 'Búsqueda Global',
            content: 'Utiliza la barra de búsqueda superior para encontrar alumnos, instructores o caballos rápidamente.',
          },
        ],
      },
    ],
    tips: [
      'Las tarjetas muestran estadísticas en tiempo real',
      'El sistema guarda automáticamente tu sesión',
    ],
  },
  '/alumnos': {
    title: 'Gestión de Alumnos',
    description: 'Administra la información de todos los alumnos inscriptos',
    workflows: [
      {
        title: 'Agregar un Nuevo Alumno',
        icon: '➕',
        steps: [
          {
            title: 'Paso 1: Abrir formulario',
            content: 'Haz clic en el botón "Nuevo Alumno" en la esquina superior derecha.',
          },
          {
            title: 'Paso 2: Completar datos personales',
            content: 'Ingresa nombre, apellido, DNI y fecha de nacimiento. El DNI debe ser solo números sin puntos.',
          },
          {
            title: 'Paso 3: Datos de contacto',
            content: 'Completa teléfono (sin 0 ni 15) y email. El email es opcional pero recomendado.',
          },
          {
            title: 'Paso 4: Configuración de clases',
            content: 'Selecciona la cantidad de clases mensuales (4, 8, 12 o 16) y marca si tiene caballo propio.',
          },
          {
            title: 'Paso 5: Guardar',
            content: 'Haz clic en "Crear Alumno". El alumno aparecerá automáticamente en la lista.',
          },
        ],
      },
      {
        title: 'Editar o Eliminar Alumnos',
        icon: '✏️',
        steps: [
          {
            title: 'Editar',
            content: 'Haz clic en el ícono de lápiz en la columna "Acciones" de la tabla o directamente en la fila del alumno.',
          },
          {
            title: 'Eliminar',
            content: 'Haz clic en el ícono de basura. Se pedirá confirmación antes de eliminar.',
          },
        ],
      },
      {
        title: 'Contactar Alumnos',
        icon: '💬',
        steps: [
          {
            title: 'WhatsApp',
            content: 'Haz clic en el ícono de mensaje verde para abrir WhatsApp con el alumno.',
          },
          {
            title: 'Email',
            content: 'Haz clic en el ícono de correo para enviar un email.',
          },
        ],
      },
      {
        title: 'Filtros y Búsqueda',
        icon: '🔍',
        steps: [
          {
            title: 'Filtrar por clases/mes',
            content: 'Usa el filtro "Clases/Mes" para ver alumnos según su plan contratado.',
          },
          {
            title: 'Filtrar por estado',
            content: 'Selecciona "Activo" o "Inactivo" para ver solo alumnos en ese estado.',
          },
          {
            title: 'Búsqueda inteligente',
            content: 'Usa la barra de búsqueda superior para encontrar por nombre, apellido o características.',
          },
          {
            title: 'Reiniciar filtros',
            content: 'Haz clic en "Limpiar filtros" para ver todos los alumnos nuevamente.',
          },
        ],
      },
      {
        title: 'Cambiar Vista',
        icon: '👁️',
        steps: [
          {
            title: 'Vista Tabla',
            content: 'Muestra todos los datos en formato tabla con todas las columnas visibles.',
          },
          {
            title: 'Vista Cards',
            content: 'Muestra cada alumno como una tarjeta individual con la información más relevante.',
          },
        ],
      },
    ],
    tips: [
      'El teléfono debe ingresarse con código de país pero sin 0 ni 15 inicial',
      'Los alumnos inactivos no aparecen en el calendario de clases',
      'Puedes hacer clic en cualquier fila para ver más detalles del alumno',
      'Los alumnos con caballo propio tienen prioridad en la asignación de horarios',
    ],
  },
  '/instructores': {
    title: 'Gestión de Instructores',
    description: 'Administra el equipo de instructores de la escuela',
    workflows: [
      {
        title: 'Agregar un Nuevo Instructor',
        icon: '➕',
        steps: [
          {
            title: 'Paso 1: Abrir formulario',
            content: 'Haz clic en "Nuevo Instructor" en la esquina superior derecha.',
          },
          {
            title: 'Paso 2: Datos personales',
            content: 'Completa nombre, apellido, DNI y fecha de nacimiento.',
          },
          {
            title: 'Paso 3: Contacto',
            content: 'Ingresa teléfono y email del instructor.',
          },
          {
            title: 'Paso 4: Asignar color',
            content: 'Selecciona un color único para el instructor. Este color se usa en el calendario para identificar sus clases rápidamente.',
          },
          {
            title: 'Paso 5: Estado',
            content: 'Marca "Instructor activo" si está disponible para dar clases. Puedes desactivarlo temporalmente sin eliminarlo.',
          },
        ],
      },
      {
        title: 'Sistema de Colores',
        icon: '🎨',
        steps: [
          {
            title: 'Importancia de los colores',
            content: 'Cada instructor tiene un color único que aparece en el calendario, facilitando la identificación visual de quién da cada clase.',
          },
          {
            title: 'Seleccionar color',
            content: 'Al crear o editar un instructor, elige un color de la paleta predefinida. Se recomienda usar colores contrastantes.',
          },
          {
            title: 'Vista en calendario',
            content: 'En la vista de calendario, las clases se muestran con el color del instructor asignado.',
          },
        ],
      },
    ],
    tips: [
      'Los instructores inactivos no aparecen en la lista al programar nuevas clases',
      'Asigna colores bien diferenciados para mejorar la visualización en el calendario',
      'Puedes desactivar temporalmente un instructor sin eliminar su historial',
    ],
  },
  '/caballos': {
    title: 'Gestión de Caballos',
    description: 'Controla los caballos de la escuela y privados',
    workflows: [
      {
        title: 'Registrar un Nuevo Caballo',
        icon: '🐴',
        steps: [
          {
            title: 'Paso 1: Crear caballo',
            content: 'Haz clic en "Nuevo Caballo".',
          },
          {
            title: 'Paso 2: Nombre',
            content: 'Ingresa el nombre del caballo.',
          },
          {
            title: 'Paso 3: Tipo',
            content: 'Selecciona "Escuela" si es propiedad de la escuela o "Privado" si pertenece a un alumno.',
          },
          {
            title: 'Paso 4: Disponibilidad',
            content: 'Marca "Disponible" si el caballo puede ser asignado a clases. Desmarca si está enfermo, lesionado o no disponible.',
          },
        ],
      },
      {
        title: 'Tipos de Caballos',
        icon: '📋',
        steps: [
          {
            title: 'Caballos de Escuela',
            content: 'Son propiedad de la escuela y pueden ser asignados a cualquier alumno.',
          },
          {
            title: 'Caballos Privados',
            content: 'Pertenecen a alumnos específicos. Solo pueden ser usados por su dueño en las clases.',
          },
        ],
      },
    ],
    tips: [
      'Los caballos marcados como "No Disponible" no aparecen al programar clases',
      'Caballos privados solo aparecen cuando programas clases para su propietario',
      'Mantén actualizado el estado de disponibilidad para evitar errores de programación',
    ],
  },
  '/clases': {
    title: 'Gestión de Clases',
    description: 'Programa y administra todas las clases de equitación',
    workflows: [
      {
        title: 'Programar una Nueva Clase',
        icon: '📅',
        steps: [
          {
            title: 'Paso 1: Crear clase',
            content: 'Haz clic en "Nueva Clase".',
          },
          {
            title: 'Paso 2: Fecha y hora',
            content: 'Selecciona el día y la hora de inicio de la clase.',
          },
          {
            title: 'Paso 3: Seleccionar alumno',
            content: 'Elige el alumno que tomará la clase. Si la especialidad es "MONTA", el alumno se asigna automáticamente.',
          },
          {
            title: 'Paso 4: Asignar instructor',
            content: 'Selecciona el instructor que dictará la clase. Solo aparecen instructores activos.',
          },
          {
            title: 'Paso 5: Elegir caballo',
            content: 'Selecciona el caballo para la clase. Solo se muestran caballos disponibles.',
          },
          {
            title: 'Paso 6: Especialidad',
            content: 'Elige entre EQUINOTERAPIA, EQUITACION, ADIESTRAMIENTO o MONTA.',
          },
          {
            title: 'Paso 7: Clase de prueba (opcional)',
            content: 'Si es una clase de prueba para un alumno nuevo, marca la casilla correspondiente. El alumno debe estar inactivo.',
          },
        ],
      },
      {
        title: 'Estados de Clases',
        icon: '🔄',
        steps: [
          {
            title: 'PROGRAMADA',
            content: 'Clase creada pero aún no iniciada.',
          },
          {
            title: 'INICIADA',
            content: 'Clase en curso.',
          },
          {
            title: 'COMPLETADA',
            content: 'Clase finalizada exitosamente.',
          },
          {
            title: 'CANCELADA',
            content: 'Clase cancelada por cualquier motivo.',
          },
          {
            title: 'ACA (Ausencia Con Aviso)',
            content: 'Alumno avisó con anticipación que no asistirá.',
          },
          {
            title: 'ASA (Ausencia Sin Aviso)',
            content: 'Alumno no asistió y no avisó.',
          },
        ],
      },
      {
        title: 'Especialidades',
        icon: '🎯',
        steps: [
          {
            title: 'EQUINOTERAPIA',
            content: 'Terapia asistida con caballos.',
          },
          {
            title: 'EQUITACION',
            content: 'Clases regulares de equitación.',
          },
          {
            title: 'ADIESTRAMIENTO',
            content: 'Entrenamiento avanzado del caballo.',
          },
          {
            title: 'MONTA',
            content: 'Monta libre sin alumno específico asignado.',
          },
        ],
      },
    ],
    tips: [
      'Usa los filtros para encontrar clases específicas rápidamente',
      'Las clases de prueba permiten evaluar nuevos alumnos sin activarlos en el sistema',
      'Puedes cambiar el estado de una clase en cualquier momento editándola',
      'Las clases canceladas con ACA no penalizan al alumno',
    ],
  },
  '/calendario': {
    title: 'Calendario de Clases',
    description: 'Vista visual e interactiva de todas las clases programadas',
    workflows: [
      {
        title: 'Navegación en el Calendario',
        icon: '🗓️',
        steps: [
          {
            title: 'Cambiar vista',
            content: 'Alterna entre vista Mes, Semana o Día usando los botones superiores.',
          },
          {
            title: 'Navegar fechas',
            content: 'Usa las flechas ← → para moverte entre períodos o "Hoy" para volver al día actual.',
          },
          {
            title: 'Ver detalles',
            content: 'Haz clic en cualquier clase para ver su información completa.',
          },
        ],
      },
      {
        title: 'Crear Clases desde el Calendario',
        icon: '➕',
        steps: [
          {
            title: 'Vista Día',
            content: 'Haz clic en una celda de hora vacía para crear una clase en ese horario.',
          },
          {
            title: 'Vista Mes/Semana',
            content: 'Haz clic en un día para cambiar a vista Día y luego selecciona el horario.',
          },
          {
            title: 'Caballo preseleccionado',
            content: 'Al hacer clic en una celda de caballo específica, ese caballo se preselecciona en el formulario.',
          },
        ],
      },
      {
        title: 'Herramientas Rápidas',
        icon: '⚡',
        steps: [
          {
            title: 'Copiar Semana',
            content: 'Copia todas las clases de una semana a otra. Útil para replicar horarios recurrentes.',
          },
          {
            title: 'Eliminar Semana',
            content: 'Elimina todas las clases de una semana completa (por ejemplo, durante vacaciones).',
          },
          {
            title: 'Cancelar Día',
            content: 'En vista Día, puedes cancelar todas las clases de ese día (por ejemplo, por lluvia).',
          },
          {
            title: 'Exportar Excel',
            content: 'En vista Día, exporta el listado de clases del día a Excel.',
          },
        ],
      },
      {
        title: 'Cambiar Estado de Clases',
        icon: '🔄',
        steps: [
          {
            title: 'Método 1: Editar clase',
            content: 'Haz clic en una clase y luego en el botón de editar (lápiz) para cambiar su estado.',
          },
          {
            title: 'Método 2: Cambio rápido',
            content: 'En vista Día, usa el menú desplegable junto a cada clase para cambiar el estado directamente.',
          },
        ],
      },
      {
        title: 'Filtros',
        icon: '🔍',
        steps: [
          {
            title: 'Filtrar por alumno',
            content: 'Selecciona un alumno para ver solo sus clases.',
          },
          {
            title: 'Filtrar por instructor',
            content: 'Selecciona un instructor para ver solo sus clases.',
          },
          {
            title: 'Limpiar filtros',
            content: 'Haz clic en "Limpiar filtros" para ver todas las clases nuevamente.',
          },
        ],
      },
    ],
    tips: [
      'Los colores de las clases corresponden al instructor asignado',
      'En vista Mes, cada día muestra el número de clases programadas',
      'Usa "Copiar Semana" para ahorrar tiempo al programar horarios recurrentes',
      'Las clases de prueba se muestran con un badge especial 🎓',
    ],
  },
  '/reportes': {
    title: 'Reportes y Estadísticas',
    description: 'Análisis completo de la operación de la escuela',
    workflows: [
      {
        title: 'Generar Reportes',
        icon: '📊',
        steps: [
          {
            title: 'Paso 1: Seleccionar período',
            content: 'Ajusta las fechas de inicio y fin en la sección "Período de Análisis".',
          },
          {
            title: 'Paso 2: Navegar pestañas',
            content: 'Explora las pestañas Alumnos, Clases, Instructores y Caballos para ver diferentes métricas.',
          },
          {
            title: 'Paso 3: Exportar datos',
            content: 'Usa los botones "Exportar" en cada sección o "Exportar Todo" para obtener archivos Excel.',
          },
        ],
      },
      {
        title: 'Métricas Principales (KPIs)',
        icon: '📈',
        steps: [
          {
            title: 'Alumnos Activos',
            content: 'Cantidad total de alumnos activos en el sistema.',
          },
          {
            title: 'Instructores',
            content: 'Equipo activo de instructores disponibles.',
          },
          {
            title: 'Tasa Completado',
            content: 'Porcentaje de clases completadas vs programadas.',
          },
          {
            title: 'Ingresos Estimados',
            content: 'Proyección de ingresos mensuales basada en planes contratados.',
          },
        ],
      },
      {
        title: 'Reporte de Alumnos',
        icon: '👥',
        steps: [
          {
            title: 'Distribución por plan',
            content: 'Gráfico mostrando cuántos alumnos tienen cada plan de clases (4, 8, 12, 16).',
          },
          {
            title: 'Propietarios',
            content: 'Cantidad de alumnos con y sin caballo propio.',
          },
          {
            title: 'Listado completo',
            content: 'Tabla con todos los alumnos y sus datos principales.',
          },
        ],
      },
      {
        title: 'Reporte de Clases',
        icon: '📅',
        steps: [
          {
            title: 'Estados de clases',
            content: 'Distribución de clases por estado (PROGRAMADA, COMPLETADA, CANCELADA, etc.).',
          },
          {
            title: 'Resumen del período',
            content: 'Total de clases, completadas y canceladas en el rango de fechas.',
          },
        ],
      },
      {
        title: 'Reporte de Instructores',
        icon: '👨‍🏫',
        steps: [
          {
            title: 'Carga de trabajo',
            content: 'Tabla mostrando cuántas clases dio cada instructor.',
          },
          {
            title: 'Eficiencia',
            content: 'Porcentaje de clases completadas vs total asignadas por instructor.',
          },
        ],
      },
      {
        title: 'Reporte de Caballos',
        icon: '🐴',
        steps: [
          {
            title: 'Disponibilidad',
            content: 'Cuántos caballos están disponibles vs no disponibles.',
          },
          {
            title: 'Por tipo',
            content: 'Distribución entre caballos de escuela y privados.',
          },
          {
            title: 'Uso de caballos',
            content: 'Tabla mostrando cuántas clases realizó cada caballo.',
          },
        ],
      },
    ],
    tips: [
      'Exporta los reportes regularmente para mantener un historial',
      'Usa la tasa de completado para identificar problemas de asistencia',
      'El reporte de carga de instructores ayuda a balancear la distribución de clases',
      'Los datos de uso de caballos permiten planificar mantenimiento y descanso',
    ],
  },
};

// 🎨 COMPONENTE PRINCIPAL
export function HelpSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'workflow' | 'tips'>('workflow');
  const location = useLocation();

  // Obtener contenido de ayuda para la página actual
  const currentHelp = helpContent[location.pathname as keyof typeof helpContent] || helpContent['/'];

  // Filtrar workflows por búsqueda
  const filteredWorkflows = currentHelp.workflows?.filter((workflow) =>
    workflow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.steps.some((step) =>
      step.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      {/* 🔘 BOTÓN FLOTANTE */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        aria-label="Abrir ayuda"
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      {/* 📖 MODAL DE AYUDA */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  {currentHelp.title}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {currentHelp.description}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          {/* 🔍 BUSCADOR */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar en la ayuda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 📑 PESTAÑAS */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab('workflow')}
              className={`pb-2 px-4 text-sm font-medium transition-colors ${
                activeTab === 'workflow'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Guías Paso a Paso
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`pb-2 px-4 text-sm font-medium transition-colors ${
                activeTab === 'tips'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Consejos
            </button>
          </div>

          {/* 📝 CONTENIDO */}
          <div className="flex-1 overflow-y-auto pr-2">
            {activeTab === 'workflow' ? (
              <div className="space-y-4 py-4">
                {filteredWorkflows.length > 0 ? (
                  filteredWorkflows.map((workflow, idx) => (
                    <WorkflowCard key={idx} workflow={workflow} />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No se encontraron resultados para "{searchTerm}"</p>
                  </div>
                )}
              </div>
            ) : (
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
function WorkflowCard({ workflow }: { workflow: any }) {
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
          className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {workflow.steps.map((step: any, idx: number) => (
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
