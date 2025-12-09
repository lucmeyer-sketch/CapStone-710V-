import { supabase } from '../supabaseClient';
import { getEstadisticasAsistencia } from './asistenciaService';
import { getPromedioGeneralEstudiante } from './calificacionService';

export interface ReporteGenerado {
  id: number;
  titulo: string;
  tipo: 'asistencia' | 'academico' | 'conductual' | 'general';
  fecha_generacion: string;
  periodo: string;
  grado?: string;
  seccion?: string;
  datos: any;
}

// generar reporte de asistencia
export const generarReporteAsistencia = async (
  fechaInicio: string,
  fechaFin: string,
  grado?: string,
  seccion?: string,
  gradosPermitidos?: string[],
  seccionesPermitidas?: string[]
): Promise<any> => {
  try {
    // determinar estudiantes válidos según filtros y permisos
    let estudiantesQuery = supabase
      .from('Estudiantes')
      .select('id, grado, seccion');

    if (grado) estudiantesQuery = estudiantesQuery.eq('grado', grado);
    if (seccion) estudiantesQuery = estudiantesQuery.eq('seccion', seccion);
    if (gradosPermitidos && gradosPermitidos.length > 0) {
      estudiantesQuery = estudiantesQuery.in('grado', gradosPermitidos);
    }
    if (seccionesPermitidas && seccionesPermitidas.length > 0) {
      estudiantesQuery = estudiantesQuery.in('seccion', seccionesPermitidas);
    }

    const { data: estudiantesFiltrados, error: estudiantesError } = await estudiantesQuery;
    if (estudiantesError) throw estudiantesError;

    const idsFiltrados = (estudiantesFiltrados || []).map((e) => e.id);

    // obtener asistencias del período para los estudiantes permitidos
    let query = supabase
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
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);

    if (idsFiltrados.length > 0) {
      query = query.in('estudiante_id', idsFiltrados);
    }

    const { data: asistencias, error } = await query;
    if (error) throw error;

    // calcular estadísticas por estudiante
    const estudiantesStats = new Map();
    let presente = 0;
    let tarde = 0;
    let ausente = 0;
    let justificado = 0;

    asistencias?.forEach(asistencia => {
      const estudianteId = asistencia.estudiante_id;
      if (!estudiantesStats.has(estudianteId)) {
        estudiantesStats.set(estudianteId, {
          estudiante: asistencia.estudiante,
          presente: 0,
          ausente: 0,
          tarde: 0,
          justificado: 0,
          total: 0
        });
      }
      const studentStats = estudiantesStats.get(estudianteId);
      studentStats[asistencia.estado]++;
      studentStats.total++;

      // acumular totales generales
      if (asistencia.estado === 'presente') presente++;
      if (asistencia.estado === 'tarde') tarde++;
      if (asistencia.estado === 'ausente') ausente++;
      if (asistencia.estado === 'justificado') justificado++;
    });

    const totalGeneral = presente + tarde + ausente + justificado;
    const porcentajeAsistencia = totalGeneral > 0
      ? Math.round(((presente + tarde) / totalGeneral) * 1000) / 10
      : 0;

    return {
      periodo: { fechaInicio, fechaFin },
      filtros: { 
        grado, 
        seccion,
        gradosAplicados: gradosPermitidos,
        seccionesAplicadas: seccionesPermitidas
      },
      estadisticasGenerales: {
        presente,
        tarde,
        ausente,
        justificado,
        total: totalGeneral,
        porcentajeAsistencia
      },
      porEstudiante: Array.from(estudiantesStats.values()),
      totalRegistros: asistencias?.length || 0
    };
  } catch (error) {
    console.error('Error generando reporte de asistencia:', error);
    throw error;
  }
};

