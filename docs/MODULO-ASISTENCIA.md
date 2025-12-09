# 🏫 Módulo de Asistencia

## 📋 Descripción General

Sistema para registrar y gestionar la asistencia de estudiantes a clases, con soporte para múltiples estados y observaciones.

## 🎯 Propósito

- Registrar asistencia diaria de estudiantes
- Gestionar diferentes estados (presente, ausente, tarde, justificado)
- Ver historial de asistencia
- Calcular estadísticas de asistencia

## 🏗️ Arquitectura

### Componente Principal
- **Ubicación**: `src/components/Attendance/AttendanceSystem.tsx`

### Servicios Utilizados
- **`studentService.ts`**: `getAllStudents()` - Obtener lista de estudiantes
- **`asistenciaService.ts`**:
  - `getAsistenciaByFecha()`: Obtener asistencias de una fecha
  - `upsertAsistencia()`: Crear o actualizar registro de asistencia

## 🔧 Implementación Técnica

### Estados Principales
```typescript
- students: Student[]
- attendanceRecords: AsistenciaConDetalles[]
- selectedDate: string (YYYY-MM-DD)
- formData: {
    date: string
    studentId: string | number
    status: 'presente' | 'ausente' | 'tarde' | 'justificado'
    notes: string
  }
```

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

### Flujo de Datos

```
1. Cargar estudiantes al montar
   ↓
2. Seleccionar fecha → cargar asistencias de esa fecha
   ↓
3. Registrar asistencia:
   - Validar datos
   - Upsert en BD
   - Recargar lista
   ↓
4. Mostrar estadísticas calculadas
```

## 🗄️ Estructura de Base de Datos

### Tabla: `asistencia`
```sql
- id: BIGINT
- estudiante_id: BIGINT (FK → Estudiantes.id)
- clase_id: BIGINT (FK → clases.id) [opcional]
- fecha: DATE
- estado: TEXT ('presente' | 'ausente' | 'tarde' | 'justificado')
- observaciones: TEXT [opcional]
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Índices Recomendados
```sql
CREATE INDEX idx_asistencia_fecha ON asistencia(fecha);
CREATE INDEX idx_asistencia_estudiante ON asistencia(estudiante_id);
```

## 🎨 Interfaz de Usuario

### Elementos Visuales

1. **Selector de Fecha**
   - Input tipo date
   - Por defecto: fecha actual
   - Cambio automático carga datos

2. **Formulario de Registro**
   - Selector de estudiante
   - Radio buttons para estado
   - Campo de observaciones
   - Botón de envío

3. **Lista de Asistencias**
   - Tarjetas por estudiante
   - Color-coded por estado:
     - Verde: Presente
     - Rojo: Ausente
     - Amarillo: Tarde
     - Azul: Justificado
   - Iconos representativos

4. **Estadísticas**
   - Tarjetas con métricas
   - Porcentajes calculados
   - Actualización en tiempo real

## 🔄 Integración con Otros Módulos

- **Dashboard**: Notificaciones de registros nuevos
- **Estudiantes**: Lista de estudiantes
- **Reportes**: Generación de reportes de asistencia
- **Clases**: Asociación opcional con clases

## ⚡ Optimizaciones

- Carga de asistencias solo al cambiar fecha
- Upsert evita duplicados
- Cálculo eficiente de estadísticas
- Filtrado en base de datos

## 📝 Notas de Implementación

### Estados de Asistencia

1. **Presente**: Estudiante asistió normalmente
2. **Ausente**: Estudiante no asistió
3. **Tarde**: Estudiante llegó tarde
4. **Justificado**: Ausencia justificada

### Upsert Logic

```typescript
// Si existe registro para estudiante + fecha → actualiza
// Si no existe → crea nuevo
await upsertAsistencia({
  estudiante_id,
  fecha,
  estado,
  observaciones
});
```

### Cálculo de Estadísticas

```typescript
const presentes = records.filter(r => r.estado === 'presente').length;
const ausentes = records.filter(r => r.estado === 'ausente').length;
const tardanzas = records.filter(r => r.estado === 'tarde').length;
const justificados = records.filter(r => r.estado === 'justificado').length;
```

## 🚨 Consideraciones Especiales

1. **Asociación con Clases**:
   - `clase_id` es opcional
   - Permite registro general o por clase

2. **Duplicados**:
   - Upsert previene duplicados por (estudiante_id, fecha)
   - Considerar constraint único en BD

3. **Historial**:
   - Se puede expandir para mostrar calendario
   - Filtros por rango de fechas

4. **Notificaciones**:
   - Se generan automáticamente al registrar
   - Aparecen en Dashboard en tiempo real

