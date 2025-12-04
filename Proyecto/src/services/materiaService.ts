import { supabase } from '../supabaseClient';
import { Materia } from '../types/database';

// obtener todas las materias
export const getAllMaterias = async (): Promise<Materia[]> => {
  const { data, error } = await supabase
    .from('materias')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) throw error;
  return data || [];
};

// obtener materia por ID
export const getMateriaById = async (id: string): Promise<Materia | null> => {
  const { data, error } = await supabase
    .from('materias')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// obtener materias por grado
export const getMateriasByGrado = async (grado: string): Promise<Materia[]> => {
  const { data, error } = await supabase
    .from('materias')
    .select('*')
    .eq('grado', grado)
    .order('nombre', { ascending: true });

  if (error) throw error;
  return data || [];
};

// crear materia
export const createMateria = async (
  materia: Omit<Materia, 'id' | 'created_at' | 'updated_at'>
): Promise<Materia> => {
  const { data, error } = await supabase
    .from('materias')
    .insert(materia)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// actualizar materia
export const updateMateria = async (
  id: string,
  materia: Partial<Omit<Materia, 'id' | 'created_at' | 'updated_at'>>
): Promise<Materia> => {
  const { data, error } = await supabase
    .from('materias')
    .update(materia)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// eliminar materia
export const deleteMateria = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('materias')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

