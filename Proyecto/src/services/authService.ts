import { supabase } from '../supabaseClient';

export interface Usuario {
  id: number;
  email: string;
  rol: 'estudiante' | 'docente' | 'admin' | 'psicologo' | 'director';
  activo: boolean;
  ultimo_acceso?: string;
  created_at?: string;
}

export interface UsuarioConDetalles extends Usuario {
  detalles?: {
    id: number;
    rut?: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    grado?: string;
    seccion?: string;
    especialidad?: string;
    // Propiedades específicas para docentes
    materia?: {
      id: number;
      nombre: string;
      codigo: string;
    };
    grados_array?: string[]; // Array de grados asignados: ["10°A", "10°B"]
  };
}

export interface LoginResponse {
  success: boolean;
  usuario?: UsuarioConDetalles;
  error?: string;
}

/**
 * Iniciar sesión con email y contraseña
 * NOTA: En producción, las contraseñas deben estar hasheadas
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    // buscar usuario por email
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('activo', true)
      .single();

    if (usuarioError || !usuario) {
      return {
        success: false,
        error: 'Credenciales incorrectas'
      };
    }

    // verificar contraseña (NOTA: en producción usar bcrypt)
    // por ahora comparación simple
    if (usuario.password_hash !== password) {
      return {
        success: false,
        error: 'Credenciales incorrectas'
      };
    }

    // actualizar último acceso
    await supabase
      .from('usuarios')
      .update({ ultimo_acceso: new Date().toISOString() })
      .eq('id', usuario.id);

    // obtener detalles según el rol
    let detalles = null;

    if (usuario.rol === 'estudiante') {
      const { data: estudiante } = await supabase
        .from('Estudiantes')
        .select('id, rut, nombre, apellido, telefono, grado, seccion')
        .eq('usuario_id', usuario.id)
        .single();
      
      detalles = estudiante;
    } else if (usuario.rol === 'docente') {
      // Obtener información completa del docente incluyendo materia
      const { data: docente, error: docenteError } = await supabase
        .from('docentes')
        .select('id, rut, nombre, apellido, telefono, especialidad, materia_id, grados_asignados')
        .eq('usuario_id', usuario.id)
        .single();

      if (docenteError) {
        console.error('Error al cargar docente:', docenteError);
      }

      if (docente) {
        // Obtener información de la materia asignada
        let materia = null;
        if (docente.materia_id) {
          const { data: materiaData, error: materiaError } = await supabase
            .from('materias')
            .select('id, nombre, codigo')
            .eq('id', docente.materia_id)
            .single();
          
          if (materiaError) {
            console.error('Error al cargar materia:', materiaError);
          } else {
            materia = materiaData;
          }
        }

        // Parsear grados asignados de forma segura
        let grados_array: string[] = [];
        if (docente.grados_asignados) {
          try {
            // Si es string, parsearlo
            if (typeof docente.grados_asignados === 'string') {
              grados_array = JSON.parse(docente.grados_asignados);
            } 
            // Si ya es un array, usarlo directamente
            else if (Array.isArray(docente.grados_asignados)) {
              grados_array = docente.grados_asignados;
            }
          } catch (error) {
            console.error('Error al parsear grados_asignados:', error, docente.grados_asignados);
            grados_array = [];
          }
        }

        console.log('Docente cargado (login):', {
          id: docente.id,
          nombre: docente.nombre,
          materia_id: docente.materia_id,
          materia: materia,
          grados_asignados_raw: docente.grados_asignados,
          grados_array: grados_array
        });

        detalles = {
          ...docente,
          materia,
          grados_array
        };
      }
    }

    return {
      success: true,
      usuario: {
        ...usuario,
        detalles
      }
    };

  } catch (error: any) {
    return {
      success: false,
      error: 'Error al iniciar sesión: ' + error.message
    };
  }
};

/**
 * Obtener usuario por ID
 */
