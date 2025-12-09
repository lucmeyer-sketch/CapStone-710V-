# 🔐 Módulo de Autenticación

## 📋 Descripción General

Sistema de autenticación y gestión de usuarios que maneja el login, registro, y obtención de información detallada del usuario según su rol.

## 🎯 Propósito

- Autenticar usuarios con email y contraseña
- Obtener información completa del usuario según su rol
- Gestionar sesiones de usuario
- Proporcionar datos del usuario a otros módulos

## 🏗️ Arquitectura

### Componentes Principales
- **Login**: `src/components/Login/Login.tsx`
- **Auth Service**: `src/services/authService.ts`
- **App Principal**: `src/App.tsx` (maneja estado de usuario)

### Servicios Utilizados
- **Supabase Auth**: Autenticación
- **Supabase Client**: Consultas a BD para detalles de usuario

## 🔧 Implementación Técnica

### Estados Principales (App.tsx)
```typescript
- usuario: UsuarioConDetalles | null
- loading: boolean
```

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

### Flujo de Autenticación

```
1. Usuario ingresa email y contraseña
   ↓
2. Supabase Auth valida credenciales
   ↓
3. Si exitoso:
   - Obtener ID del usuario autenticado
   - Consultar tabla según rol
   - Combinar datos
   - Guardar en estado y localStorage
   ↓
4. Redirigir a Dashboard
   ↓
5. Si error:
   - Mostrar mensaje de error
   - Mantener en pantalla de login
```

## 🗄️ Estructura de Base de Datos

### Tabla: `usuarios`
```sql
- id: UUID (de Supabase Auth)
- email: TEXT (único)
- rol: TEXT ('docente' | 'estudiante' | 'director' | 'psychologist')
- activo: BOOLEAN
- created_at: TIMESTAMP
```

### Relaciones

**Docente**:
```sql
docentes.usuario_id → usuarios.id
docentes.materia_id → materias.id
```

**Estudiante**:
```sql
Estudiantes.usuario_id → usuarios.id
```

### Consultas Utilizadas

```sql
-- Obtener docente por usuario_id
SELECT d.*, m.nombre as materia_nombre, m.codigo as materia_codigo
FROM docentes d
LEFT JOIN materias m ON d.materia_id = m.id
WHERE d.usuario_id = :usuarioId;

-- Obtener estudiante por usuario_id
SELECT *
FROM Estudiantes
WHERE usuario_id = :usuarioId;
```

## 🎨 Interfaz de Usuario

### Pantalla de Login

1. **Formulario**
   - Campo email
   - Campo contraseña
   - Botón "Iniciar Sesión"
   - Mensajes de error

2. **Validación Visual**
   - Campos requeridos
   - Formato de email
   - Feedback de errores

3. **Estados de Carga**
   - Loading durante autenticación
   - Deshabilitar botón mientras procesa

## 🔄 Integración con Otros Módulos

- **Dashboard**: Usa datos del usuario
- **Mensajería**: Identifica remitente/destinatario
- **Configuración**: Muestra y edita perfil
- **Gestión de Clases**: Filtra por docente actual
- **Sidebar**: Muestra opciones según rol

## ⚡ Optimizaciones

- Cacheo de datos en localStorage
- Recarga de datos al iniciar app
- Consultas eficientes con JOINs
- Validación frontend antes de enviar

## 📝 Notas de Implementación

### Función Principal: `getUsuarioById`

```typescript
export async function getUsuarioById(usuarioId: string): Promise<UsuarioConDetalles> {
  // 1. Obtener usuario base
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', usuarioId)
    .single();

  // 2. Obtener detalles según rol
  if (usuario.rol === 'docente') {
    const { data: docente } = await supabase
      .from('docentes')
      .select('*, materia:materias(*)')
      .eq('usuario_id', usuarioId)
      .single();
    
    // Parsear grados_asignados
    const grados_array = docente?.grados_asignados?.split(',') || [];
    
    return {
      ...usuario,
      detalles: {
        ...docente,
        grados_array,
        materia: docente.materia
      }
    };
  }
  
  // Similar para estudiante...
}
```

### Gestión de Sesión

```typescript
// Guardar en localStorage
localStorage.setItem('usuario', JSON.stringify(usuario));

// Cargar al iniciar app
const usuarioGuardado = localStorage.getItem('usuario');
if (usuarioGuardado) {
  const usuario = JSON.parse(usuarioGuardado);
  // Recargar datos frescos de BD
  const usuarioActualizado = await getUsuarioById(usuario.id);
  setUsuario(usuarioActualizado);
}
```

## 🚨 Consideraciones Especiales

1. **Seguridad**:
   - Contraseñas nunca se almacenan en texto plano
   - Supabase Auth maneja encriptación
   - Tokens JWT para sesiones

2. **Datos Sensibles**:
   - Email único y no editable desde perfil
   - ID de usuario es UUID seguro

3. **Relaciones Polimórficas**:
   - Un usuario puede ser docente O estudiante
   - Se consulta según `rol`

4. **Actualización de Datos**:
   - Datos en localStorage pueden quedar obsoletos
   - Siempre recargar desde BD al iniciar
   - Actualizar localStorage después de cambios

5. **Múltiples Roles**:
   - Un usuario tiene un solo rol
   - El rol determina qué datos se cargan
   - El rol determina permisos y UI

