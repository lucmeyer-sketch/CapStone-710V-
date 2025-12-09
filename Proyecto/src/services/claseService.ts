import { supabase } from '../supabaseClient';
import { Clase } from '../types/database';

// obtener todas las clases con relaciones
export const getAllClases = async (): Promise<Clase[]> => {
  const { data, error } = await supabase
    .from('clases')
    .select(`
      *,
      materia:materias (*),
      docente:docentes (*)
    `)
    .order('grado', { ascending: true });

  if (error) throw error;
  return data || [];
};

// obtener clase por ID con relaciones
export const getClaseById = async (id: string): Promise<Clase | null> => {
  const { data, error } = await supabase
    .from('clases')
    .select(`
      *,
      materia:materias (*),
      docente:docentes (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// obtener clases por grado y sección
export const getClasesByGradoSeccion = async (
  grado: string,
  seccion: string
): Promise<Clase[]> => {
  const { data, error } = await supabase
    .from('clases')
    .select(`
      *,
      materia:materias (*),
      docente:docentes (*)
    `)
    .eq('grado', grado)
    .eq('seccion', seccion)
    .eq('estado', 'activo')
    .order('materia.nombre', { ascending: true });

  if (error) throw error;
  return data || [];
};

// obtener clases de un docente
export const getClasesByDocente = async (docenteId: string): Promise<Clase[]> => {
  // Obtener clases primero
  const { data: clasesData, error: clasesError } = await supabase
    .from('clases')
    .select('*')
    .eq('docente_id', docenteId)
    .eq('estado', 'activo');

  if (clasesError) throw clasesError;
  if (!clasesData || clasesData.length === 0) return [];

  // Obtener materias por separado
  const materiaIds = Array.from(
    new Set(
      clasesData
        .map(clase => clase.materia_id)
        .filter((id): id is number => id !== undefined && id !== null)
    )
  );

  let materiasData: any[] = [];
  if (materiaIds.length > 0) {
    const { data, error: materiasError } = await supabase
      .from('materias')
      .select('id, nombre, codigo')
      .in('id', materiaIds);

    if (materiasError) throw materiasError;
    materiasData = data || [];
  }

  // Combinar datos
  return clasesData.map(clase => ({
    ...clase,
    materia: materiasData.find(m => m.id === clase.materia_id) || null
  }));
};

// crear clase
export const createClase = async (
  clase: Omit<Clase, 'id' | 'created_at' | 'updated_at'>
): Promise<Clase> => {
  const { data, error } = await supabase
    .from('clases')
    .insert({
      materia_id: clase.materia_id,
      docente_id: clase.docente_id,
      grado: clase.grado,
      seccion: clase.seccion,
      horario: clase.horario,
      aula: clase.aula,
      periodo: clase.periodo,
      estado: clase.estado || 'activo',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// actualizar clase
export const updateClase = async (
  id: string,
  clase: Partial<Omit<Clase, 'id' | 'created_at' | 'updated_at'>>
): Promise<Clase> => {
  const { data, error } = await supabase
    .from('clases')
    .update(clase)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// eliminar clase
export const deleteClase = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clases')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

