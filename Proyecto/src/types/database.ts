// tipos que coinciden EXACTAMENTE con la estructura de Supabase
// IMPORTANTE: Los IDs son tipo number (BIGINT en Supabase)

export interface Estudiante {
  id: number;
  rut?: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  grado?: string;
  seccion?: string;
  estado?: 'activo' | 'inactivo' | 'graduado';
  tutor_nombre?: string;
  tutor_telefono?: string;
  tutor_email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Docente {
  id: number;
  rut?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  especialidad?: string;
  materia_id?: number; // Materia asignada al docente
  grados_asignados?: string; // JSON con grados: ["10°A", "10°B"]
  estado?: 'activo' | 'inactivo' | 'licencia';
  fecha_contratacion?: string;
  created_at?: string;
  updated_at?: string;
  // relaciones
  materia?: Materia;
}

export interface Materia {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  creditos?: number;
  grado?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Clase {
  id: number;
  materia_id: number;
  docente_id: number;
  grado: string;
  seccion: string;
  horario?: string;
  aula?: string;
  periodo?: string;
  estado?: 'activo' | 'finalizada' | 'cancelada';
  created_at?: string;
  updated_at?: string;
  // relaciones
  materia?: Materia;
  docente?: Docente;
}

export interface Inscripcion {
  id: number;
  clase_id: number;
  estudiante_id: number;
  fecha_inscripcion?: string;
  estado?: 'activo' | 'retirado' | 'completado';
  created_at?: string;
  updated_at?: string;
  // relaciones
  clase?: Clase;
  estudiante?: Estudiante;
}

export interface Calificacion {
  id: number;
  inscripcion_id: number;
  estudiante_id: number;
  clase_id: number;
  tipo_evaluacion: 'examen' | 'tarea' | 'proyecto' | 'participacion' | 'quiz';
  nombre_evaluacion: string;
  nota: number;
  nota_maxima: number;
  ponderacion?: number;
  fecha_evaluacion: string;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
  // relaciones
  clase?: Clase;
  estudiante?: Estudiante;
}

export interface Asistencia {
  id: number;
  estudiante_id: number;
  clase_id?: number;
  fecha: string;
  estado: 'presente' | 'ausente' | 'tarde' | 'justificado';
  hora_llegada?: string;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
  // relaciones
  estudiante?: Estudiante;
  clase?: Clase;
}

export interface SeguimientoPsicologico {
  id: number;
  estudiante_id: number;
  psicologo_id?: number;
  fecha_sesion: string;
  tipo_sesion?: 'individual' | 'grupal' | 'familiar';
  motivo: string;
  observaciones?: string;
  recomendaciones?: string;
  proxima_cita?: string;
  estado?: 'activo' | 'finalizado' | 'derivado';
  created_at?: string;
  updated_at?: string;
  // relaciones
  estudiante?: Estudiante;
}

export interface Mensaje {
  id: number;
  remitente_tipo: 'docente' | 'admin' | 'psicologo' | 'director' | 'estudiante';
  remitente_id: number;
  destinatario_tipo: 'estudiante' | 'tutor' | 'docente' | 'todos';
  destinatario_id?: number;
  estudiante_id?: number;
  asunto: string;
  mensaje: string;
  tipo?: 'general' | 'urgente' | 'academico' | 'conductual' | 'felicitacion';
  leido?: boolean;
  fecha_lectura?: string;
  created_at?: string;
}

export interface Reporte {
  id: number;
  estudiante_id?: number;
  tipo_reporte: 'academico' | 'asistencia' | 'conductual' | 'psicologico' | 'general';
  titulo: string;
  periodo?: string;
  contenido: string;
  generado_por_id?: number;
  generado_por_tipo?: 'docente' | 'admin' | 'psicologo' | 'sistema';
  archivo_url?: string;
  created_at?: string;
  // relaciones
  estudiante?: Estudiante;
}

// tipos con relaciones expandidas para queries complejas
export interface AsistenciaConDetalles extends Omit<Asistencia, 'estudiante' | 'clase'> {
  estudiante?: {
    nombre: string;
    apellido: string;
    grado?: string;
    seccion?: string;
  };
  clase?: {
    materia?: {
      nombre: string;
      codigo: string;
    };
    docente?: {
      nombre: string;
      apellido: string;
    };
  };
}

export interface CalificacionConDetalles extends Omit<Calificacion, 'estudiante' | 'clase'> {
  estudiante?: {
    nombre: string;
    apellido: string;
    grado?: string;
    seccion?: string;
  };
  clase?: {
    materia?: {
      nombre: string;
      codigo: string;
    };
    docente?: {
      nombre: string;
      apellido: string;
    };
  };
}

export interface EstudianteCompleto extends Estudiante {
  calificaciones?: Calificacion[];
  asistencias?: Asistencia[];
  seguimientos?: SeguimientoPsicologico[];
  inscripciones?: Inscripcion[];
}

