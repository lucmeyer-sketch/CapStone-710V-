# 📚 Índice de Módulos - APT Plataforma Educativa

Este documento proporciona un índice completo de todos los módulos del sistema con enlaces a sus documentaciones detalladas.

## 📋 Módulos Principales

### 1. 📊 [Dashboard](./MODULO-DASHBOARD.md)
Panel principal con estadísticas generales y notificaciones en tiempo real.
- **Componente**: `src/components/Dashboard/Dashboard.tsx`
- **Servicio**: `src/services/notificationService.ts`
- **Funcionalidades**: Estadísticas, notificaciones en tiempo real, navegación rápida

### Funcionalidades Clave

1. **Carga de Estadísticas**
   - Total de estudiantes y docentes
   - Tasa de asistencia (últimos 30 días)
   - Promedio general de calificaciones
   - Usuarios activos
   - Mensajes no leídos
   - Reportes generados
   - Clases del día

2. **Suscripción en Tiempo Real**
   - Escucha cambios en tablas: `asistencia`, `calificaciones`, `mensajes`, `reportes`
   - Actualiza notificaciones automáticamente
   - Recarga estadísticas cuando hay cambios relevantes

3. **Sistema de Notificaciones**
   - Tipos: `success`, `info`, `warning`, `error`, `urgent`
   - Formato de tiempo relativo (ej: "Hace 5 min")
   - Navegación a módulos relacionados
   - Límite de 15 notificaciones visibles


### 2. 💬 [Mensajería](./MODULO-MENSAJERIA.md)
Sistema de mensajería bidireccional entre docentes y estudiantes.
- **Componente**: `src/components/Messages/MessagingSystem.tsx`
- **Servicio**: `src/services/mensajeService.ts`
- **Funcionalidades**: Conversaciones privadas, categorización, respuestas

1. **Vista Docente**
   - Lista de conversaciones agrupadas por estudiante
   - Crear nuevo mensaje a cualquier estudiante
   - Ver historial completo de mensajes
   - Estadísticas de mensajes (totales, no leídos, por tipo)

2. **Vista Estudiante**
   - Lista de conversaciones agrupadas por docente
   - Solo puede responder a mensajes recibidos
   - No puede iniciar nuevas conversaciones
   - Visualización clara del remitente

3. **Sistema de Respuestas (Estudiantes)**
   - Botón "Responder" en mensajes recibidos
   - Formulario de respuesta pre-llenado
   - Asunto generado automáticamente
   - Tipo de remitente/destinatario configurado correctamente

4. **Orientación de Mensajes**
   - Mensajes propios a la derecha
   - Mensajes recibidos a la izquierda
   - Identificación clara del remitente
   - Timestamps y estados de lectura

### 3. 🏛️ [Gestión de Clases](./MODULO-GESTION-CLASES.md)
Panel de administración para gestionar clases del docente.
- **Componente**: `src/components/Administration/AdminPanel.tsx`
- **Funcionalidades**: Crear, editar, gestionar inscripciones, restricciones por materia/grado

### Funcionalidades Clave

1. **Carga de Clases**
   - Solo muestra clases del docente actual
   - Incluye información de materia y docente
   - Cuenta total de estudiantes por clase

2. **Crear Nueva Clase**
   - Materia pre-seleccionada (materia asignada del docente)
   - Grado seleccionable de grados asignados del docente
   - Sección basada en el grado seleccionado
   - Validación de constraint único: (materia_id, grado, seccion, periodo)

3. **Gestionar Inscripciones**
   - Modal con dos listas: inscritos y disponibles
   - Filtrado automático por grado y sección de la clase
   - Añadir/remover estudiantes con checkboxes
   - Guardar cambios en tabla `inscripciones`

4. **Editar Clase**
   - Editable: horario, aula, período, grado
   - NO editable: sección (deshabilitado)
   - Validación de duplicados al actualizar
   - Mensaje informativo sobre sección no editable

### 4. 📚 [Mis Clases](./MODULO-MIS-CLASES.md)
Vista dedicada para visualizar clases del docente con detalles.
- **Componente**: `src/components/Classes/MyClasses.tsx`
- **Funcionalidades**: Lista de clases, estudiantes inscritos, estadísticas

