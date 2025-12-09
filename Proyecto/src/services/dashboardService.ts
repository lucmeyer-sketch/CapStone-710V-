import { supabase } from '../supabaseClient';
import { getClasesByDocente } from './claseService';
import { tieneClaseHoy } from '../utils/horarioUtils';

export interface EstadisticasDashboardDocente {
  totalEstudiantes: number; // Estudiantes en sus clases
  totalClases: number; // Clases asignadas
  tasaAsistencia: number; // Promedio de asistencia de sus estudiantes
  promedioGeneral: number; // Promedio general de calificaciones de sus estudiantes
  mensajesNoLeidos: number; // Mensajes no leídos dirigidos al docente
  clasesHoy: number; // Clases que tiene hoy
  estudiantesRecientes: number; // Estudiantes con actividad reciente
  calificacionesPendientes: number; // Calificaciones pendientes de ingresar
}

// obtener estadísticas del dashboard para un docente específico
export const getEstadisticasDashboardDocente = async (
  docenteId: number
): Promise<EstadisticasDashboardDocente> => {
  try {
    // 1) Obtener clases del docente
    const clases = await getClasesByDocente(docenteId.toString());
    const claseIds = clases.map(c => c.id);

    if (claseIds.length === 0) {
      return {
        totalEstudiantes: 0,
        totalClases: 0,
        tasaAsistencia: 0,
        promedioGeneral: 0,
        mensajesNoLeidos: 0,
        clasesHoy: 0,
        estudiantesRecientes: 0,
        calificacionesPendientes: 0
      };
    }

    // 2) Obtener estudiantes inscritos en sus clases
    const { data: inscripciones, error: inscripcionesError } = await supabase
      .from('inscripciones')
      .select('estudiante_id')
      .in('clase_id', claseIds)
      .eq('estado', 'activo');

    if (inscripcionesError) throw inscripcionesError;

    const estudianteIds = Array.from(
      new Set(inscripciones?.map(i => i.estudiante_id) || [])
    );
    const totalEstudiantes = estudianteIds.length;

    // 3) Calcular tasa de asistencia promedio (últimos 30 días) - solo de las clases del docente
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    const fechaInicio = hace30Dias.toISOString().split('T')[0];
    const fechaFin = new Date().toISOString().split('T')[0];

    let tasaAsistencia = 0;
    if (estudianteIds.length > 0 && claseIds.length > 0) {
      // Obtener todas las asistencias de los estudiantes en las clases del docente
      const { data: asistencias, error: asistenciasError } = await supabase
        .from('asistencia')
        .select('estado')
        .in('estudiante_id', estudianteIds)
        .in('clase_id', claseIds)
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin);

      if (!asistenciasError && asistencias && asistencias.length > 0) {
        const total = asistencias.length;
        const presentes = asistencias.filter(
          a => a.estado === 'presente' || a.estado === 'tarde'
        ).length;
        tasaAsistencia = (presentes / total) * 100;
      }
    }

    // 4) Calcular promedio general de calificaciones de sus estudiantes (solo de sus clases)
    let promedioGeneral = 0;
    if (estudianteIds.length > 0 && claseIds.length > 0) {
      // Obtener todas las calificaciones de los estudiantes en las clases del docente
      const { data: calificaciones, error: calificacionesError } = await supabase
        .from('calificaciones')
        .select('nota')
        .in('estudiante_id', estudianteIds)
        .in('clase_id', claseIds);

      if (!calificacionesError && calificaciones && calificaciones.length > 0) {
        const suma = calificaciones.reduce((acc, c) => acc + (c.nota || 0), 0);
        promedioGeneral = suma / calificaciones.length;
      }
    }

    // 5) Mensajes no leídos dirigidos al docente
    const { count: mensajesNoLeidos } = await supabase
      .from('mensajes')
      .select('*', { count: 'exact', head: true })
      .eq('destinatario_tipo', 'docente')
      .eq('destinatario_id', docenteId)
      .eq('leido', false);

    // 6) Clases de hoy (basado en horario real)
    const clasesHoy = clases.filter(c => 
      c.estado === 'activo' && tieneClaseHoy(c.horario)
    ).length;

    // 7) Estudiantes con actividad reciente (últimos 7 días)
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    const { data: asistenciasRecientes } = await supabase
      .from('asistencia')
      .select('estudiante_id')
      .in('clase_id', claseIds)
      .gte('fecha', hace7Dias.toISOString().split('T')[0]);

    const estudiantesRecientes = new Set(
      asistenciasRecientes?.map(a => a.estudiante_id) || []
    ).size;

    // 8) Calificaciones pendientes (estudiantes sin calificaciones recientes)
    // Por ahora, retornamos 0 (podríamos implementar lógica más compleja)
    const calificacionesPendientes = 0;

    return {
      totalEstudiantes,
      totalClases: clases.length,
      tasaAsistencia: Math.round(tasaAsistencia * 10) / 10,
      promedioGeneral: Math.round(promedioGeneral * 10) / 10,
      mensajesNoLeidos: mensajesNoLeidos || 0,
      clasesHoy,
      estudiantesRecientes,
      calificacionesPendientes
    };
  } catch (error) {
    console.error('Error al obtener estadísticas del docente:', error);
    throw error;
  }
};

