# 📊 Módulo de Notas del Estudiante

## 📋 Descripción General

Módulo dedicado para que los estudiantes puedan consultar sus calificaciones y asistencia por clase. Incluye un selector de clases, vista detallada de calificaciones y un calendario semanal de asistencia.

## 🎯 Propósito

- Permitir a los estudiantes ver sus clases asociadas
- Mostrar calificaciones detalladas por clase
- Visualizar asistencia semanal en formato calendario
- Calcular y mostrar promedios por clase

## 🏗️ Arquitectura

### Componente Principal
- **Ubicación**: `src/components/StudentGrades/StudentGrades.tsx`
- **Props**: Ninguna (obtiene el estudiante desde localStorage)

### Servicios Utilizados
- `studentService.getClasesByEstudiante()`: Obtiene clases del estudiante desde inscripciones
- `calificacionService.getCalificacionesByEstudiante()`: Obtiene todas las calificaciones del estudiante
- `calificacionService.getPromedioEstudianteClase()`: Calcula el promedio del estudiante en una clase
- `asistenciaService.getAsistenciaByEstudiante()`: Obtiene todas las asistencias del estudiante

### Tablas de Base de Datos
- `inscripciones`: Relación entre estudiantes y clases
- `clases`: Información de las clases
- `calificaciones`: Notas y evaluaciones
- `asistencia`: Registros de asistencia

## 🔧 Implementación Técnica

### Estados Principales
```typescript
- clases: ClaseConDetalles[]
- claseSeleccionada: ClaseConDetalles | null
- calificaciones: CalificacionConDetalles[]
- asistencias: Asistencia[]
- promedio: number
- semanaActual: Date
- estudianteId: number | null
```

### Funcionalidades Clave

1. **Carga de Clases**
   - Obtiene el ID del estudiante desde localStorage
   - Consulta inscripciones activas
   - Incluye información de materia y docente
   - Muestra clases en formato de tarjetas seleccionables

2. **Vista de Calificaciones**
   - Filtra calificaciones por clase seleccionada
   - Muestra tipo de evaluación, fecha, ponderación
   - Color-coded según nota (verde ≥6.0, amarillo ≥4.0, rojo <4.0)
   - Calcula y muestra promedio de la clase

3. **Calendario Semanal de Asistencia**
   - Navegación entre semanas (anterior, siguiente, hoy)
   - Muestra 7 días de la semana
   - Color-coded por estado:
     - Verde: Presente
     - Amarillo: Tarde
     - Rojo: Ausente
     - Azul: Justificado
     - Gris: Sin registro
   - Filtra asistencias por clase seleccionada

### Flujo de Datos

```
1. Componente se monta
   ↓
2. Obtener estudianteId desde localStorage
   ↓
3. Cargar clases del estudiante (desde inscripciones)
   ↓
4. Usuario selecciona una clase
   ↓
5. Cargar datos de la clase:
   - Calificaciones filtradas por clase_id
   - Promedio calculado
   - Asistencias filtradas por clase_id
   ↓
6. Mostrar información en la interfaz
```

## 🎨 Interfaz de Usuario

### Elementos Visuales

1. **Selector de Clases**
   - Grid de tarjetas con información de cada clase
   - Tarjeta seleccionada resaltada con borde púrpura
   - Hover effect para mejor UX
   - Muestra: materia, grado/sección, docente

2. **Información de la Clase**
   - Header con nombre de materia
   - Detalles: grado, sección, horario, aula
   - Tarjeta de promedio destacada

3. **Lista de Calificaciones**
   - Tarjetas individuales por evaluación
   - Información completa: nombre, tipo, fecha, ponderación
   - Nota destacada con color según rendimiento

4. **Calendario Semanal**
   - Grid de 7 días
   - Día actual resaltado en amarillo
   - Iconos y colores según estado de asistencia
   - Controles de navegación (anterior, hoy, siguiente)
   - Leyenda de estados

## 🗄️ Estructura de Base de Datos

### Consultas Utilizadas

```sql
-- Obtener clases del estudiante
SELECT i.*, c.*, m.*, d.*
FROM inscripciones i
JOIN clases c ON i.clase_id = c.id
JOIN materias m ON c.materia_id = m.id
JOIN docentes d ON c.docente_id = d.id
WHERE i.estudiante_id = ? AND i.estado = 'activo'

-- Obtener calificaciones del estudiante
SELECT *
FROM calificaciones
WHERE estudiante_id = ? AND clase_id = ?

-- Obtener asistencias del estudiante
SELECT *
FROM asistencia
WHERE estudiante_id = ? AND clase_id = ?
```

## 📝 Scripts SQL para Poblar Datos

### Archivo: `poblar-calificaciones-asistencias.sql`

Este script genera datos de prueba para:
- **Calificaciones**: Entre 5-10 evaluaciones por estudiante/clase
- **Asistencias**: Últimas 8 semanas de asistencia

#### Características:
- Genera diferentes tipos de evaluaciones (examen, tarea, proyecto, participación, quiz)
- Distribución realista de notas (70% entre 4.0-7.0, 20% entre 3.0-4.0, 10% entre 1.0-3.0)
- Asistencias distribuidas en días de clase según horario
- Estados de asistencia variados (presente, tarde, ausente, justificado)

#### Uso:
```sql
-- Ejecutar en Supabase SQL Editor
\i poblar-calificaciones-asistencias.sql
```

#### Notas Importantes:
- Requiere que existan estudiantes, clases e inscripciones
- El constraint de asistencia es `(estudiante_id, fecha)`, no incluye `clase_id`
- Si un estudiante tiene múltiples clases el mismo día, solo se guardará un registro

## 🔄 Integración con Otros Módulos

- **Dashboard**: Los estudiantes pueden acceder desde el menú lateral
- **Inscripciones**: Depende de inscripciones activas para mostrar clases
- **Calificaciones**: Muestra datos ingresados por docentes
- **Asistencia**: Muestra registros creados por docentes

## ⚡ Optimizaciones

- Carga de datos solo cuando se selecciona una clase
- Filtrado de calificaciones y asistencias en el frontend
- Cálculo de promedio usando servicio dedicado
- Navegación eficiente entre semanas

## 🚨 Consideraciones Especiales

1. **Constraint de Asistencia**:
   - El constraint actual es `(estudiante_id, fecha)`
   - Si un estudiante tiene múltiples clases el mismo día, solo habrá un registro
   - El componente filtra por `clase_id` para mostrar solo asistencias relevantes

2. **Identificación del Estudiante**:
   - Se obtiene desde `localStorage.getItem('usuario')`
   - Requiere que el usuario esté autenticado
   - Si no se encuentra, no se cargarán datos

3. **Promedio**:
   - Se calcula usando ponderación de cada evaluación
   - Si no hay calificaciones, muestra "--"

## 📱 Responsive Design

- Grid de clases adaptativo (mínimo 280px por tarjeta)
- Calendario semanal en grid de 7 columnas
- Diseño optimizado para desktop y tablet

## 🎯 Próximas Mejoras

- [ ] Exportar calificaciones a PDF
- [ ] Gráficos de rendimiento
- [ ] Comparación con promedio del curso
- [ ] Notificaciones de nuevas calificaciones
- [ ] Filtros por período académico