### Funcionalidades Clave

1. **Carga de Clases**
   - Filtrado por `docente_id`
   - Solo clases activas (`estado = 'activo'`)
   - Ordenadas por grado
   - Incluye información de materia

2. **Vista de Lista**
   - Tarjetas con información resumida
   - Total de estudiantes por clase
   - Horario y aula
   - Botón "Ver Detalles"

3. **Vista de Detalles**
   - Lista completa de estudiantes inscritos
   - Estadísticas de la clase:
     - Promedio de asistencia
     - Promedio de calificaciones
   - Información completa de la clase

4. **Carga de Estudiantes**
   - Se cargan al seleccionar una clase
   - Filtrados por `clase_id` en `inscripciones`
   - Incluye información completa del estudiante

### 5. 🏫 [Asistencia](./MODULO-ASISTENCIA.md)
Sistema de registro y gestión de asistencia de estudiantes.
- **Componente**: `src/components/Attendance/AttendanceSystem.tsx`
- **Servicio**: `src/services/asistenciaService.ts`
- **Funcionalidades**: Registro diario, múltiples estados, estadísticas

### Funcionalidades Clave

1. **Carga de Estudiantes**
   - Lista completa de estudiantes
   - Carga al montar el componente

2. **Registro de Asistencia**
   - Selección de fecha
   - Selección de estudiante
   - Estado de asistencia
   - Observaciones opcionales
   - Upsert (inserta o actualiza)

3. **Visualización de Asistencia**
   - Lista de registros por fecha
   - Estados visuales (colores)
   - Estadísticas del día:
     - Total presentes
     - Total ausentes
     - Total tardanzas
     - Total justificados

4. **Historial**
   - Filtrado por fecha
   - Búsqueda de estudiantes
   - Visualización de observaciones

### 6. 📈 [Reportes](./MODULO-REPORTES.md)
Generación y gestión de reportes académicos y de asistencia.
- **Componente**: `src/components/Reports/ReportsSystem.tsx`
- **Servicio**: `src/services/reporteService.ts`
- **Funcionalidades**: Reportes de asistencia, reportes académicos, historial


### Funcionalidades Clave

1. **Generación de Reportes**
   - Selección de tipo (asistencia o académico)
   - Filtros por grado, sección, fechas
   - Cálculo de estadísticas
   - Visualización inmediata

2. **Reporte de Asistencia**
   - Período de fechas
   - Filtros opcionales (grado, sección)
   - Estadísticas:
     - Total de días
     - Días presentes/ausentes
     - Porcentaje de asistencia
     - Tardanzas
   - Desglose por estudiante

3. **Reporte Académico**
   - Filtros por grado y sección
   - Estadísticas:
     - Promedio general
     - Distribución de calificaciones
     - Estudiantes destacados
     - Áreas de mejora
   - Desglose por estudiante

4. **Gestión de Reportes Guardados**
   - Lista de reportes históricos
   - Visualización de reportes anteriores
   - Información de fecha de generación

### 7. ⚙️ [Configuración](./MODULO-CONFIGURACION.md)
Panel de configuración de perfil del usuario.
- **Componente**: `src/components/Settings/ProfileSettings.tsx`
- **Servicio**: `src/services/authService.ts`
- **Funcionalidades**: Editar perfil, cambiar contraseña, información por rol

1. **Vista de Perfil**
   - Información personal completa
   - Badge de rol con diseño moderno
   - Información académica (según rol)
   - Información de cuenta (ID, tipo, estado)

2. **Edición de Perfil**
   - Modo edición con formulario
   - Validación de campos
   - Actualización en BD
   - Feedback visual

3. **Cambio de Contraseña**
   - Formulario separado
   - Validación de contraseña actual
   - Validación de nueva contraseña
   - Confirmación de contraseña

4. **Información Específica por Rol**

   **Docente:**
   - Materia asignada
   - Grados asignados (array)
   - Especialidad

   **Estudiante:**
   - Grado y sección
   - Promedio académico
   - Porcentaje de asistencia


### 8. 🔐 [Autenticación](./MODULO-AUTENTICACION.md)
Sistema de autenticación y gestión de usuarios.
- **Componente**: `src/components/Login/Login.tsx`
- **Servicio**: `src/services/authService.ts`
- **Funcionalidades**: Login, obtención de detalles de usuario, gestión de sesión

