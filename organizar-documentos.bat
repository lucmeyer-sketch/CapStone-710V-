@echo off
echo ========================================
echo    ORGANIZADOR DE DOCUMENTOS CAPSTONE
echo ========================================
echo.
echo Creando estructura de carpetas...

REM Crear carpetas principales
mkdir "Fase1" 2>nul
mkdir "Fase2" 2>nul
mkdir "Fase3" 2>nul

REM Crear subcarpetas para Fase 1
mkdir "Fase1\EvidenciasIndividuales" 2>nul
mkdir "Fase1\EvidenciasGrupales" 2>nul

REM Crear subcarpetas para Fase 2
mkdir "Fase2\EvidenciasIndividuales" 2>nul
mkdir "Fase2\EvidenciasGrupales" 2>nul
mkdir "Fase2\EvidenciasProyecto" 2>nul
mkdir "Fase2\EvidenciasProyecto\Documentacion" 2>nul
mkdir "Fase2\EvidenciasProyecto\SistemaAplicacion" 2>nul
mkdir "Fase2\EvidenciasProyecto\SistemaAplicacion\CodigoFuente" 2>nul

REM Crear subcarpetas para Fase 3
mkdir "Fase3\EvidenciasIndividuales" 2>nul
mkdir "Fase3\EvidenciasGrupales" 2>nul

echo.
echo ========================================
echo    ESTRUCTURA DE CARPETAS CREADA
echo ========================================
echo.
echo 📁 Fase1/
echo    ├── 📁 EvidenciasIndividuales/
echo    └── 📁 EvidenciasGrupales/
echo.
echo 📁 Fase2/
echo    ├── 📁 EvidenciasIndividuales/
echo    ├── 📁 EvidenciasGrupales/
echo    └── 📁 EvidenciasProyecto/
echo        ├── 📁 Documentacion/
echo        └── 📁 SistemaAplicacion/
echo.
echo 📁 Fase3/
echo    ├── 📁 EvidenciasIndividuales/
echo    └── 📁 EvidenciasGrupales/
echo.
echo ========================================
echo    INSTRUCCIONES PARA SUBIR DOCUMENTOS
echo ========================================
echo.
echo 1. Copia tus archivos .docx, .pptx, .xlsx a las carpetas correspondientes
echo 2. Usa el archivo 'subir-todo-github.bat' para subir todo a GitHub
echo 3. O sube manualmente desde GitHub arrastrando y soltando
echo.
echo 📝 DOCUMENTOS QUE NECESITAS SUBIR:
echo.
echo FASE 1:
echo - Apellido_Nombre_1.1_APT122_AutoevaluacionCompetenciasFase1.docx
echo - Apellido_Nombre_1.2_APT122_DiarioReflexionFase1.docx
echo - Apellido_Nombre_1.3_APT122_AutoevaluacionFase1.docx
echo - PresentacionProyecto.pptx
echo - 1.4_APT122_FormativaFase1.docx
echo - 1.5_GuiaEstudiante_Fase1_DefinicionProyectoAPT_Espanol.docx
echo - 1.5_GuiaEstudiante_Fase1_DefinicionProyectoAPT_Ingles.docx (Opcional)
echo.
echo FASE 2:
echo - Apellido_Nombre_2.1_APT122_DiarioReflexionFase2.docx
echo - 2.4_GuiaEstudiante_Fase2_DesarrolloProyectoAPT_Espanol.docx
echo - 2.4_GuiaEstudiante_Fase2_DesarrolloProyectoAPT_Ingles.docx (Opcional)
echo - 2.6_GuiaEstudiante_Fase2_InformeFinalProyectoAPT_Espanol.docx
echo - 2.6_GuiaEstudiante_Fase2_InformeFinalProyectoAPT_Ingles.docx (Opcional)
echo - PresentacionProyecto.pptx (Fase 2)
echo - Documentacion del sistema
echo - Base de datos
echo.
echo FASE 3:
echo - Apellido_Nombre_3.1_APT122_DiarioReflexionFase3.docx
echo - PresentacionFinalProyecto_Espanol.pptx
echo - PresentacionFinalProyecto_Ingles.pptx (Opcional)
echo.
echo ⚠️  NOTA: Las planillas de evaluación se envían por correo
echo.
pause






