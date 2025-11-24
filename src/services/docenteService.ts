import { supabase } from '../supabaseClient';
import { Docente } from '../types/database';

// obtener todos los docentes
export const getAllDocentes = async (): Promise<Docente[]> => {
  const { data, error } = await supabase
    .from('docentes')
    .select('*')
    .order('apellido', { ascending: true });

  if (error) throw error;
  return data || [];
};

// obtener docente por ID
export const getDocenteById = async (id: string): Promise<Docente | null> => {
  const { data, error } = await supabase
    .from('docentes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// obtener docentes activos
export const getDocentesActivos = async (): Promise<Docente[]> => {
  const { data, error } = await supabase
    .from('docentes')
    .select('*')
    .eq('estado', 'activo')
    .order('apellido', { ascending: true });

  if (error) throw error;
  return data || [];
};

// crear docente
export const createDocente = async (
  docente: Omit<Docente, 'id' | 'created_at' | 'updated_at'>
): Promise<Docente> => {
  const { data, error } = await supabase
    .from('docentes')
    .insert(docente)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// actualizar docente
export const updateDocente = async (
  id: string,
  docente: Partial<Omit<Docente, 'id' | 'created_at' | 'updated_at'>>
): Promise<Docente> => {
  const { data, error } = await supabase
    .from('docentes')
    .update(docente)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// eliminar docente
export const deleteDocente = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('docentes')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

