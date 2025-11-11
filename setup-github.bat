@echo off
echo ========================================
echo   APT - Configuracion Inicial GitHub
echo ========================================

echo.
echo Configurando Git por primera vez...
echo.

REM Verificar si Git esta instalado
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git no esta instalado.
    echo.
    echo Por favor:
    echo 1. Ve a: https://git-scm.com/download/win
    echo 2. Descarga e instala Git
    echo 3. Reinicia este script
    echo.
    pause
    exit /b 1
)

echo Git detectado correctamente.
echo.

REM Inicializar repositorio
echo Inicializando repositorio Git...
git init

REM Agregar archivos
echo Agregando archivos...
git add .

REM Hacer commit inicial
echo Haciendo commit inicial...
git commit -m "Initial commit - Plataforma educativa funcional"

echo.
echo ========================================
echo   CONFIGURACION COMPLETADA
echo ========================================
echo.
echo Ahora necesitas:
echo.
echo 1. Crear un repositorio en GitHub:
echo    - Ve a: https://github.com/new
echo    - Nombre: apt-educational-platform
echo    - Descripcion: Plataforma SaaS Educativa Integral
echo    - Marca como Public
echo.
echo 2. Conectar tu repositorio local:
echo    git remote add origin https://github.com/[TU-USUARIO]/apt-educational-platform.git
echo.
echo 3. Subir tu proyecto:
echo    git branch -M main
echo    git push -u origin main
echo.
echo 4. Para futuras actualizaciones, usa: deploy.bat
echo.
pause