// generar reporte académico
export const generarReporteAcademico = async (
  grado?: string,
  seccion?: string,
  gradosPermitidos?: string[],
  seccionesPermitidas?: string[]
): Promise<any> => {
  try {
    // obtener estudiantes
    let query = supabase.from('Estudiantes').select('*');
    
    if (grado) query = query.eq('grado', grado);
    if (seccion) query = query.eq('seccion', seccion);
    if (gradosPermitidos && gradosPermitidos.length > 0) {
      query = query.in('grado', gradosPermitidos);
    }
    if (seccionesPermitidas && seccionesPermitidas.length > 0) {
      query = query.in('seccion', seccionesPermitidas);
    }

    const { data: estudiantes, error: estudiantesError } = await query;
    if (estudiantesError) throw estudiantesError;

    // obtener calificaciones para cada estudiante
    const estudiantesConNotas = await Promise.all(
      (estudiantes || []).map(async (estudiante) => {
        const { data: calificaciones } = await supabase
          .from('calificaciones')
          .select(`
            *,
            clase:clases (
              materia:materias (
                nombre,
                codigo
              )
            )
          `)
          .eq('estudiante_id', estudiante.id);

        // calcular promedio general
        const promedio = calificaciones && calificaciones.length > 0
          ? (calificaciones.reduce((sum, cal) => sum + cal.nota, 0) / calificaciones.length).toFixed(1)
          : 0;

        // calcular promedios por materia
        const promediosPorMateria = new Map();
        calificaciones?.forEach(cal => {
          const materiaNombre = cal.clase?.materia?.nombre || 'Sin materia';
          if (!promediosPorMateria.has(materiaNombre)) {
            promediosPorMateria.set(materiaNombre, { suma: 0, count: 0 });
          }
          const materia = promediosPorMateria.get(materiaNombre);
          materia.suma += cal.nota;
          materia.count++;
        });

        const materias = Array.from(promediosPorMateria.entries()).map(([nombre, data]) => ({
          materia: nombre,
          promedio: (data.suma / data.count).toFixed(1),
          evaluaciones: data.count
        }));

        return {
          estudiante: {
            nombre: estudiante.nombre,
            apellido: estudiante.apellido,
            grado: estudiante.grado,
            seccion: estudiante.seccion
          },
          promedioGeneral: promedio,
          totalEvaluaciones: calificaciones?.length || 0,
          materias
        };
      })
    );

    // calcular estadísticas generales
    const promediosCurso = estudiantesConNotas.map(e => parseFloat(e.promedioGeneral as string));
    const promedioGeneralCurso = promediosCurso.length > 0
      ? (promediosCurso.reduce((sum, p) => sum + p, 0) / promediosCurso.length).toFixed(1)
      : 0;

    return {
      filtros: { grado, seccion },
      estadisticasGenerales: {
        totalEstudiantes: estudiantes?.length || 0,
        promedioGeneralCurso,
        promedioMasAlto: Math.max(...promediosCurso, 0).toFixed(1),
        promedioMasBajo: Math.min(...promediosCurso, 7.0).toFixed(1)
      },
      estudiantes: estudiantesConNotas
    };
  } catch (error) {
    console.error('Error generando reporte académico:', error);
    throw error;
  }
};

// obtener lista de reportes guardados (simulado por ahora)
export const obtenerReportesGuardados = async (): Promise<ReporteGenerado[]> => {
  // por ahora retornamos reportes de ejemplo
  // en el futuro podrías guardar los reportes en la tabla 'reportes' de la BD
  return [
    {
      id: 1,
      titulo: 'Reporte de Asistencia - Último Mes',
      tipo: 'asistencia',
      fecha_generacion: new Date().toISOString(),
      periodo: 'Noviembre 2024',
      datos: {}
    },
    {
      id: 2,
      titulo: 'Reporte Académico - 10° A',
      tipo: 'academico',
      fecha_generacion: new Date().toISOString(),
      periodo: '2024',
      grado: '10°',
      seccion: 'A',
      datos: {}
    }
  ];
};

// guardar reporte en la base de datos
export const guardarReporte = async (
  titulo: string,
  tipo: 'asistencia' | 'academico' | 'conductual' | 'general',
  periodo: string,
  contenido: any
): Promise<void> => {
  const { error } = await supabase
    .from('reportes')
    .insert({
      titulo,
      tipo_reporte: tipo,
      periodo,
      contenido: JSON.stringify(contenido),
      generado_por_tipo: 'sistema'
    });

  if (error) throw error;
};