### Funcionalidades Clave

1. **Login**
   - Formulario con email y contraseña
   - Validación de campos
   - Autenticación con Supabase Auth
   - Manejo de errores

2. **Obtención de Detalles del Usuario**
   - Después de login exitoso
   - Consulta según rol:
     - Docente → tabla `docentes`
     - Estudiante → tabla `Estudiantes`
   - Combina datos de `usuarios` + detalles específicos

3. **Gestión de Sesión**
   - Almacenamiento en localStorage
   - Recarga de datos al iniciar app
   - Logout y limpieza de sesión

4. **Estructura de Datos**
   ```typescript
   interface UsuarioConDetalles {
     id: string;
     email: string;
     rol: string;
     detalles?: {
       id: number;
       nombre: string;
       apellido: string;
       telefono?: string;
       // Docente
       materia?: Materia;
       grados_array?: string[];
       especialidad?: string;
       // Estudiante
       grado?: string;
       seccion?: string;
     };
   }
   ```

### 9. 🔔 [Notificaciones](./MODULO-NOTIFICACIONES.md)
Sistema de notificaciones en tiempo real.
- **Servicio**: `src/services/notificationService.ts`
- **Funcionalidades**: Detección de cambios, generación automática, estadísticas

### Funcionalidades Clave

1. **Suscripción en Tiempo Real**
   - Escucha cambios en múltiples tablas
   - Filtra eventos relevantes
   - Genera notificaciones automáticamente

2. **Generación de Notificaciones**
   - Detecta tipo de cambio (INSERT, UPDATE, DELETE)
   - Determina tipo de notificación
   - Genera mensaje descriptivo
   - Asigna icono y color

3. **Estadísticas del Dashboard**
   - Calcula métricas generales
   - Agregaciones eficientes
   - Actualización periódica

4. **Tablas Monitoreadas**
   - `asistencia`: Registros nuevos
   - `calificaciones`: Calificaciones añadidas/modificadas
   - `mensajes`: Mensajes nuevos
   - `reportes`: Reportes generados
   - `clases`: Cambios en clases


## 🗂️ Módulos Adicionales

### Estudiantes
- **Componente**: `src/components/Students/StudentManagement.tsx`
- **Servicio**: `src/services/studentService.ts`
- **Funcionalidades**: Gestión completa de estudiantes, búsqueda, filtros

### Layout y Navegación
- **Layout**: `src/components/Layout/Layout.tsx`
- **Sidebar**: `src/components/Sidebar/Sidebar.tsx`
- **Funcionalidades**: Navegación, header, menú lateral

### Dashboards Específicos por Rol
- **Estudiante**: `src/components/StudentDashboard/StudentDashboard.tsx`
- **Psicólogo**: `src/components/PsychologistDashboard/PsychologistDashboard.tsx`
- **Director**: `src/components/DirectorDashboard/DirectorDashboard.tsx`

## 📖 Estructura de Documentación

Cada documento de módulo incluye:

1. **Descripción General**: Propósito y alcance del módulo
2. **Arquitectura**: Componentes y servicios utilizados
3. **Implementación Técnica**: Estados, funciones clave, flujos
4. **Estructura de Base de Datos**: Tablas y relaciones
5. **Interfaz de Usuario**: Elementos visuales y diseño
6. **Integración**: Cómo se conecta con otros módulos
7. **Optimizaciones**: Mejoras de rendimiento
8. **Notas de Implementación**: Detalles técnicos importantes
9. **Consideraciones Especiales**: Puntos a tener en cuenta

## 🔗 Enlaces Rápidos

- [Diagrama Completo del Sistema](./DIAGRAMA-SISTEMA-COMPLETO.md)
- [Configuración](./CONFIGURACION.md)
- [Recomendaciones para Push](./RECOMENDACIONES-PUSH.md)

## 📝 Notas

- Todos los módulos están documentados en español
- La documentación se actualiza con cada cambio importante
- Para más detalles, consultar el código fuente y comentarios

---

**Última actualización**: Noviembre 2025  
**Versión del sistema**: 2.0.0

