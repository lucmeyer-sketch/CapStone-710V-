import { supabase } from '../supabaseClient';
import { Student } from '../types';

// obtener todos los estudiantes
export const getAllStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase
    .from('Estudiantes')
    .select('*')
    .order('apellido', { ascending: true });

  if (error) throw error;
  
  // mapear a la estructura esperada por el frontend
  return (data || []).map(student => ({
    id: String(student.id), // convertir number a string para el frontend
    name: student.nombre || '',
    lastName: student.apellido || '',
    email: student.email || '',
    grade: student.grade || student.grado || '',
    section: student.section || student.seccion || '',
    attendance: [],
    grades: [],
  }));
};

// obtener estudiante por ID
export const getStudentById = async (id: string): Promise<Student | null> => {
  const { data, error } = await supabase
    .from('Estudiantes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.nombre || '',
    lastName: data.apellido || '',
    email: data.email || '',
    grade: data.grade || data.grado || '',
    section: data.section || data.seccion || '',
    attendance: [],
    grades: [],
  };
};

// obtener estudiantes por grado y sección
export const getStudentsByGradeAndSection = async (
  grade: string,
  section: string
): Promise<Student[]> => {
  const gradeField = 'grade'; // intentar con 'grade' primero
  const sectionField = 'section'; // intentar con 'section' primero
  
  const { data, error } = await supabase
    .from('Estudiantes')
    .select('*')
    .order('apellido', { ascending: true });

  if (error) throw error;

  // filtrar por grado y sección después (más flexible)
  return (data || [])
    .filter(student => {
      const studentGrade = student.grade || student.grado || '';
      const studentSection = student.section || student.seccion || '';
      return studentGrade === grade && studentSection === section;
    })
    .map(student => ({
      id: String(student.id), // convertir number a string para el frontend
      name: student.nombre || '',
      lastName: student.apellido || '',
      email: student.email || '',
      grade: student.grade || student.grado || '',
      section: student.section || student.seccion || '',
      attendance: [],
      grades: [],
    }));
};

// crear estudiante
export const createStudent = async (
  student: Omit<Student, 'id' | 'attendance' | 'grades'>
): Promise<Student> => {
  const { data, error } = await supabase
    .from('Estudiantes')
    .insert({
      nombre: student.name,
      apellido: student.lastName,
      email: student.email,
      grade: student.grade,
      section: student.section,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: String(data.id), // convertir number a string para el frontend
    name: data.nombre || '',
    lastName: data.apellido || '',
    email: data.email || '',
    grade: data.grade || data.grado || '',
    section: data.section || data.seccion || '',
    attendance: [],
    grades: [],
  };
};

// actualizar estudiante
export const updateStudent = async (
  id: string,
  student: Partial<Omit<Student, 'id' | 'attendance' | 'grades'>>
): Promise<Student> => {
  const updateData: any = {};
  if (student.name) updateData.nombre = student.name;
  if (student.lastName) updateData.apellido = student.lastName;
  if (student.email) updateData.email = student.email;
  if (student.grade) updateData.grade = student.grade;
  if (student.section) updateData.section = student.section;

  const { data, error } = await supabase
    .from('Estudiantes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: String(data.id), // convertir number a string para el frontend
    name: data.nombre || '',
    lastName: data.apellido || '',
    email: data.email || '',
    grade: data.grade || data.grado || '',
    section: data.section || data.seccion || '',
    attendance: [],
    grades: [],
  };
};

// eliminar estudiante
export const deleteStudent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('Estudiantes')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

