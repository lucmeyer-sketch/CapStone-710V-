@echo off
echo ========================================
echo    ACTUALIZANDO PROYECTO EN GITHUB
echo ========================================
echo.

echo Paso 1: Agregando archivos modificados...
git add .

echo.
echo Paso 2: Creando commit con los cambios...
git commit -m "Actualización: Sistema educativo chileno implementado

- Cambiado sistema de grados a 1°-8° Básico y 1°-4° Medio
- Actualizado sistema de calificaciones a escala 1.0-7.0
- Agregados datos ficticios más realistas
- Mejorada interfaz con contexto educativo chileno"

echo.
echo Paso 3: Subiendo cambios a GitHub...
git push origin main

echo.
echo ========================================
echo    ¡ACTUALIZACIÓN COMPLETADA!
echo ========================================
echo.
echo Tu proyecto ha sido actualizado en GitHub.
echo Puedes verlo en: https://github.com/[tu-usuario]/[nombre-repositorio]
echo.
pause





