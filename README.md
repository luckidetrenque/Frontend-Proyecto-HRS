# Escuela de Equitación

## Tabla de Contenidos
1. [Registro de Alumno](#registro-de-alumno)
2. [Registro de Caballo](#registro-de-caballo)
3. [Registro de Instructor](#registro-de-instructor)
4. [Creación de Clase](#creación-de-clase)
5. [Clases de Prueba](#clases-de-prueba)
6. [Validaciones del Sistema](#validaciones-del-sistema)
7. [Funcionalidades del Calendario](#funcionalidades-del-calendario)
8. [Reportes y Exportación](#reportes-y-exportación)
9. [Funcionalidades Adicionales](#funcionalidades-adicionales)

---

## Registro de Alumno (sección Alumnos)

Una persona quiere tomar clases en la escuela. Para registrarse debe suministrar:

### Datos Personales (obligatorios):
- **DNI**: Solo números sin puntos (ej: 12345678)
  - El sistema valida automáticamente DNI duplicados
  - Si el DNI ya existe, se mostrará un mensaje de error
- **Nombre/s**: Nombre completo del alumno
- **Apellido/s**: Apellido completo del alumno
- **Fecha de Nacimiento**: Necesaria para cálculo de edad y seguro
- **Teléfono**: Sin el 0 ni el 15 (ej: 221234567)
  - ⚠️ **IMPORTANTE**: El sistema añade automáticamente el prefijo `+549` para números argentinos
- **Email**: Opcional pero recomendado para comunicaciones

### Configuración Automática:
- **Fecha de Inscripción**: Se registra automáticamente la fecha actual
- **Estado**: Se asigna automáticamente como alumno activo

### Plan de Clases:
Elige cuántas clases quiere tomar por mes:
- 4 clases mensuales
- 8 clases mensuales
- 12 clases mensuales
- 16 clases mensuales

### Pensión de Caballo:
El alumno debe indicar su modalidad de caballo:

#### **Opción 1: Sin caballo asignado**
- El alumno NO reserva ningún caballo específico
- Se le asigna un caballo de escuela disponible en cada clase
- No requiere configuración adicional

#### **Opción 2: Reserva caballo de escuela**
- El alumno reserva un caballo específico de la escuela
- Debe configurar:
  - **Cuota de pensión**: Entera / Media / Tercio
  - **Caballo**: Seleccionar de la lista de caballos de tipo "ESCUELA"

#### **Opción 3: Caballo propio**
- El alumno tiene su propio caballo
- Debe configurar:
  - **Cuota de pensión**: Entera / Media / Tercio
  - **Caballo**: Seleccionar de la lista de caballos de tipo "PRIVADO"

> **Nota**: Si el caballo no está registrado en el sistema, primero debe darse de alta en la sección Caballos.

---

## Registro de Caballo (sección Caballos)

Si el alumno tiene caballo propio o reserva caballo de escuela y este no está registrado:

### Datos del Caballo:
- **Nombre**: Nombre del caballo
- **Tipo**: 
  - **Escuela**: Propiedad de la escuela, disponible para todos
  - **Privado**: Pertenece a un alumno específico
- **Disponible**: Se asigna automáticamente como disponible para las clases

### Asociación Automática:
Una vez dado de alta, el caballo se asocia automáticamente al alumno:
- Si es **caballo propio**: se vincula como propietario
- Si es **reserva de escuela**: se vincula como reserva

---

## Registro de Instructor (sección Instructores)

Los instructores se registran con los siguientes datos:

### Datos Personales (obligatorios):
- **DNI**: Solo números sin puntos
  - El sistema valida automáticamente DNI duplicados
- **Nombre/s**: Nombre completo del instructor
- **Apellido/s**: Apellido completo del instructor
- **Fecha de Nacimiento**: Necesaria para registros
- **Teléfono**: Sin el 0 ni el 15
  - ⚠️ **IMPORTANTE**: El sistema añade automáticamente el prefijo `+549`
- **Email**: Opcional pero recomendado

### Configuración del Instructor:
- **Color**: Un color asignado para identificarlo visualmente en el calendario
  - Selección de 7 colores predefinidos
  - El color se usa para distinguir clases en el calendario
- **Estado**: Se asigna automáticamente como activo

---

## Creación de Clase (sección Clases)

El usuario administrador puede crear clases desde dos lugares:

### Opción A: Desde la Sección Clases

Asignar manualmente todos los datos:

#### Información Temporal:
- **Día**: Seleccionar desde el calendario (por defecto: hoy)
- **Hora de Inicio**: Seleccionar la hora
  - ⚠️ **Validación**: La clase no puede terminar después de las **18:30**
- **Duración**: 
  - 30 minutos (predeterminado)
  - 60 minutos

#### Participantes:
- **Alumno**: Seleccionar un alumno activo
  - Si la especialidad es **MONTA**: se asigna automáticamente el alumno comodín (ID 1)
  - El sistema muestra automáticamente el caballo predeterminado del alumno si tiene uno
- **Instructor**: Seleccionar un instructor activo
- **Caballo**: Seleccionar caballo disponible
  - Si el alumno tiene caballo propio o reserva, aparece preseleccionado
  - Los caballos privados solo pueden ser usados por sus propietarios

#### Configuración de la Clase:
- **Especialidad**: Seleccionar entre:
  - Equitación
  - Adiestramiento
  - Equinoterapia
  - Monta (automáticamente asigna alumno comodín)
- **Estado**: Se asigna automáticamente como **PROGRAMADA**
- **Observaciones**: Campo opcional para notas adicionales

---

### Opción B: Desde el Calendario (Vista Día)

El procedimiento es similar con estas diferencias:
- **Día, Hora y Caballo**: Ya vienen preseleccionados al hacer clic en una celda
- Facilita la programación rápida visualizando disponibilidad

---

## Clases de Prueba

### ¿Qué es una Clase de Prueba?

Una clase de prueba permite que una persona **sin cuenta de alumno activo** pueda tomar una clase para evaluar la escuela antes de inscribirse formalmente.

### Tipos de Clases de Prueba:

#### **Tipo 1: Persona Nueva**
Para alguien que nunca ha sido alumno:
- Completar **Nombre** y **Apellido** de la persona
- No requiere crear una cuenta de alumno
- Se registra como "Persona de Prueba" en el sistema
- Identificada con el emoji 🎓 en el calendario

#### **Tipo 2: Alumno Existente Inactivo**
Para un alumno ya registrado que quiere probar una especialidad nueva:
- Seleccionar el alumno desde el listado
- **Requisito**: El alumno debe estar **INACTIVO**
- **Requisito**: No debe tener clases (programadas/completadas) de esa especialidad

### Validaciones Automáticas:

El sistema valida automáticamente:

✅ **Regla 1**: Un alumno NO puede tener clase de prueba si ya tiene clases (programadas o completadas) de esa especialidad

✅ **Regla 2**: Un alumno NO puede repetir clase de prueba de la misma especialidad

✅ **Regla 3**: Las clases de prueba NO cuentan para la cuota mensual del alumno

### Indicadores Visuales:

Las clases de prueba se identifican con:
- 🎓 Emoji en el calendario
- Borde naranja en la celda
- Badge "Prueba" en los detalles
- Alerta informativa al editar

---

## Validaciones del Sistema

### 1. Validación de Horario Límite

**Regla**: Las clases no pueden terminar después de las **18:30**

**Ejemplo**:
- ❌ Clase de 60 minutos a las 18:00 (terminaría a las 19:00)
- ✅ Clase de 60 minutos a las 17:30 (terminaría a las 18:30)
- ✅ Clase de 30 minutos a las 18:00 (terminaría a las 18:30)

**Mensaje de error**: 
> "La clase no puede terminar después de las 18:30. Con duración de 60 minutos a las 18:00 terminaría a las 19:00."

### 2. Validación de DNI Duplicado

**Comportamiento**:
- Al escribir un DNI en los formularios de Alumno o Instructor
- El sistema valida en tiempo real si ese DNI ya existe
- Si existe, muestra un mensaje de error y no permite guardar
- La validación se activa automáticamente al escribir 9 o más dígitos

### 3. Validación de Conflictos de Horario

**Verifica**:
- Que el caballo no tenga otra clase a la misma hora
- Que el instructor no tenga otra clase a la misma hora
- Muestra indicadores visuales (⚠️) en celdas con conflicto

### 4. Restricciones de Edición

**No se pueden editar clases con estado**:
- COMPLETADA
- INICIADA
- CANCELADA

**Razón**: Las clases finalizadas son registro histórico

**Indicadores visuales**:
- Botones "Editar" y "Eliminar" deshabilitados
- Tooltip explicativo: "No se puede editar una clase finalizada"
- Opacidad reducida en controles

### 5. Validación de Clases Restantes

**Monitoreo automático**:
- El sistema calcula clases tomadas vs. clases contratadas
- Muestra alertas cuando el alumno está cerca del límite
- Permite crear clases aunque se haya agotado el cupo (con confirmación)

---

## Funcionalidades del Calendario

### Vistas Disponibles:

#### **Vista Mes**
- Muestra todas las semanas del mes
- Hasta 3 clases por día (+ indicador de más)
- Click en día para ver detalle o crear clase

#### **Vista Semana**
- Muestra 7 días completos
- Hasta 10 clases por día
- Navegación semanal

#### **Vista Día** (Tipo Excel)
- Vista detallada estilo hoja de cálculo
- Columnas: Hora fija + columna por caballo
- Filas: Franjas horarias de 30 minutos (09:00 - 18:30)
- Click en celda vacía para crear clase rápidamente

### Características de las Clases:

#### **Clases de 30 minutos**:
- Ocupan una sola franja horaria
- Ejemplo: Clase a las 10:00 ocupa solo la celda 10:00

#### **Clases de 60 minutos**:
- Ocupan DOS franjas horarias consecutivas
- Ejemplo: Clase a las 10:00 ocupa celdas 10:00 y 10:30
- La celda de continuación es clickeable (abre el mismo popover)
- Muestra borde visual para indicar continuidad

### Identificación por Color:

Cada clase muestra:
- **Fondo**: Color del instructor asignado (más claro para legibilidad)
- **Borde izquierdo**: Color según estado de la clase:
  - 🟠 Naranja: PROGRAMADA
  - 🔵 Azul: INICIADA
  - 🟢 Verde: COMPLETADA
  - 🔴 Rojo: CANCELADA
  - 🟣 Púrpura: ACA (Ausencia con Aviso)
  - 🌸 Rosa: ASA (Ausencia sin Aviso)

### Información en Hover:
- Nombre del alumno
- Nombre del caballo
- Estado de la clase
- Instructor asignado

### Herramientas del Calendario:

#### **1. Copiar Clases**
- Copiar la programación completa de una semana a otra
- Seleccionar:
  - Día de origen (un día cualquiera de la semana origen)
  - Día de destino (un día cualquiera de la semana destino)
  - Cantidad de semanas a copiar
- El sistema copia todas las clases de la semana completa

#### **2. Eliminar Clases en Rango**
- Eliminar múltiples clases entre dos fechas
- Seleccionar fecha inicio y fecha fin
- Confirmación antes de eliminar

#### **3. Cancelar Día Completo**
- Disponible en Vista Día
- Cancela todas las clases del día actual
- Permite seleccionar motivo:
  - Lluvia
  - Feriado
  - Mantenimiento
  - Evento Especial
  - Emergencia
  - Otro (con observaciones personalizadas)
- Solo cancela clases PROGRAMADAS (respeta completadas y ya canceladas)

#### **4. Exportar a Excel** (Vista Día)
- Exporta la programación del día en formato profesional
- Características del archivo:
  - Título con fecha completa
  - Cabecera con colores según tipo de caballo:
    - 🔵 Azul: Caballos de Escuela
    - 🟡 Dorado: Caballos Privados
  - Celdas con color del instructor
  - Bordes naranjas para clases de prueba
  - Comentarios con detalles completos de cada clase
  - Leyenda de instructores y tipos de caballo
  - Formato optimizado para impresión

### Filtros Disponibles:
- **Por Alumno**: Ver solo clases de un alumno específico
- **Por Instructor**: Ver solo clases de un instructor específico
- Combinables entre sí

---

## Reportes y Exportación

### Reportes Disponibles:

#### **1. Reporte General**
Incluye:
- Distribución de alumnos por plan (4, 8, 12, 16 clases)
- Estados de clases (gráficos de barras)
- Distribución por día de semana
- Distribución por franja horaria (Mañana/Tarde/Noche)

#### **2. Reporte de Alumnos**
Información:
- Listado completo de alumnos
- Estado (Activo/Inactivo)
- Plan contratado
- Si tiene caballo propio
- Fecha de inscripción
- Exportable a Excel

#### **3. Reporte de Clases**
Métricas:
- Total de clases programadas
- Clases completadas (con porcentaje)
- Clases canceladas
- Distribución por estado
- Distribución por día de semana
- Asistencia por alumno (con porcentajes)
- Exportable a Excel

#### **4. Reporte de Instructores**
Análisis:
- Carga de trabajo por instructor
- Clases completadas vs. canceladas
- Eficiencia (% de clases completadas)
- Exportable a Excel

#### **5. Reporte de Caballos**
Estadísticas:
- Uso de cada caballo
- Distribución por tipo (Escuela/Privado)
- Porcentaje de uso en el período
- Caballos disponibles vs. no disponibles
- Exportable a Excel

### Filtro de Período:
Todos los reportes permiten filtrar por:
- Fecha inicio
- Fecha fin
- Por defecto: Mes actual

### Formato de Exportación:
Archivos Excel con:
- Formato profesional
- Títulos y subtítulos
- Cabeceras con color
- Filas alternadas para mejor lectura
- Columnas con ancho optimizado
- Totales y porcentajes calculados
- Nombre de archivo: `Reporte_[Tipo]_[Fecha].xlsx`

---

## Funcionalidades Adicionales

### 1. Búsqueda Inteligente Global

**Disponible en todas las secciones**:
- Alumnos
- Instructores
- Caballos
- Clases

**Características**:
- Búsqueda en tiempo real
- Filtra por múltiples campos simultáneamente
- Resultados instantáneos
- Mantiene los filtros tradicionales disponibles

### 2. Sistema de Vistas (Tabla / Cards)

Todas las secciones principales permiten cambiar entre:
- **Vista Tabla**: Formato tradicional de filas y columnas
- **Vista Cards**: Tarjetas visuales con información clave

### 3. Paginación Inteligente

**Controles**:
- Cambio de página (← →)
- Selector de tamaño de página (10, 20, 50, 100)
- Indicador de página actual / total
- Contador de registros totales

### 4. Acciones Rápidas

#### En Listados:
- Click en fila: Ver detalle completo
- Menú contextual (⋮):
  - Editar
  - Eliminar
  - Contactar (para alumnos e instructores)
    - WhatsApp (con mensaje pre-cargado)
    - Email

#### En Calendario:
- Click en celda vacía: Crear clase rápida
- Click en clase: Ver detalles en popover
- Cambio rápido de estado desde popover

### 5. Perfiles Detallados

Cada entidad tiene su página de detalle con:

#### **Perfil de Alumno**:
- Información personal completa
- Caballo asignado (si tiene)
- Estadísticas de clases
- Historial completo de clases
- Porcentaje de asistencia
- Gráficos visuales

#### **Perfil de Instructor**:
- Información personal completa
- Distribución de clases por especialidad
- Estadísticas de desempeño
- Eficiencia en clases
- Historial completo

#### **Perfil de Caballo**:
- Información del caballo
- Propietario(s) asociado(s)
- Tipo (Escuela/Privado)
- Disponibilidad
- Estadísticas de uso
- Historial de clases

#### **Detalle de Clase**:
- Información completa
- Participantes (Alumno, Instructor, Caballo)
- Cambio rápido de estado
- Indicador de clase de prueba
- Acceso rápido a perfiles

### 6. Notificaciones y Validaciones

**Sistema de Toasts**:
- Confirmaciones de acciones exitosas (verde)
- Errores y validaciones (rojo)
- Advertencias (amarillo)
- Información (azul)

**Mensajes Contextuales**:
- Tooltips explicativos en campos complejos
- Alertas de validación en tiempo real
- Confirmaciones antes de acciones destructivas

### 7. Estados de Clase

**Estados disponibles**:
1. **PROGRAMADA** 🟠: Clase agendada, pendiente de realizar
2. **INICIADA** 🔵: Clase en progreso
3. **COMPLETADA** 🟢: Clase finalizada exitosamente
4. **CANCELADA** 🔴: Clase cancelada
5. **ACA** 🟣: Ausencia Con Aviso (alumno avisó que no asistirá)
6. **ASA** 🌸: Ausencia Sin Aviso (alumno no asistió sin avisar)

**Transiciones de estado**:
- Cambio rápido desde cualquier vista
- Validaciones de estado previo
- Registro de historial

### 8. Configuración de Sesión

**Seguridad**:
- Cierre automático por inactividad (15 minutos)
- Autenticación Basic Auth
- Registro solo con email en whitelist
- Validación de contraseña fuerte

### 9. Exportación de Calendario

**Formato Excel Profesional**:
- Vista tipo Excel del día
- Colores por instructor
- Diferenciación de tipo de caballo
- Comentarios con detalles
- Leyendas explicativas
- Formato A4 optimizado para impresión

---

## Reglas de Negocio Clave

### ✅ Validaciones Críticas:

1. **Horario**: Clases no pueden terminar después de las 18:30
2. **DNI**: No se permiten DNI duplicados (alumnos e instructores)
3. **Edición**: No se pueden editar clases finalizadas (COMPLETADA, INICIADA, CANCELADA)
4. **Clases de Prueba**: 
   - Solo para alumnos inactivos
   - No se pueden repetir en la misma especialidad
   - No se permiten si el alumno ya tiene clases de esa especialidad
5. **Caballos Privados**: Solo pueden ser usados por sus propietarios
6. **Conflictos**: No se permite programar dos clases simultáneas con el mismo caballo o instructor

### 🔄 Valores Predeterminados:

- **Duración de clase**: 30 minutos
- **Estado de clase nueva**: PROGRAMADA
- **Estado de alumno nuevo**: Activo
- **Estado de instructor nuevo**: Activo
- **Estado de caballo nuevo**: Disponible
- **Prefijo telefónico**: +549 (automático para Argentina)

### 📊 Límites del Sistema:

- **Horario de clases**: 09:00 a 18:30
- **Franjas horarias**: 30 minutos
- **Planes disponibles**: 4, 8, 12, 16 clases mensuales
- **Duraciones de clase**: 30 o 60 minutos
- **Colores de instructor**: 7 colores predefinidos

---

## Notas Técnicas

### Formato de Datos:

- **Fechas**: yyyy-MM-dd
- **Horas**: HH:mm (formato 24 horas)
- **Teléfonos**: +549XXXXXXXXX (con prefijo argentino automático)
- **DNI**: Solo números, sin puntos ni guiones

### Especialidades:

1. **Equitación**: Clase regular de equitación
2. **Adiestramiento**: Entrenamiento del caballo
3. **Equinoterapia**: Terapia asistida con caballos
4. **Monta**: Monta libre (asigna automáticamente alumno comodín ID 1)

### Tipos de Pensión:

1. **SIN_CABALLO**: Se asigna caballo por clase
2. **RESERVA_ESCUELA**: Reserva un caballo de escuela específico
3. **CABALLO_PROPIO**: El alumno tiene su caballo privado

### Cuotas de Pensión:

1. **ENTERA**: Pensión completa
2. **MEDIA**: Media pensión
3. **TERCIO**: Un tercio de pensión

---

## Flujo Típico de Uso

### Para Registrar un Nuevo Alumno:

1. Ir a sección **Alumnos**
2. Click en **Nuevo Alumno**
3. Completar datos personales
4. Seleccionar plan de clases
5. Configurar tipo de pensión y caballo (si aplica)
6. Guardar → Alumno queda activo automáticamente

### Para Programar una Clase:

1. Ir a **Calendario** (Vista Día recomendada)
2. Click en celda vacía (hora + caballo)
3. Sistema pre-carga día, hora y caballo
4. Seleccionar alumno
5. Seleccionar instructor
6. Seleccionar especialidad
7. Ajustar duración si es necesario
8. Marcar "Clase de Prueba" si aplica
9. Guardar → Clase queda PROGRAMADA

### Para Gestionar Clases de Prueba:

#### Persona Nueva:
1. Crear clase normalmente
2. Marcar checkbox "Clase de Prueba"
3. Seleccionar "Persona nueva"
4. Ingresar nombre y apellido
5. Guardar

#### Alumno Existente:
1. Crear clase normalmente
2. Marcar checkbox "Clase de Prueba"
3. Seleccionar "Alumno existente"
4. Elegir alumno INACTIVO del selector
5. Sistema valida automáticamente
6. Guardar

### Para Exportar Calendario:

1. Ir a **Calendario** → Vista Día
2. Seleccionar el día deseado
3. Click en **Exportar Excel**
4. Archivo se descarga automáticamente
5. Abrir en Excel/LibreOffice para imprimir

### Para Cancelar un Día Completo:

1. Ir a **Calendario** → Vista Día
2. Seleccionar el día deseado
3. Click en **Cancelar Día (X)**
4. Seleccionar motivo de cancelación
5. Confirmar
6. Sistema cancela solo clases PROGRAMADAS

---

## Resumen de Cambios Respecto a la Versión Original

### ✨ Nuevas Funcionalidades:

1. ✅ Sistema completo de Clases de Prueba (Persona Nueva + Alumno Existente)
2. ✅ Validación de horario límite (18:30)
3. ✅ Validación de DNI duplicado en tiempo real
4. ✅ Restricción de edición para clases finalizadas
5. ✅ Exportación profesional a Excel con formato avanzado
6. ✅ Sistema de búsqueda inteligente global
7. ✅ Cancelación masiva de día con motivos
8. ✅ Indicadores visuales de clases de prueba
9. ✅ Clases de 60 minutos con continuación visual
10. ✅ Sistema de reportes con múltiples formatos
11. ✅ Vistas alternativas (Tabla/Cards)
12. ✅ Perfiles detallados con estadísticas
13. ✅ Formato automático de teléfono (+549)
14. ✅ Sistema de Personas de Prueba
15. ✅ Monitoreo de clases restantes por alumno

### 🔧 Mejoras de Validación:

1. ✅ Validación de clases de prueba con reglas de negocio
2. ✅ Validación de conflictos de horario
3. ✅ Validación de fin de clase (18:30)
4. ✅ Validación de DNI duplicado
5. ✅ Restricciones de edición por estado

### 🎨 Mejoras de Interfaz:

1. ✅ Indicadores visuales por color de instructor
2. ✅ Borde de estado en clases
3. ✅ Emoji 🎓 para clases de prueba
4. ✅ Tooltips explicativos
5. ✅ Alertas contextuales
6. ✅ Leyendas de color en calendario

---

## Contacto y Soporte

Para dudas sobre el uso del sistema o sugerencias de mejora, contactar al administrador del sistema.

---

**Documento actualizado**: 18 de Febrero de 2026  
**Versión**: 2.0  
**Sistema**: Gestión de Escuela de Equitación HRS
