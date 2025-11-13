# 🚀 Cómo Ejecutar el Proyecto React

## 📋 Requisitos Previos

1. **Node.js** (versión 16 o superior)
   - Descargar desde: https://nodejs.org/
   - Verificar instalación: `node --version`

2. **npm** (viene con Node.js)
   - Verificar instalación: `npm --version`

## 🔧 Instalación y Ejecución

### Paso 1: Abrir Terminal
- Presiona `Win + R`, escribe `cmd` o `powershell` y presiona Enter
- O abre PowerShell desde el menú de inicio

### Paso 2: Navegar al Proyecto
```bash
cd "C:\Users\Luciano\Documents\CursorAI\Proyecto Capstone\apt-educational-platform"
```

### Paso 3: Instalar Dependencias
```bash
npm install
```
**Nota:** Solo necesario la primera vez o si se agregan nuevas dependencias.

### Paso 4: Ejecutar el Proyecto
```bash
npm start
```

### Paso 5: Abrir en el Navegador
- El navegador se abrirá automáticamente en `http://localhost:3000`
- Si no se abre, ve manualmente a esa dirección

## 🎯 Usar la Aplicación

1. **Al abrir**, verás un **Selector de Roles**
2. **Elige un rol**:
   - 👨‍🏫 Docente - Gestión completa
   - 🎓 Estudiante - Ver notas y asistencia
   - 🧠 Psicóloga - Seguimiento estudiantil
   - 👔 Director - Panel ejecutivo

3. **Explora** las funcionalidades según el rol seleccionado

## 🛠️ Comandos Adicionales

### Construir para Producción
```bash
npm run build
```
Crea una versión optimizada en la carpeta `build/`

### Ejecutar Tests
```bash
npm test
```

### Ver Versión de Node/npm
```bash
node --version
npm --version
```

## ⚠️ Problemas Comunes

### Error: "npm no se reconoce como comando"
- **Solución:** Instala Node.js desde nodejs.org

### Error: "Port 3000 already in use"
- **Solución:** Cierra otras aplicaciones que usen el puerto 3000
- O cambia el puerto: `set PORT=3001 && npm start`

### Error: "Module not found"
- **Solución:** Ejecuta `npm install` nuevamente

### La página no carga
- Verifica que el servidor esté corriendo (debería decir "Compiled successfully!")
- Revisa la consola del navegador (F12) para ver errores

## 📝 Notas

- **No cierres** la terminal mientras el proyecto esté ejecutándose
- Para detener el servidor, presiona `Ctrl + C` en la terminal
- Los cambios en el código se reflejan automáticamente (hot reload)

## 🔄 Próxima Vez

Solo necesitas:
```bash
cd "C:\Users\Luciano\Documents\CursorAI\Proyecto Capstone\apt-educational-platform"
npm start
```

---

**¡Listo! Ahora puedes trabajar en tu proyecto React.** 🎉




