# ⚙️ Módulo de Configuración

## 📋 Descripción General

Panel de configuración de perfil donde los usuarios pueden ver y editar su información personal, académica y de seguridad.

## 🎯 Propósito

- Visualizar información completa del perfil
- Editar datos personales
- Cambiar contraseña
- Ver información específica por rol (materia, grados asignados)

## 🏗️ Arquitectura

### Componente Principal
- **Ubicación**: `src/components/Settings/ProfileSettings.tsx`
- **Props**: `usuario: UsuarioConDetalles`

### Servicios Utilizados
- **`authService.ts`**:
  - `actualizarPerfil()`: Actualizar datos del perfil
  - `cambiarContraseña()`: Cambiar contraseña del usuario

## 🔧 Implementación Técnica

### Estados Principales
```typescript
- editando: boolean
- editandoPassword: boolean
- formData: {
    nombre: string
    apellido: string
    telefono: string
    // ... otros campos
  }
- passwordData: {
    actual: string
    nueva: string
    confirmar: string
  }
```

### Funcionalidades Clave

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

### Flujo de Datos

```
1. Cargar datos del usuario desde props
   ↓
2. Mostrar información en modo lectura
   ↓
3. Usuario hace clic en "Editar"
   ↓
4. Mostrar formulario de edición
   ↓
5. Usuario guarda cambios:
   - Validar datos
   - Actualizar en BD
   - Actualizar estado local
   - Mostrar confirmación
```

## 🗄️ Estructura de Base de Datos

### Tablas Relacionadas

**`usuarios`**:
```sql
- id: BIGINT
- email: TEXT
- rol: TEXT
- created_at: TIMESTAMP
```

**`docentes`** (si es docente):
```sql
- id: BIGINT
- nombre: TEXT
- apellido: TEXT
- telefono: TEXT
- especialidad: TEXT
- materia_id: BIGINT
- grados_asignados: TEXT
- usuario_id: BIGINT
```

**`Estudiantes`** (si es estudiante):
```sql
- id: BIGINT
- nombre: TEXT
- apellido: TEXT
- telefono: TEXT
- grado: TEXT
- seccion: TEXT
- usuario_id: BIGINT
```

## 🎨 Interfaz de Usuario

### Elementos Visuales

1. **Header del Perfil**
   - Avatar con iniciales
   - Nombre completo
   - Badge de rol con gradiente
   - Email y teléfono

2. **Información Personal**
   - Tarjetas con iconos
   - Diseño moderno con gradientes
   - Información organizada

3. **Información Académica/Profesional**
   - Específica por rol
   - Tarjetas informativas
   - Datos calculados (promedios, etc.)

4. **Sección de Seguridad**
   - Información de cuenta
   - Botón "Cambiar Contraseña"
   - Formulario de cambio de contraseña

5. **Botones de Acción**
   - "Editar Perfil"
   - "Guardar Cambios"
   - "Cancelar"
   - "Cerrar Sesión"

## 🔄 Integración con Otros Módulos

- **Autenticación**: Actualización de datos de usuario
- **Dashboard**: Información del usuario actual
- **Gestión de Clases**: Muestra materia y grados (docente)

## ⚡ Optimizaciones

- Validación frontend antes de enviar
- Actualización optimista de UI
- Mensajes de error claros
- Confirmación de acciones importantes

## 📝 Notas de Implementación

### Validaciones

1. **Campos Requeridos**:
   - Nombre y apellido
   - Email (no editable, único)

2. **Validación de Contraseña**:
   - Contraseña actual debe ser correcta
   - Nueva contraseña: mínimo 6 caracteres
   - Confirmación debe coincidir

3. **Formato de Datos**:
   - Teléfono: formato opcional
   - Email: validación de formato

### Información por Rol

```typescript
// Docente
if (usuario.rol === 'docente') {
  mostrar: materia_asignada, grados_asignados, especialidad
}

// Estudiante
if (usuario.rol === 'estudiante') {
  mostrar: grado, seccion, promedio, asistencia
}
```

### Actualización de Perfil

```typescript
// Actualizar tabla correspondiente según rol
if (rol === 'docente') {
  await actualizarDocente(docenteId, datos);
} else if (rol === 'estudiante') {
  await actualizarEstudiante(estudianteId, datos);
}
```

## 🚨 Consideraciones Especiales

1. **Seguridad**:
   - Contraseña nunca se muestra
   - Validación en frontend y backend
   - Uso de Supabase Auth para cambio de contraseña

2. **Datos Sensibles**:
   - Email no editable (debe cambiarse desde auth)
   - ID de usuario solo lectura

3. **Información Calculada**:
   - Promedios y estadísticas se calculan en tiempo real
   - Puede ser costoso con muchos datos

4. **Sincronización**:
   - Cambios se reflejan inmediatamente
   - Actualización en localStorage si aplica