export const getUsuarioById = async (id: number): Promise<UsuarioConDetalles | null> => {
  try {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !usuario) return null;

    // obtener detalles según el rol
    let detalles = null;

    if (usuario.rol === 'estudiante') {
      const { data: estudiante } = await supabase
        .from('Estudiantes')
        .select('id, rut, nombre, apellido, telefono, grado, seccion')
        .eq('usuario_id', usuario.id)
        .single();
      
      detalles = estudiante;
    } else if (usuario.rol === 'docente') {
      // Obtener información completa del docente incluyendo materia
      const { data: docente, error: docenteError } = await supabase
        .from('docentes')
        .select('id, rut, nombre, apellido, telefono, especialidad, materia_id, grados_asignados')
        .eq('usuario_id', usuario.id)
        .single();

      if (docenteError) {
        console.error('Error al cargar docente:', docenteError);
      }

      if (docente) {
        // Obtener información de la materia asignada
        let materia = null;
        if (docente.materia_id) {
          const { data: materiaData, error: materiaError } = await supabase
            .from('materias')
            .select('id, nombre, codigo')
            .eq('id', docente.materia_id)
            .single();
          
          if (materiaError) {
            console.error('Error al cargar materia:', materiaError);
          } else {
            materia = materiaData;
          }
        }

        // Parsear grados asignados de forma segura
        let grados_array: string[] = [];
        if (docente.grados_asignados) {
          try {
            // Si es string, parsearlo
            if (typeof docente.grados_asignados === 'string') {
              grados_array = JSON.parse(docente.grados_asignados);
            } 
            // Si ya es un array, usarlo directamente
            else if (Array.isArray(docente.grados_asignados)) {
              grados_array = docente.grados_asignados;
            }
          } catch (error) {
            console.error('Error al parsear grados_asignados:', error, docente.grados_asignados);
            grados_array = [];
          }
        }

        console.log('Docente cargado (getUsuarioById):', {
          id: docente.id,
          nombre: docente.nombre,
          materia_id: docente.materia_id,
          materia: materia,
          grados_asignados_raw: docente.grados_asignados,
          grados_array: grados_array
        });

        detalles = {
          ...docente,
          materia,
          grados_array
        };
      }
    }

    return {
      ...usuario,
      detalles
    };

  } catch (error) {
    return null;
  }
};

/**
 * Verificar si un email ya existe
 */
export const emailExists = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .single();

  return !error && data !== null;
};

/**
 * Cambiar contraseña
 */
export const cambiarPassword = async (
  usuarioId: number,
  passwordActual: string,
  passwordNueva: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // verificar contraseña actual
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('password_hash')
      .eq('id', usuarioId)
      .single();

    if (error || !usuario) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    if (usuario.password_hash !== passwordActual) {
      return { success: false, error: 'Contraseña actual incorrecta' };
    }

    // actualizar contraseña
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ password_hash: passwordNueva })
      .eq('id', usuarioId);

    if (updateError) {
      return { success: false, error: 'Error al actualizar contraseña' };
    }

    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Crear sesión (opcional, para tracking)
 */
export const crearSesion = async (
  usuarioId: number,
  token: string,
  duracionHoras: number = 24
): Promise<void> => {
  const expiraEn = new Date();
  expiraEn.setHours(expiraEn.getHours() + duracionHoras);

  await supabase.from('sesiones').insert({
    usuario_id: usuarioId,
    token,
    expira_en: expiraEn.toISOString()
  });
};

/**
 * Cerrar sesión (limpiar sesiones)
 */
export const logout = async (usuarioId: number): Promise<void> => {
  // eliminar sesiones expiradas o del usuario
  await supabase
    .from('sesiones')
    .delete()
    .eq('usuario_id', usuarioId);
};

/**
 * Obtener todos los usuarios (admin)
 */
export const getAllUsuarios = async (): Promise<Usuario[]> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('rol', { ascending: true })
    .order('email', { ascending: true });

  if (error) throw error;
  return data || [];
};

