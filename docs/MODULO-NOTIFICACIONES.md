# 🔔 Módulo de Notificaciones

## 📋 Descripción General

Sistema de notificaciones en tiempo real que detecta cambios en la base de datos y genera alertas automáticas para los usuarios.

## 🎯 Propósito

- Detectar cambios en tiempo real en la BD
- Generar notificaciones automáticas
- Proporcionar estadísticas del dashboard
- Integrar con otros módulos para alertas

## 🏗️ Arquitectura

### Servicio Principal
- **Ubicación**: `src/services/notificationService.ts`
- **Tipo**: Servicio de utilidades

### Componentes que lo Usan
- **Dashboard**: `src/components/Dashboard/Dashboard.tsx`
- Otros módulos que necesiten notificaciones

## 🔧 Implementación Técnica

### Interfaces Principales
```typescript
interface Notificacion {
  id: string;
  tipo: 'info' | 'success' | 'warning' | 'error' | 'urgent';
  titulo: string;
  mensaje: string;
  icono: string;
  timestamp: Date;
  leida: boolean;
  accion?: {
    texto: string;
    link: string;
  };
  metadata?: {
    tabla: string;
    tipo_cambio: string;
    usuario?: string;
    detalles?: any;
  };
}

interface EstadisticasDashboard {
  totalEstudiantes: number;
  totalDocentes: number;
  tasaAsistencia: number;
  promedioGeneral: number;
  usuariosActivos: number;
  mensajesNoLeidos: number;
  reportesGenerados: number;
  clasesHoy: number;
}
```

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

### Flujo de Notificaciones

```
1. Cambio en BD (INSERT/UPDATE/DELETE)
   ↓
2. Supabase Realtime detecta cambio
   ↓
3. notificationService procesa evento
   ↓
4. Genera notificación con:
   - Tipo según tabla y acción
   - Mensaje descriptivo
   - Icono y color
   - Acción de navegación (opcional)
   ↓
5. Callback ejecutado con notificación
   ↓
6. Dashboard muestra notificación
```

## 🗄️ Integración con Supabase Realtime

### Suscripciones Configuradas

```typescript
// Asistencia
supabase
  .channel('asistencia_changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'asistencia'
  }, (payload) => {
    generarNotificacionAsistencia(payload.new);
  })
  .subscribe();

// Calificaciones
supabase
  .channel('calificaciones_changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'calificaciones'
  }, (payload) => {
    generarNotificacionCalificacion(payload.new);
  })
  .subscribe();

// Similar para otras tablas...
```

### Tipos de Notificaciones por Tabla

1. **Asistencia**:
   - Tipo: `success` (presente), `warning` (ausente/tarde)
   - Mensaje: "Asistencia registrada para [Estudiante]"
   - Acción: Link a módulo de asistencia

2. **Calificaciones**:
   - Tipo: `info` o `success`
   - Mensaje: "Nueva calificación: [Materia] - [Nota]"
   - Acción: Link a módulo de calificaciones

3. **Mensajes**:
   - Tipo: `info` o `urgent` (según categoría)
   - Mensaje: "Nuevo mensaje de [Remitente]"
   - Acción: Link a conversación

4. **Reportes**:
   - Tipo: `info`
   - Mensaje: "Reporte generado: [Tipo]"
   - Acción: Link a módulo de reportes

5. **Clases**:
   - Tipo: `success` (creada), `info` (modificada)
   - Mensaje: "Clase [Acción]: [Materia] - [Grado]"
   - Acción: Link a gestión de clases

## 🎨 Interfaz de Usuario

### Visualización en Dashboard

1. **Lista de Notificaciones**
   - Ordenadas por timestamp (más recientes primero)
   - Límite de 15 notificaciones visibles
   - Scroll para ver más

2. **Diseño de Notificación**
   - Color-coded por tipo
   - Icono representativo
   - Título y mensaje
   - Timestamp relativo ("Hace 5 min")
   - Botón de acción (si aplica)

3. **Estados Visuales**
   - Leída/No leída
   - Hover effect
   - Click para navegar

## 🔄 Integración con Otros Módulos

- **Dashboard**: Muestra notificaciones
- **Asistencia**: Genera notificaciones al registrar
- **Calificaciones**: Genera notificaciones al añadir
- **Mensajería**: Genera notificaciones de mensajes
- **Reportes**: Genera notificaciones al crear
- **Clases**: Genera notificaciones de cambios

## ⚡ Optimizaciones

- Límite de notificaciones en memoria
- Cleanup de suscripciones
- Generación eficiente de IDs
- Formato de tiempo relativo

## 📝 Notas de Implementación

### Función: `suscribirseACambios`

```typescript
export function suscribirseACambios(
  callback: (notificacion: Notificacion) => void
): () => void {
  // Suscripción a asistencia
  const channelAsistencia = supabase
    .channel('asistencia_changes')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'asistencia'
    }, (payload) => {
      const notif = generarNotificacionAsistencia(payload.new);
      callback(notif);
    })
    .subscribe();

  // Similar para otras tablas...

  // Retornar función de cleanup
  return () => {
    supabase.removeChannel(channelAsistencia);
    // ... remover otras suscripciones
  };
}
```

### Generación de Notificaciones

```typescript
function generarNotificacionAsistencia(registro: any): Notificacion {
  const tipo = registro.estado === 'presente' ? 'success' : 'warning';
  const icono = registro.estado === 'presente' ? '✅' : '⚠️';
  
  return {
    id: generarId(),
    tipo,
    titulo: 'Asistencia Registrada',
    mensaje: `Estudiante ${registro.estudiante_nombre}: ${registro.estado}`,
    icono,
    timestamp: new Date(),
    leida: false,
    accion: {
      texto: 'Ver Asistencia',
      link: '/attendance'
    },
    metadata: {
      tabla: 'asistencia',
      tipo_cambio: 'INSERT',
      detalles: registro
    }
  };
}
```

### Estadísticas del Dashboard

```typescript
export const getEstadisticasDashboard = async (): Promise<EstadisticasDashboard> => {
  // Consultas paralelas para eficiencia
  const [estudiantes, docentes, asistencias, calificaciones] = await Promise.all([
    contarEstudiantes(),
    contarDocentes(),
    obtenerAsistenciasUltimos30Dias(),
    obtenerCalificaciones()
  ]);

  // Calcular métricas
  const tasaAsistencia = calcularTasaAsistencia(asistencias);
  const promedioGeneral = calcularPromedio(calificaciones);

  return {
    totalEstudiantes: estudiantes,
    totalDocentes: docentes,
    tasaAsistencia,
    promedioGeneral,
    // ... otras métricas
  };
};
```

## 🚨 Consideraciones Especiales

1. **Rendimiento**:
   - Múltiples suscripciones pueden ser costosas
   - Considerar límite de notificaciones
   - Cleanup adecuado al desmontar

2. **Permisos**:
   - Solo mostrar notificaciones relevantes al usuario
   - Filtrar por rol si es necesario

3. **Persistencia**:
   - Notificaciones actuales no se persisten
   - Considerar guardar en BD si se necesita historial

4. **Configuración de Supabase**:
   - Habilitar Realtime en tablas necesarias
   - Configurar políticas RLS apropiadas

