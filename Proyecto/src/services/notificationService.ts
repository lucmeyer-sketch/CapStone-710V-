import { supabase } from '../supabaseClient';

export interface Notificacion {
  id: string;
  tipo: 'info' | 'success' | 'warning' | 'error' | 'urgente';
  titulo: string;
  mensaje: string;
  icono: string;
  timestamp: Date;
  leida: boolean;
  accion?: {
    texto: string;
    link: string;
  };
  metadata?: {
    tabla: string;
    tipo_cambio: string;
    usuario?: string;
    detalles?: any;
  };
}

export interface EstadisticasDashboard {
  totalEstudiantes: number;
  totalDocentes: number;
  tasaAsistencia: number;
  promedioGeneral: number;
  usuariosActivos: number;
  mensajesNoLeidos: number;
  reportesGenerados: number;
  clasesHoy: number;
}

// generar ID único para notificaciones
const generarId = () => `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// obtener estadísticas del dashboard
export const getEstadisticasDashboard = async (): Promise<EstadisticasDashboard> => {
  try {
    // total estudiantes
    const { count: totalEstudiantes } = await supabase
      .from('Estudiantes')
      .select('*', { count: 'exact', head: true });

    // total docentes
    const { count: totalDocentes } = await supabase
      .from('docentes')
      .select('*', { count: 'exact', head: true });

    // calcular tasa de asistencia (últimos 30 días)
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    const { data: asistencias } = await supabase
      .from('asistencia')
      .select('estado')
      .gte('fecha', hace30Dias.toISOString().split('T')[0]);

    let tasaAsistencia = 0;
    if (asistencias && asistencias.length > 0) {
      const presentes = asistencias.filter(a => a.estado === 'presente').length;
      tasaAsistencia = (presentes / asistencias.length) * 100;
    }

    // promedio general de calificaciones
    const { data: calificaciones } = await supabase
      .from('calificaciones')
      .select('nota');

    let promedioGeneral = 0;
    if (calificaciones && calificaciones.length > 0) {
      const suma = calificaciones.reduce((acc, c) => acc + (c.nota || 0), 0);
      promedioGeneral = suma / calificaciones.length;
    }

    // usuarios activos (con sesión en las últimas 24 horas)
    const { count: usuariosActivos } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true);

    // mensajes no leídos
    const { count: mensajesNoLeidos } = await supabase
      .from('mensajes')
      .select('*', { count: 'exact', head: true })
      .eq('leido', false);

    // reportes generados
    const { count: reportesGenerados } = await supabase
      .from('reportes')
      .select('*', { count: 'exact', head: true });

    // clases hoy
    const hoy = new Date().toISOString().split('T')[0];
    const diaSemana = new Date().getDay(); // 0 = domingo, 1 = lunes, etc.
    
    const { count: clasesHoy } = await supabase
      .from('clases')
      .select('*', { count: 'exact', head: true })
      .eq('dia_semana', diaSemana);

    return {
      totalEstudiantes: totalEstudiantes || 0,
      totalDocentes: totalDocentes || 0,
      tasaAsistencia: Math.round(tasaAsistencia * 10) / 10,
      promedioGeneral: Math.round(promedioGeneral * 10) / 10,
      usuariosActivos: usuariosActivos || 0,
      mensajesNoLeidos: mensajesNoLeidos || 0,
      reportesGenerados: reportesGenerados || 0,
      clasesHoy: clasesHoy || 0
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

// obtener notificaciones recientes (simuladas por ahora)
export const getNotificacionesRecientes = async (limite: number = 10): Promise<Notificacion[]> => {
  const notificaciones: Notificacion[] = [];

  try {
    // notificaciones de asistencia reciente
    const { data: asistenciasRecientes } = await supabase
      .from('asistencia')
      .select(`
        *,
        estudiante:Estudiantes(nombre, apellido)
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    if (asistenciasRecientes) {
      asistenciasRecientes.forEach(asistencia => {
        const estudiante = `${asistencia.estudiante?.nombre} ${asistencia.estudiante?.apellido}`;
        
        if (asistencia.estado === 'ausente') {
          notificaciones.push({
            id: generarId(),
            tipo: 'warning',
            titulo: 'Ausencia Registrada',
            mensaje: `${estudiante} fue marcado ausente`,
            icono: '⚠️',
            timestamp: new Date(asistencia.created_at || Date.now()),
            leida: false,
            accion: {
              texto: 'Ver Detalles',
              link: '/attendance'
            },
            metadata: {
              tabla: 'asistencia',
              tipo_cambio: 'ausencia',
              detalles: asistencia
            }
          });
        } else if (asistencia.estado === 'presente') {
          notificaciones.push({
            id: generarId(),
            tipo: 'success',
            titulo: 'Asistencia Registrada',
            mensaje: `${estudiante} asistió a clase`,
            icono: '✅',
            timestamp: new Date(asistencia.created_at || Date.now()),
            leida: false,
            metadata: {
              tabla: 'asistencia',
              tipo_cambio: 'presente',
              detalles: asistencia
            }
          });
        }
      });
    }

    // notificaciones de calificaciones recientes
    const { data: calificacionesRecientes } = await supabase
      .from('calificaciones')
      .select(`
        *,
        estudiante:Estudiantes(nombre, apellido)
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    if (calificacionesRecientes) {
      calificacionesRecientes.forEach(calif => {
        const estudiante = `${calif.estudiante?.nombre} ${calif.estudiante?.apellido}`;
        const calificacion = calif.nota;
        
        let tipo: 'info' | 'success' | 'warning' | 'error' = 'success';
        let icono = '📝';
        
        if (calificacion >= 90) {
          tipo = 'success';
          icono = '🌟';
        } else if (calificacion >= 70) {
          tipo = 'info';
          icono = '📝';
        } else if (calificacion >= 50) {
          tipo = 'warning';
          icono = '⚠️';
        } else {
          tipo = 'error';
          icono = '🔴';
        }

        notificaciones.push({
          id: generarId(),
          tipo,
          titulo: 'Calificación Actualizada',
          mensaje: `${estudiante} obtuvo ${calificacion} puntos`,
          icono,
          timestamp: new Date(calif.created_at || Date.now()),
          leida: false,
          accion: {
            texto: 'Ver Calificaciones',
            link: '/students'
          },
          metadata: {
            tabla: 'calificaciones',
            tipo_cambio: 'nueva_calificacion',
            detalles: calif
          }
        });
      });
    }

    // notificaciones de mensajes recientes
    const { data: mensajesRecientes } = await supabase
      .from('mensajes')
      .select('*')
      .eq('leido', false)
      .order('created_at', { ascending: false })
      .limit(3);

    if (mensajesRecientes) {
      mensajesRecientes.forEach(mensaje => {
        let tipo: 'info' | 'warning' | 'urgente' = 'info';
        let icono = '💬';

        if (mensaje.tipo === 'urgente') {
          tipo = 'urgente';
          icono = '🚨';
        } else if (mensaje.tipo === 'conductual') {
          tipo = 'warning';
          icono = '⚠️';
        }

        notificaciones.push({
          id: generarId(),
          tipo,
          titulo: `Mensaje ${mensaje.tipo}: ${mensaje.asunto}`,
          mensaje: mensaje.mensaje.substring(0, 80) + (mensaje.mensaje.length > 80 ? '...' : ''),
          icono,
          timestamp: new Date(mensaje.created_at || Date.now()),
          leida: false,
          accion: {
            texto: 'Ver Mensaje',
            link: '/messages'
          },
          metadata: {
            tabla: 'mensajes',
            tipo_cambio: 'nuevo_mensaje',
            detalles: mensaje
          }
        });
      });
    }

    // notificaciones de reportes recientes
    const { data: reportesRecientes } = await supabase
      .from('reportes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(2);

    if (reportesRecientes) {
      reportesRecientes.forEach(reporte => {
        notificaciones.push({
          id: generarId(),
          tipo: 'info',
          titulo: 'Reporte Generado',
          mensaje: `${reporte.titulo} - ${reporte.tipo_reporte}`,
          icono: '📊',
          timestamp: new Date(reporte.created_at || Date.now()),
          leida: false,
          accion: {
            texto: 'Ver Reporte',
            link: '/reports'
          },
          metadata: {
            tabla: 'reportes',
            tipo_cambio: 'nuevo_reporte',
            detalles: reporte
          }
        });
      });
    }

    // ordenar por timestamp descendente
    notificaciones.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return notificaciones.slice(0, limite);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return [];
  }
};

// suscribirse a cambios en tiempo real
export const suscribirseACambios = (
  onNuevaNotificacion: (notificacion: Notificacion) => void
) => {
  // suscripción a cambios en asistencia
  const asistenciaSubscription = supabase
    .channel('asistencia-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'asistencia' },
      async (payload) => {
        console.log('Cambio en asistencia:', payload);
        
        // obtener detalles del estudiante
        if (payload.new && 'estudiante_id' in payload.new) {
          const { data: estudiante } = await supabase
            .from('Estudiantes')
            .select('nombre, apellido')
            .eq('id', payload.new.estudiante_id)
            .single();

          if (estudiante) {
            const nombreCompleto = `${estudiante.nombre} ${estudiante.apellido}`;
            let tipo: 'success' | 'warning' = 'success';
            let titulo = 'Asistencia Registrada';
            let icono = '✅';

            if (payload.new.estado === 'ausente') {
              tipo = 'warning';
              titulo = 'Ausencia Registrada';
              icono = '⚠️';
            }

            onNuevaNotificacion({
              id: generarId(),
              tipo,
              titulo,
              mensaje: `${nombreCompleto} - ${payload.new.estado}`,
              icono,
              timestamp: new Date(),
              leida: false,
              accion: {
                texto: 'Ver Detalles',
                link: '/attendance'
              },
              metadata: {
                tabla: 'asistencia',
                tipo_cambio: payload.eventType,
                detalles: payload.new
              }
            });
          }
        }
      }
    )
    .subscribe();

  // suscripción a cambios en calificaciones
  const calificacionesSubscription = supabase
    .channel('calificaciones-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'calificaciones' },
      async (payload) => {
        console.log('Cambio en calificaciones:', payload);
        
        if (payload.new && 'estudiante_id' in payload.new) {
          const { data: estudiante } = await supabase
            .from('Estudiantes')
            .select('nombre, apellido')
            .eq('id', payload.new.estudiante_id)
            .single();

          if (estudiante) {
            const nombreCompleto = `${estudiante.nombre} ${estudiante.apellido}`;
            const calificacion = payload.new.nota;
            
            let tipo: 'success' | 'warning' | 'error' = 'success';
            let icono = '📝';
            
            if (calificacion >= 90) {
              tipo = 'success';
              icono = '🌟';
            } else if (calificacion < 50) {
              tipo = 'error';
              icono = '🔴';
            } else if (calificacion < 70) {
              tipo = 'warning';
              icono = '⚠️';
            }

            onNuevaNotificacion({
              id: generarId(),
              tipo,
              titulo: 'Calificación Actualizada',
              mensaje: `${nombreCompleto} obtuvo ${calificacion} puntos`,
              icono,
              timestamp: new Date(),
              leida: false,
              accion: {
                texto: 'Ver Calificaciones',
                link: '/students'
              },
              metadata: {
                tabla: 'calificaciones',
                tipo_cambio: payload.eventType,
                detalles: payload.new
              }
            });
          }
        }
      }
    )
    .subscribe();

  // suscripción a mensajes nuevos
  const mensajesSubscription = supabase
    .channel('mensajes-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'mensajes' },
      (payload) => {
        console.log('Nuevo mensaje:', payload);
        
        if (payload.new) {
          let tipo: 'info' | 'warning' | 'urgente' = 'info';
          let icono = '💬';

          if (payload.new.tipo === 'urgente') {
            tipo = 'urgente';
            icono = '🚨';
          } else if (payload.new.tipo === 'conductual') {
            tipo = 'warning';
            icono = '⚠️';
          }

          onNuevaNotificacion({
            id: generarId(),
            tipo,
            titulo: `Mensaje ${payload.new.tipo}: ${payload.new.asunto}`,
            mensaje: payload.new.mensaje.substring(0, 80) + '...',
            icono,
            timestamp: new Date(),
            leida: false,
            accion: {
              texto: 'Ver Mensaje',
              link: '/messages'
            },
            metadata: {
              tabla: 'mensajes',
              tipo_cambio: 'INSERT',
              detalles: payload.new
            }
          });
        }
      }
    )
    .subscribe();

  // retornar función para desuscribirse
  return () => {
    asistenciaSubscription.unsubscribe();
    calificacionesSubscription.unsubscribe();
    mensajesSubscription.unsubscribe();
  };
};

