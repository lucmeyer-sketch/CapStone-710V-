import { supabase } from '../supabaseClient';
import { Calificacion, CalificacionConDetalles } from '../types/database';

// obtener todas las calificaciones de un estudiante
export const getCalificacionesByEstudiante = async (
  estudianteId: string
): Promise<CalificacionConDetalles[]> => {
  // Obtener calificaciones con clases y materias (sin docente)
  const { data: calificacionesData, error: calificacionesError } = await supabase
    .from('calificaciones')
    .select(`
      *,
      clase:clases (
        *,
        materia:materias (*)
      )
    `)
    .eq('estudiante_id', estudianteId)
    .order('fecha_evaluacion', { ascending: false });

  if (calificacionesError) throw calificacionesError;
  if (!calificacionesData || calificacionesData.length === 0) return [];

  // Obtener IDs únicos de docentes
  const docenteIds = Array.from(
    new Set(
      calificacionesData
        .map(cal => cal.clase?.docente_id)
        .filter((id): id is number => id !== undefined && id !== null)
    )
  );

  // Obtener información de docentes por separado
  let docentesData: any[] = [];
  if (docenteIds.length > 0) {
    const { data, error: docentesError } = await supabase
      .from('docentes')
      .select('id, nombre, apellido')
      .in('id', docenteIds);

    if (docentesError) throw docentesError;
    docentesData = data || [];
  }

  // Combinar datos
  return calificacionesData.map(calificacion => {
    const clase = calificacion.clase;
    if (!clase) return calificacion;

    // Encontrar docente correspondiente
    const docente = docentesData.find(d => d.id === clase.docente_id);

    return {
      ...calificacion,
      clase: {
        ...clase,
        docente: docente ? {
          id: docente.id,
          nombre: docente.nombre,
          apellido: docente.apellido
        } : undefined
      }
    };
  });
};

// obtener calificaciones por clase
export const getCalificacionesByClase = async (
  claseId: string
): Promise<CalificacionConDetalles[]> => {
  const { data, error } = await supabase
    .from('calificaciones')
    .select(`
      *,
      estudiante:Estudiantes (
        nombre,
        apellido,
        grado,
        seccion
      )
    `)
    .eq('clase_id', claseId)
    .order('fecha_evaluacion', { ascending: false });

  if (error) throw error;
  return data || [];
};

// crear calificación
export const createCalificacion = async (
  calificacion: Omit<Calificacion, 'id' | 'created_at' | 'updated_at'>
): Promise<Calificacion> => {
  const { data, error } = await supabase
    .from('calificaciones')
    .insert(calificacion)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// actualizar calificación
export const updateCalificacion = async (
  id: string,
  calificacion: Partial<Omit<Calificacion, 'id' | 'created_at' | 'updated_at'>>
): Promise<Calificacion> => {
  const { data, error } = await supabase
    .from('calificaciones')
    .update(calificacion)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// eliminar calificación
export const deleteCalificacion = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('calificaciones')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// calcular promedio de un estudiante en una clase
export const getPromedioEstudianteClase = async (
  estudianteId: string,
  claseId: string
): Promise<number> => {
  const { data, error } = await supabase
    .from('calificaciones')
    .select('nota, ponderacion')
    .eq('estudiante_id', estudianteId)
    .eq('clase_id', claseId);

  if (error) throw error;
  
  if (!data || data.length === 0) return 0;

  // calcular promedio ponderado
  const totalPonderacion = data.reduce((sum, cal) => sum + (cal.ponderacion || 100), 0);
  const sumaNotas = data.reduce((sum, cal) => sum + (cal.nota * (cal.ponderacion || 100)), 0);
  
  return parseFloat((sumaNotas / totalPonderacion).toFixed(1));
};

// obtener promedio general del estudiante
export const getPromedioGeneralEstudiante = async (
  estudianteId: string
): Promise<number> => {
  const { data, error } = await supabase
    .from('calificaciones')
    .select('nota')
    .eq('estudiante_id', estudianteId);

  if (error) throw error;
  
  if (!data || data.length === 0) return 0;

  const promedio = data.reduce((sum, cal) => sum + cal.nota, 0) / data.length;
  return parseFloat(promedio.toFixed(1));
};

