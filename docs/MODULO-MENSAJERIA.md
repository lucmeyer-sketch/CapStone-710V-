n# 💬 Módulo de Mensajería

## 📋 Descripción General

Sistema de mensajería bidireccional entre docentes y estudiantes, con conversaciones privadas y categorización de mensajes.

## 🎯 Propósito

- Permitir comunicación privada entre docentes y estudiantes
- Categorizar mensajes (General, Urgente, Académico, Conductual, Felicitación)
- Proporcionar interfaz estilo WhatsApp Web
- Gestionar conversaciones separadas por estudiante/docente

## 🏗️ Arquitectura

### Componente Principal
- **Ubicación**: `src/components/Messages/MessagingSystem.tsx`
- **Props**: `usuarioActual: UsuarioConDetalles`

### Servicios Utilizados
- **`mensajeService.ts`**:
  - `crearMensaje()`: Crear nuevo mensaje
  - `getConversaciones()`: Obtener conversaciones del docente
  - `getConversacionesEstudiante()`: Obtener conversaciones del estudiante
  - `getMensajesConversacionPrivada()`: Obtener mensajes de una conversación
  - `marcarConversacionLeida()`: Marcar mensajes como leídos
  - `getEstadisticasMensajes()`: Estadísticas de mensajes

## 🔧 Implementación Técnica

### Estados Principales
```typescript
- conversaciones: Conversacion[] (docente)
- conversacionesEstudiante: ConversacionEstudiante[] (estudiante)
- conversacionActiva: number | null
- mensajesActivos: MensajeConDetalles[]
- estudiantes: Estudiante[]
- mostrarNuevoMensaje: boolean
- mostrarRespuesta: boolean (estudiante)
- mensajeAResponder: MensajeConDetalles | null
```

### Funcionalidades Clave

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

### Flujo de Datos

```
DOCENTE:
1. Cargar conversaciones (agrupadas por estudiante)
2. Seleccionar conversación → cargar mensajes
3. Enviar mensaje → actualizar lista
4. Marcar como leído

ESTUDIANTE:
1. Cargar conversaciones (agrupadas por docente)
2. Seleccionar conversación → cargar mensajes
3. Responder mensaje → enviar respuesta
4. Ver mensajes orientados correctamente
```

## 🗄️ Estructura de Base de Datos

### Tabla: `mensajes`
```sql
- id: BIGINT
- remitente_id: BIGINT (polimórfico: puede ser docente o estudiante)
- remitente_tipo: 'docente' | 'estudiante'
- destinatario_id: BIGINT
- destinatario_tipo: 'docente' | 'estudiante' | 'tutor'
- asunto: TEXT
- mensaje: TEXT
- tipo: 'general' | 'urgente' | 'academico' | 'conductual' | 'felicitacion'
- categoria: TEXT
- leido: BOOLEAN
- created_at: TIMESTAMP
```

### Relaciones Polimórficas
- `remitente_id` puede referenciar `docentes.id` o `Estudiantes.id`
- Se resuelve manualmente en el frontend (no hay FK directa)

## 🎨 Interfaz de Usuario

### Elementos Visuales

1. **Panel de Conversaciones**
   - Lista de conversaciones con preview
   - Badge de mensajes no leídos
   - Búsqueda de conversaciones
   - Botón "Nuevo Mensaje" (solo docentes)

2. **Área de Chat**
   - Burbujas de mensajes orientadas
   - Timestamps formateados
   - Estados de lectura (✓✓)
   - Categorías con colores

3. **Formulario de Mensaje**
   - Selección de estudiante (docente)
   - Categoría del mensaje
   - Asunto y contenido
   - Respuestas rápidas predefinidas

4. **Formulario de Respuesta (Estudiante)**
   - Asunto pre-llenado
   - Campo de respuesta
   - Botón enviar

## 🔄 Integración con Otros Módulos

- **Dashboard**: Notificaciones de mensajes nuevos
- **Estudiantes**: Selección de destinatarios
- **Notificaciones**: Alertas en tiempo real

## ⚡ Optimizaciones

- Scroll automático al final del chat
- Carga lazy de mensajes
- Agrupación eficiente de conversaciones
- Resolución manual de relaciones polimórficas

## 📝 Notas de Implementación

- Los estudiantes NO pueden iniciar conversaciones
- Los mensajes se orientan según `remitente_id` vs `usuarioId`
- El asunto se genera automáticamente para respuestas
- Las conversaciones son completamente privadas
- Soporte para múltiples categorías de mensajes

## 🚨 Consideraciones Especiales

1. **Relaciones Polimórficas**: 
   - No hay FK directa entre `mensajes.remitente_id` y tablas
   - Se resuelve con consultas separadas y combinación en JS

2. **Permisos**:
   - Estudiantes: Solo lectura y respuesta
   - Docentes: Lectura, escritura y creación

3. **Validación**:
   - Check constraint en BD para `remitente_tipo`
   - Validación frontend antes de enviar

