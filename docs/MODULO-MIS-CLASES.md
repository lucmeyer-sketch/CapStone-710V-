# 📚 Módulo Mis Clases

## 📋 Descripción General

Vista dedicada para que los docentes visualicen todas sus clases asignadas con detalles completos, incluyendo estudiantes inscritos y estadísticas.

## 🎯 Propósito

- Mostrar todas las clases del docente de forma organizada
- Ver detalles de cada clase (horario, aula, estudiantes)
- Visualizar estadísticas por clase (asistencia, calificaciones)
- Navegar a otras funcionalidades relacionadas

## 🏗️ Arquitectura

### Componente Principal
- **Ubicación**: `src/components/Classes/MyClasses.tsx`
- **Props**: 
  - `docenteId: number`
  - `docenteNombre: string`

### Servicios Utilizados
- **Supabase Client**: Consultas directas
- **Tablas**: `clases`, `materias`, `inscripciones`, `Estudiantes`

## 🔧 Implementación Técnica

### Estados Principales
```typescript
- clases: ClaseConDetalles[]
- claseSeleccionada: ClaseConDetalles | null
- loading: boolean
- error: string | null
```

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

### Flujo de Datos

```
1. Componente recibe docenteId
   ↓
2. Cargar clases del docente
   - Filtrar por docente_id
   - Filtrar por estado = 'activo'
   - Incluir información de materia
   ↓
3. Usuario selecciona clase
   ↓
4. Cargar estudiantes inscritos
   - Consultar tabla inscripciones
   - Obtener detalles de estudiantes
   ↓
5. Calcular estadísticas
   - Asistencia promedio
   - Calificaciones promedio
```

## 🗄️ Estructura de Base de Datos

### Consultas Utilizadas

```sql
-- Obtener clases del docente
SELECT clases.*, materias.nombre, materias.codigo
FROM clases
JOIN materias ON clases.materia_id = materias.id
WHERE clases.docente_id = :docenteId
  AND clases.estado = 'activo'
ORDER BY clases.grado;

-- Obtener estudiantes inscritos
SELECT Estudiantes.*
FROM Estudiantes
JOIN inscripciones ON Estudiantes.id = inscripciones.estudiante_id
WHERE inscripciones.clase_id = :claseId;
```

## 🎨 Interfaz de Usuario

### Elementos Visuales

1. **Resumen General**
   - Tarjetas con métricas:
     - Total de clases
     - Clases activas
     - Total de estudiantes

2. **Lista de Clases**
   - Diseño tipo card
   - Información visible:
     - Materia y código
     - Grado y sección
     - Horario y aula
     - Total de estudiantes
   - Botón de acción

3. **Panel de Detalles**
   - Información completa de la clase
   - Lista de estudiantes con datos
   - Estadísticas calculadas
   - Botón para cerrar

## 🔄 Integración con Otros Módulos

- **Gestión de Clases**: Misma fuente de datos
- **Asistencia**: Puede navegar desde aquí
- **Calificaciones**: Puede navegar desde aquí
- **Dashboard**: Estadísticas relacionadas

## ⚡ Optimizaciones

- Carga lazy de estudiantes (solo al seleccionar)
- Cálculo de estadísticas bajo demanda
- Ordenamiento eficiente por grado
- Filtrado en base de datos

## 📝 Notas de Implementación

- Solo muestra clases activas
- Las estadísticas se calculan en tiempo real
- La información de materia se obtiene mediante JOIN
- Los estudiantes se cargan bajo demanda

## 🚨 Consideraciones Especiales

1. **Relación con Docente**:
   - No hay FK directa en Supabase
   - Se filtra por `docente_id` directamente

2. **Cálculo de Estadísticas**:
   - Se realiza con consultas agregadas
   - Puede ser costoso con muchos datos
   - Considerar cachear si es necesario

3. **Rendimiento**:
   - Carga inicial solo de clases
   - Estudiantes se cargan al expandir
   - Reduce carga inicial

