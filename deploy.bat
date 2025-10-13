@echo off
echo ========================================
echo   APT - Despliegue a GitHub
echo ========================================

echo.
echo Verificando estado de Git...

git status
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Git no esta instalado o configurado.
    echo Por favor instala Git desde: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo.
echo Agregando archivos al staging...
git add .

echo.
echo Haciendo commit...
git commit -m "Actualizacion automatica - %date% %time%"

echo.
echo Subiendo cambios a GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   ¡DESPLIEGUE EXITOSO!
    echo ========================================
    echo.
    echo Tu proyecto ha sido actualizado en GitHub.
    echo Puedes verlo en: https://github.com/[TU-USUARIO]/apt-educational-platform
) else (
    echo.
    echo ========================================
    echo   ERROR EN EL DESPLIEGUE
    echo ========================================
    echo.
    echo Verifica tu conexion a internet y credenciales de GitHub.
)

echo.
pause
