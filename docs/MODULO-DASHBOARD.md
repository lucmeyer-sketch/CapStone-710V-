# 📊 Módulo Dashboard

## 📋 Descripción General

El Dashboard es el panel principal del sistema que proporciona una vista general de estadísticas y notificaciones en tiempo real para todos los usuarios del sistema.

## 🎯 Propósito

- Mostrar estadísticas generales del sistema
- Proporcionar notificaciones en tiempo real de cambios en la base de datos
- Permitir navegación rápida a otros módulos
- Visualizar métricas clave de rendimiento académico

## 🏗️ Arquitectura

### Componente Principal
- **Ubicación**: `src/components/Dashboard/Dashboard.tsx`
- **Tipo**: Componente funcional con hooks de React

### Servicios Utilizados
- **`notificationService.ts`**: 
  - `getEstadisticasDashboard()`: Obtiene estadísticas generales
  - `getNotificacionesRecientes()`: Carga notificaciones históricas
  - `suscribirseACambios()`: Suscripción en tiempo real a cambios

## 🔧 Implementación Técnica

### Estados Principales
```typescript
- estadisticas: EstadisticasDashboard
- notificaciones: Notificacion[]
- loading: boolean
- error: string | null
```

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

### Flujo de Datos

```
1. Componente se monta
   ↓
2. useEffect ejecuta cargarDatos()
   ↓
3. Carga paralela:
   - Estadísticas del dashboard
   - Notificaciones recientes
   ↓
4. Suscripción a cambios en tiempo real
   ↓
5. Cuando hay cambio:
   - Nueva notificación agregada
   - Estadísticas recargadas (si aplica)
```

## 🎨 Interfaz de Usuario

### Elementos Visuales

1. **Tarjetas de Estadísticas**
   - Diseño con gradientes
   - Iconos representativos
   - Valores numéricos destacados
   - Click para navegar a módulos relacionados

2. **Lista de Notificaciones**
   - Color-coded por tipo
   - Iconos descriptivos
   - Timestamp relativo
   - Click para navegar a la acción relacionada

3. **Indicadores Visuales**
   - Badges de estado
   - Animaciones suaves
   - Efectos hover interactivos

## 🔄 Integración con Otros Módulos

- **Asistencia**: Notifica registros nuevos
- **Calificaciones**: Notifica calificaciones añadidas/modificadas
- **Mensajería**: Notifica mensajes nuevos
- **Reportes**: Notifica reportes generados
- **Clases**: Notifica cambios en clases

## ⚡ Optimizaciones

- Carga paralela de datos con `Promise.all()`
- Límite de notificaciones para rendimiento
- Recarga selectiva de estadísticas
- Cleanup de suscripciones al desmontar

## 📝 Notas de Implementación

- Las notificaciones se generan automáticamente desde `notificationService`
- El formato de tiempo se calcula relativamente
- Las estadísticas se calculan en tiempo real desde la BD
- Soporte para múltiples roles (docente, estudiante, etc.)

