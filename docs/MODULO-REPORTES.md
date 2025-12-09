# 📈 Módulo de Reportes

## 📋 Descripción General

Sistema para generar y gestionar reportes académicos y de asistencia, con capacidad de guardar y visualizar reportes históricos.

## 🎯 Propósito

- Generar reportes de asistencia por período
- Generar reportes académicos por grado/sección
- Guardar reportes para consulta posterior
- Visualizar estadísticas y métricas

## 🏗️ Arquitectura

### Componente Principal
- **Ubicación**: `src/components/Reports/ReportsSystem.tsx`

### Servicios Utilizados
- **`reporteService.ts`**:
  - `generarReporteAsistencia()`: Reporte de asistencia
  - `generarReporteAcademico()`: Reporte académico
  - `obtenerReportesGuardados()`: Reportes históricos

## 🔧 Implementación Técnica

### Estados Principales
```typescript
- reporteGenerado: any
- reportesGuardados: ReporteGenerado[]
- mostrandoReporte: boolean
- formData: {
    tipo: 'asistencia' | 'academico'
    grado: string
    seccion: string
    fechaInicio: string
    fechaFin: string
  }
```

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

### Flujo de Datos

```
1. Usuario completa formulario
   ↓
2. Selecciona tipo de reporte
   ↓
3. Generar reporte:
   - Consultar datos según tipo
   - Calcular estadísticas
   - Formatear resultados
   ↓
4. Mostrar reporte generado
   ↓
5. Opcional: Guardar reporte
```

## 🗄️ Estructura de Base de Datos

### Tabla: `reportes` (si se guardan)
```sql
- id: BIGINT
- tipo: TEXT ('asistencia' | 'academico')
- docente_id: BIGINT
- grado: TEXT [opcional]
- seccion: TEXT [opcional]
- fecha_inicio: DATE [opcional]
- fecha_fin: DATE [opcional]
- datos: JSONB (datos del reporte)
- created_at: TIMESTAMP
```

### Consultas Utilizadas

```sql
-- Reporte de Asistencia
SELECT 
  estudiante_id,
  COUNT(*) FILTER (WHERE estado = 'presente') as presentes,
  COUNT(*) FILTER (WHERE estado = 'ausente') as ausentes,
  COUNT(*) as total_dias
FROM asistencia
WHERE fecha BETWEEN :fechaInicio AND :fechaFin
  AND (:grado IS NULL OR estudiante_id IN (
    SELECT id FROM Estudiantes WHERE grado = :grado
  ))
GROUP BY estudiante_id;

-- Reporte Académico
SELECT 
  estudiante_id,
  AVG(calificacion) as promedio,
  COUNT(*) as total_calificaciones
FROM calificaciones
WHERE (:grado IS NULL OR estudiante_id IN (
  SELECT id FROM Estudiantes WHERE grado = :grado
))
GROUP BY estudiante_id;
```

## 🎨 Interfaz de Usuario

### Elementos Visuales

1. **Formulario de Generación**
   - Selector de tipo de reporte
   - Campos de filtros
   - Botón "Generar Reporte"

2. **Visualización de Reporte**
   - Estadísticas generales (tarjetas)
   - Tabla de estudiantes
   - Gráficos (si aplica)
   - Botón "Guardar Reporte"

3. **Lista de Reportes Guardados**
   - Tarjetas con información
   - Fecha de generación
   - Tipo y filtros aplicados
   - Botón "Ver Reporte"

## 🔄 Integración con Otros Módulos

- **Asistencia**: Datos para reporte de asistencia
- **Calificaciones**: Datos para reporte académico
- **Estudiantes**: Información de estudiantes
- **Dashboard**: Notificaciones de reportes generados

## ⚡ Optimizaciones

- Cálculo de estadísticas en base de datos
- Agregaciones eficientes con SQL
- Cacheo de reportes guardados
- Lazy loading de datos históricos

## 📝 Notas de Implementación

### Tipos de Reportes

1. **Reporte de Asistencia**:
   - Requiere rango de fechas
   - Filtros opcionales: grado, sección
   - Calcula porcentajes y tendencias

2. **Reporte Académico**:
   - Filtros: grado, sección
   - Calcula promedios y distribuciones
   - Identifica estudiantes destacados

### Cálculo de Estadísticas

```typescript
// Ejemplo: Porcentaje de asistencia
const porcentajeAsistencia = (presentes / totalDias) * 100;

// Ejemplo: Promedio académico
const promedio = calificaciones.reduce((sum, c) => sum + c.valor, 0) / calificaciones.length;
```

### Formato de Datos

- Los reportes se estructuran como objetos JSON
- Incluyen metadatos (fecha, filtros, tipo)
- Se pueden serializar para guardar

## 🚨 Consideraciones Especiales

1. **Rendimiento**:
   - Reportes pueden ser costosos con muchos datos
   - Considerar paginación o límites
   - Índices en BD para consultas

2. **Almacenamiento**:
   - Reportes guardados ocupan espacio
   - Considerar límite de tiempo (ej: 1 año)
   - Compresión de datos JSON

3. **Permisos**:
   - Solo docentes pueden generar reportes
   - Reportes asociados al docente que los crea

4. **Exportación**:
   - Considerar exportar a PDF/Excel
   - Formato imprimible

