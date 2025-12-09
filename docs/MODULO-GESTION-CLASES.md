# 🏛️ Módulo de Gestión de Clases

## 📋 Descripción General

Panel de administración consolidado donde los docentes pueden gestionar sus clases asignadas, incluyendo creación, edición, y gestión de inscripciones de estudiantes.

## 🎯 Propósito

- Crear y gestionar clases asociadas a la materia del docente
- Inscribir/remover estudiantes de clases
- Editar detalles de clases (excepto sección)
- Filtrar estudiantes por grado y sección de la clase
- Aplicar restricciones basadas en materia y grados asignados del docente

## 🏗️ Arquitectura

### Componente Principal
- **Ubicación**: `src/components/Administration/AdminPanel.tsx`
- **Props**: `docenteActual: UsuarioConDetalles`

### Servicios Utilizados
- **Supabase Client**: Consultas directas a la BD
- **Tablas**: `clases`, `materias`, `docentes`, `Estudiantes`, `inscripciones`

## 🔧 Implementación Técnica

### Estados Principales
```typescript
- clases: ClaseCompleta[]
- materias: Materia[]
- estudiantes: Estudiante[]
- modalInscripcion: { abierto: boolean, clase: ClaseCompleta | null }
- modalEdicion: { abierto: boolean, clase: ClaseCompleta | null }
- estudiantesInscritos: number[]
- estudiantesDisponibles: Estudiante[]
- nuevaClase: FormData
```

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

### Flujo de Datos

```
1. Cargar datos del docente actual
   ↓
2. Obtener materia_id y grados_asignados
   ↓
3. Cargar clases filtradas por docente_id
   ↓
4. Cargar materias (solo la asignada)
   ↓
5. Cargar estudiantes (filtrados por grados)

CREAR CLASE:
1. Validar materia_id (debe ser la del docente)
2. Validar grado (debe estar en grados_asignados)
3. Validar constraint único
4. Insertar en BD

GESTIONAR INSCRIPCIONES:
1. Cargar estudiantes inscritos (por clase_id)
2. Cargar estudiantes disponibles (filtrados por grado y sección)
3. Sincronizar cambios en tabla inscripciones

EDITAR CLASE:
1. Cargar datos actuales de la clase
2. Permitir edición (excepto sección)
3. Validar constraint único
4. Actualizar en BD
```

## 🗄️ Estructura de Base de Datos

### Tabla: `clases`
```sql
- id: BIGINT
- materia_id: BIGINT (FK → materias.id)
- docente_id: BIGINT (FK → docentes.id)
- grado: TEXT
- seccion: TEXT
- horario: TEXT
- aula: TEXT
- periodo: TEXT
- estado: TEXT ('activo' | 'inactivo')
- created_at: TIMESTAMP
```

### Constraint Único
```sql
UNIQUE (materia_id, grado, seccion, periodo)
```

### Tabla: `inscripciones`
```sql
- id: BIGINT
- estudiante_id: BIGINT (FK → Estudiantes.id)
- clase_id: BIGINT (FK → clases.id)
- periodo: TEXT
- created_at: TIMESTAMP
```

### Tabla: `docentes`
```sql
- materia_id: BIGINT (FK → materias.id)
- grados_asignados: TEXT (formato: "10A,10B,11A")
```

## 🎨 Interfaz de Usuario

### Elementos Visuales

1. **Lista de Clases**
   - Tarjetas con información completa
   - Contador de estudiantes
   - Botones de acción: Gestionar, Editar, Eliminar

2. **Modal: Crear Clase**
   - Formulario con campos validados
   - Selectores con opciones filtradas
   - Mensajes de error/éxito

3. **Modal: Gestionar Inscripciones**
   - Dos columnas: Inscritos | Disponibles
   - Checkboxes para selección múltiple
   - Búsqueda de estudiantes
   - Botones: Añadir, Remover, Guardar

4. **Modal: Editar Clase**
   - Campos editables con validación
   - Campo sección deshabilitado con mensaje
   - Botones: Guardar, Cancelar

## 🔄 Integración con Otros Módulos

- **Dashboard**: Notificaciones de cambios en clases
- **Mis Clases**: Vista de clases del docente
- **Estudiantes**: Selección para inscripciones
- **Configuración**: Muestra materia y grados asignados

## ⚡ Optimizaciones

- Carga paralela de datos con `Promise.all()`
- Filtrado eficiente de estudiantes
- Validación frontend antes de enviar
- Resolución manual de relaciones (clases ↔ docentes)

## 📝 Notas de Implementación

### Restricciones Aplicadas

1. **Materia**: 
   - Docente solo puede crear clases de su `materia_id`
   - Pre-seleccionada y no editable

2. **Grados**:
   - Docente solo puede inscribir estudiantes de sus `grados_asignados`
   - Filtrado automático en modal de inscripciones

3. **Sección**:
   - NO puede modificarse una vez creada la clase
   - Campo deshabilitado en edición
   - Se usa valor original al actualizar

4. **Constraint Único**:
   - Validado por la base de datos
   - Error claro si se intenta duplicar

### Resolución de Relaciones

- No hay FK directa entre `clases` y `docentes` en Supabase
- Se resuelve con consultas separadas:
  1. Obtener clases con `materia_id`
  2. Obtener detalles del docente
  3. Combinar en JavaScript

## 🚨 Consideraciones Especiales

1. **Formato de grados_asignados**: 
   - String con formato "10A,10B,11A"
   - Se parsea en array para filtrado

2. **Filtrado de Estudiantes**:
   - Por grado: `estudiante.grado === clase.grado`
   - Por sección: `estudiante.seccion === clase.seccion`

3. **Sincronización de Inscripciones**:
   - Compara listas: inscritos vs seleccionados
   - Inserta/elimina según diferencias

