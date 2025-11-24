-- ============================================
-- ACTUALIZAR TABLA DOCENTES CON RESTRICCIONES
-- Agregar materia asignada y grados específicos
-- ============================================

-- Agregar columnas para restricciones de docente
ALTER TABLE public.docentes 
ADD COLUMN IF NOT EXISTS materia_id BIGINT REFERENCES public.materias(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS grados_asignados TEXT; -- JSON con array de grados: ["10°A", "10°B"]

-- Crear índice para búsquedas por materia
CREATE INDEX IF NOT EXISTS idx_docentes_materia ON public.docentes(materia_id);

-- ============================================
-- ASIGNAR MATERIAS Y GRADOS A DOCENTES EXISTENTES
-- ============================================

-- Actualizar José Rodríguez (Matemáticas)
UPDATE public.docentes 
SET 
  materia_id = (SELECT id FROM public.materias WHERE nombre ILIKE '%matemática%' LIMIT 1),
  grados_asignados = '["10°A", "10°B"]'
WHERE nombre = 'José' AND apellido = 'Rodríguez';

-- Actualizar María González (Lenguaje)
UPDATE public.docentes 
SET 
  materia_id = (SELECT id FROM public.materias WHERE nombre ILIKE '%lenguaje%' LIMIT 1),
  grados_asignados = '["10°A", "11°A"]'
WHERE nombre = 'María' AND apellido = 'González';

-- Actualizar Carlos Martínez (Ciencias)
UPDATE public.docentes 
SET 
  materia_id = (SELECT id FROM public.materias WHERE nombre ILIKE '%ciencia%' LIMIT 1),
  grados_asignados = '["10°B", "11°B"]'
WHERE nombre = 'Carlos' AND apellido = 'Martínez';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver docentes con sus materias y grados asignados
SELECT 
  d.id,
  d.nombre || ' ' || d.apellido as docente,
  m.nombre as materia,
  m.codigo as codigo_materia,
  d.grados_asignados,
  d.especialidad
FROM public.docentes d
LEFT JOIN public.materias m ON d.materia_id = m.id
WHERE d.estado = 'activo'
ORDER BY d.apellido;

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE '✅ Docentes actualizados con restricciones';
  RAISE NOTICE 'Cada docente ahora tiene:';
  RAISE NOTICE '  - Una materia específica asignada';
  RAISE NOTICE '  - Grados específicos donde puede enseñar';
  RAISE NOTICE '';
  RAISE NOTICE 'Ejemplo:';
  RAISE NOTICE '  José Rodríguez → Matemáticas → 10°A, 10°B';
  RAISE NOTICE '  María González → Lenguaje → 10°A, 11°A';
END $$;
