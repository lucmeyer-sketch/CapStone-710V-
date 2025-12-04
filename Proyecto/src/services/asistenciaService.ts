import { supabase } from '../supabaseClient';
import { Asistencia, AsistenciaConDetalles } from '../types/database';

// obtener toda la asistencia
export const getAllAsistencia = async (): Promise<AsistenciaConDetalles[]> => {
  const { data, error } = await supabase
    .from('asistencia')
    .select(`
      *,
      estudiante:Estudiantes (
        nombre,
        apellido,
        grado,
        seccion
      ),
      clase:clases (
        materia:materias (
          nombre,
          codigo
        ),
        docente:docentes (
          nombre,
          apellido
        )
      )
    `)
    .order('fecha', { ascending: false });

  if (error) throw error;
  return data || [];
};

// obtener asistencia por fecha
export const getAsistenciaByFecha = async (
  fecha: string
): Promise<AsistenciaConDetalles[]> => {
  const { data, error } = await supabase
    .from('asistencia')
    .select(`
      *,
      estudiante:Estudiantes (
        nombre,
        apellido,
        grado,
        seccion
      ),
      clase:clases (
        materia:materias (
          nombre,
          codigo
        )
      )
    `)
    .eq('fecha', fecha);

  if (error) throw error;
  
  // ordenar en el frontend por apellido del estudiante
  const sorted = (data || []).sort((a, b) => {
    const apellidoA = a.estudiante?.apellido || '';
    const apellidoB = b.estudiante?.apellido || '';
    return apellidoA.localeCompare(apellidoB);
  });
  
  return sorted;
};

// obtener asistencia por estudiante
export const getAsistenciaByEstudiante = async (
  estudianteId: string
): Promise<Asistencia[]> => {
  const { data, error } = await supabase
    .from('asistencia')
    .select('*')
    .eq('estudiante_id', estudianteId)
    .order('fecha', { ascending: false });

  if (error) throw error;
  return data || [];
};

// obtener asistencia por clase y fecha
export const getAsistenciaByClaseFecha = async (
  claseId: number,
  fecha: string
): Promise<AsistenciaConDetalles[]> => {
  const { data, error } = await supabase
    .from('asistencia')
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
    .eq('fecha', fecha);

  if (error) throw error;
  
  // ordenar en el frontend por apellido del estudiante
  const sorted = (data || []).sort((a, b) => {
    const apellidoA = a.estudiante?.apellido || '';
    const apellidoB = b.estudiante?.apellido || '';
    return apellidoA.localeCompare(apellidoB);
  });
  
  return sorted;
};

// crear o actualizar asistencia
export const upsertAsistencia = async (
  asistencia: Omit<Asistencia, 'id' | 'created_at' | 'updated_at'>
): Promise<Asistencia> => {
  const { data, error } = await supabase
    .from('asistencia')
    .upsert({
      estudiante_id: asistencia.estudiante_id,
      clase_id: asistencia.clase_id,
      fecha: asistencia.fecha,
      estado: asistencia.estado,
      hora_llegada: asistencia.hora_llegada,
      observaciones: asistencia.observaciones,
    }, {
      onConflict: 'estudiante_id,clase_id,fecha'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// eliminar asistencia
export const deleteAsistencia = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('asistencia')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// obtener estadísticas de asistencia
export const getEstadisticasAsistencia = async (
  fechaInicio: string,
  fechaFin: string
) => {
  const { data, error } = await supabase
    .from('asistencia')
    .select('estado')
    .gte('fecha', fechaInicio)
    .lte('fecha', fechaFin);

  if (error) throw error;

  const total = data.length;
  const presente = data.filter(r => r.estado === 'presente').length;
  const ausente = data.filter(r => r.estado === 'ausente').length;
  const tarde = data.filter(r => r.estado === 'tarde').length;
  const justificado = data.filter(r => r.estado === 'justificado').length;

  return {
    total,
    presente,
    ausente,
    tarde,
    justificado,
    porcentajeAsistencia: total > 0 ? ((presente + tarde) / total * 100).toFixed(1) : '0',
  };
};

// obtener porcentaje de asistencia de un estudiante
export const getPorcentajeAsistenciaEstudiante = async (
  estudianteId: string,
  fechaInicio: string,
  fechaFin: string
): Promise<number> => {
  const { data, error } = await supabase
    .from('asistencia')
    .select('estado')
    .eq('estudiante_id', estudianteId)
    .gte('fecha', fechaInicio)
    .lte('fecha', fechaFin);

  if (error) throw error;

  if (!data || data.length === 0) return 100;

  const total = data.length;
  const presente = data.filter(r => r.estado === 'presente' || r.estado === 'tarde').length;

  return parseFloat(((presente / total) * 100).toFixed(1));
};

