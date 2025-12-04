# 🎓 CapStone 710V - Sistema de Gestión Escolar

<div align="center">

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?logo=supabase)

Sistema completo de gestión escolar con roles diferenciados para docentes y estudiantes, implementando notificaciones en tiempo real y un sistema de mensajería privada.

[Características](#-características) • [Instalación](#-instalación) • [Documentación](#-documentación) • [Roles](#-roles)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#️-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Roles y Permisos](#-roles-y-permisos)
- [Documentación](#-documentación)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Licencia](#-licencia)

---

## ✨ Características

### 🔐 Autenticación Segura
- Sistema de login con Supabase Auth
- Control de roles (Docente/Estudiante)
- Sesiones persistentes
- Cambio seguro de contraseñas

### 👨‍🏫 Panel Docente
- 📊 **Dashboard con estadísticas en tiempo real**
  - Total de estudiantes
  - Mensajes nuevos
  - Reportes pendientes
  - Gráficos de rendimiento

- 📝 **Gestión de Calificaciones**
  - CRUD completo de notas
  - Filtros por materia, grado y período
  - Estadísticas automáticas
  - Promedio general

- 📅 **Control de Asistencia**
  - Registro diario
  - Estados: Presente, Ausente, Tardanza
  - Estadísticas del día
  - Historial completo

- 👥 **Administración de Estudiantes**
  - Gestión completa de datos
  - 12 campos personalizados
  - Búsqueda y filtros avanzados
  - Información de contacto

- 💬 **Sistema de Mensajería**
  - Conversaciones privadas por estudiante
  - Categorías: General, Urgente, Académico, Conductual, Felicitación
  - Interfaz estilo WhatsApp Web
  - Notificaciones de mensajes no leídos

- 📈 **Reportes y Seguimiento**
  - Crear reportes académicos y conductuales
  - Seguimiento de estudiantes
  - Estados: Pendiente, En progreso, Completado

### 👨‍🎓 Panel Estudiante
- 👤 **Mi Perfil**
  - Datos personales
  - Información académica
  - Resumen de rendimiento

- 📊 **Mis Calificaciones**
  - Vista de todas las notas
  - Promedio por materia
  - Promedio general
  - Historial completo

- 📅 **Mi Asistencia**
  - Calendario de asistencia
  - Porcentaje de asistencia
  - Historial de ausencias y tardanzas

- 💬 **Mensajes**
  - Conversaciones separadas por docente
  - Responder a mensajes de profesores
  - Visualización clara del remitente
  - Notificaciones de nuevos mensajes

### 🔔 Notificaciones en Tiempo Real
- Actualización automática de datos
- Notificaciones instantáneas para:
  - Nuevas calificaciones
  - Registro de asistencia
  - Mensajes recibidos
  - Reportes generados
- Color-coded por importancia:
  - ✅ Success (verde)
  - ⚠️ Warning (amarillo)
  - 🚨 Urgent (rojo)
  - 💬 Info (azul)

---

## 🛠️ Tecnologías

### Frontend
- **React 18** - Librería de UI
- **TypeScript** - Tipado estático
- **React Router DOM** - Navegación
- **Inline Styles** - Diseño moderno sin dependencias CSS

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Supabase Auth
  - Supabase Realtime
  - Row Level Security

### Servicios
- `studentService` - Gestión de estudiantes
- `asistenciaService` - Control de asistencia
- `calificacionService` - Gestión de calificaciones
- `mensajeService` - Sistema de mensajería
- `reporteService` - Reportes y seguimiento
- `authService` - Autenticación
- `notificationService` - Notificaciones en tiempo real
- `docenteService` - Gestión de docentes
- `materiaService` - Gestión de materias
- `claseService` - Gestión de clases

---

## 📦 Instalación

### Prerrequisitos
- Node.js 16+ y npm
- Cuenta de Supabase (gratis)

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/CapStone-710V-.git
   cd CapStone-710V-
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env en la raíz del proyecto
   cp .env.example .env
   ```
   
   Editar `.env` con tus credenciales de Supabase:
   ```env
   REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=tu-clave-publica-anonima-aqui
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm start
   ```
   
   La aplicación estará disponible en `http://localhost:3000`

5. **Construir para producción**
   ```bash
   npm run build
   ```

---

## ⚙️ Configuración

### Supabase Setup

1. Crear un proyecto en [Supabase](https://supabase.com)
2. Ejecutar el esquema de base de datos (ver documentación en `/docs`)
3. Configurar autenticación con email/password
4. Habilitar Realtime en las tablas necesarias
5. Copiar las credenciales al archivo `.env`

Para más detalles, consulta `/docs/CONFIGURACION.md`

---

## 📁 Estructura del Proyecto

```
CapStone-710V-/
├── docs/                          # Documentación
│   ├── CONFIGURACION.md          # Guía de setup
│   ├── DIAGRAMA-SISTEMA-COMPLETO.md  # Diagrama detallado
│   └── RECOMENDACIONES-PUSH.md   # Guía de deploy
│
├── public/                        # Archivos públicos
│   ├── index.html
│   ├── favicon.ico
│   └── ...
│
├── src/
│   ├── components/               # Componentes React
│   │   ├── Attendance/          # Control de asistencia
│   │   ├── Dashboard/           # Dashboard docente
│   │   ├── Login/               # Autenticación
│   │   ├── Messages/            # Sistema de mensajería
│   │   ├── Reports/             # Reportes
│   │   ├── Settings/            # Configuración de perfil
│   │   ├── Sidebar/             # Navegación lateral
│   │   ├── StudentDashboard/    # Dashboard estudiante
│   │   └── Students/            # Gestión de estudiantes
│   │
│   ├── services/                # Servicios de API
│   │   ├── asistenciaService.ts
│   │   ├── authService.ts
│   │   ├── calificacionService.ts
│   │   ├── mensajeService.ts
│   │   ├── notificationService.ts
│   │   └── ...
│   │
│   ├── types/                   # TypeScript types
│   │   └── database.ts
│   │
│   ├── App.tsx                  # Componente principal
│   ├── supabaseClient.ts        # Cliente de Supabase
│   └── index.tsx                # Punto de entrada
│
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔐 Roles y Permisos

### 👨‍🏫 Docente
- ✅ Acceso completo a todos los módulos
- ✅ CRUD de calificaciones
- ✅ Registro de asistencia
- ✅ Gestión de estudiantes
- ✅ Crear y enviar mensajes
- ✅ Generar reportes
- ✅ Ver estadísticas generales

### 👨‍🎓 Estudiante
- ✅ Ver su propio perfil
- ✅ Consultar sus calificaciones
- ✅ Ver su historial de asistencia
- ✅ Recibir mensajes de docentes
- ✅ Responder mensajes
- ❌ No puede iniciar conversaciones
- ❌ No puede ver datos de otros estudiantes
- ❌ Solo acceso de lectura a sus datos

---

## 📚 Documentación

Para información detallada, consulta la carpeta `/docs`:

- **DIAGRAMA-SISTEMA-COMPLETO.md**: Diagrama visual completo del sistema
  - Vista docente detallada
  - Vista estudiante detallada
  - Flujo de autenticación
  - Esquema de base de datos
  - Tecnologías utilizadas

- **CONFIGURACION.md**: Guía paso a paso de configuración
  - Setup de Supabase
  - Variables de entorno
  - Instalación de dependencias

- **RECOMENDACIONES-PUSH.md**: Guía para deploy
  - Checklist antes del push
  - Buenas prácticas de seguridad
  - Estructura recomendada

---

## 📸 Capturas de Pantalla

### Dashboard Docente
```
┌────────────────────────────────────────────────┐
│  📊 Dashboard con estadísticas en tiempo real  │
│  🔔 Notificaciones instantáneas                │
│  📈 Gráficos de rendimiento                    │
└────────────────────────────────────────────────┘
```

### Sistema de Mensajería
```
┌─────────────────────┬──────────────────────────┐
│ Conversaciones      │  Chat Privado            │
│ • Por estudiante    │  • Estilo WhatsApp Web   │
│ • Color-coded       │  • Respuestas en tiempo  │
│ • Contador no leídos│    real                  │
└─────────────────────┴──────────────────────────┘
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva característica'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👥 Autor

**Proyecto CapStone 710V**

- Desarrollado para gestión escolar moderna
- Implementación: React + TypeScript + Supabase
- Versión: 1.0.0
- Fecha: Noviembre 2025

---

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) - Por el increíble BaaS
- [React](https://reactjs.org) - Por la librería de UI
- [TypeScript](https://www.typescriptlang.org) - Por el tipado estático

---

<div align="center">

**[⬆ Volver arriba](#-capstone-710v---sistema-de-gestión-escolar)**

Hecho con ❤️ para la educación

</div>
