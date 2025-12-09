import React, { useState, useEffect } from 'react';
import { getCalificacionesByEstudiante } from '../../services/calificacionService';
import { getPorcentajeAsistenciaEstudiante, getAsistenciaByEstudiante } from '../../services/asistenciaService';
import { getClasesByEstudiante } from '../../services/studentService';
import { getConversacionesEstudiante } from '../../services/mensajeService';

interface CalificacionReciente {
  materia: string;
  nota: number;
  color: string;
}

interface AsistenciaReciente {
  dia: string;
  estado: string;
  color: string;
  icon: string;
}

const StudentDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [promedioGeneral, setPromedioGeneral] = useState<number>(0);
  const [porcentajeAsistencia, setPorcentajeAsistencia] = useState<number>(0);
  const [numMaterias, setNumMaterias] = useState<number>(0);
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState<number>(0);
  const [calificacionesRecientes, setCalificacionesRecientes] = useState<CalificacionReciente[]>([]);
  const [asistenciasRecientes, setAsistenciasRecientes] = useState<AsistenciaReciente[]>([]);
  const [nombreEstudiante, setNombreEstudiante] = useState<string>('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // obtener usuario desde localStorage
        const usuarioGuardado = localStorage.getItem('usuario');
        if (!usuarioGuardado) {
          setLoading(false);
          return;
        }

        const usuario = JSON.parse(usuarioGuardado);
        const estudianteId = usuario.detalles?.id;

        if (!estudianteId) {
          setLoading(false);
          return;
        }

        // obtener nombre del estudiante
        const nombre = usuario.detalles?.nombre || '';
        const apellido = usuario.detalles?.apellido || '';
        setNombreEstudiante(`${nombre} ${apellido}`.trim() || 'Estudiante');

        // calcular fechas para estadísticas
        const hoy = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        const fechaInicio = hace30Dias.toISOString().split('T')[0];
        const fechaFin = hoy.toISOString().split('T')[0];

        // cargar datos en paralelo
        const [
          calificaciones,
          asistenciaPorcentaje,
          clases,
          conversaciones
        ] = await Promise.all([
          getCalificacionesByEstudiante(estudianteId.toString()),
          getPorcentajeAsistenciaEstudiante(estudianteId.toString(), fechaInicio, fechaFin),
          getClasesByEstudiante(estudianteId),
          getConversacionesEstudiante(estudianteId)
        ]);

        // calcular promedio general
        if (calificaciones.length > 0) {
          const suma = calificaciones.reduce((acc, cal) => acc + (cal.nota || 0), 0);
          const promedio = suma / calificaciones.length;
          setPromedioGeneral(Math.round(promedio * 10) / 10);
        }

        // porcentaje de asistencia
        setPorcentajeAsistencia(Math.round(asistenciaPorcentaje));

        // número de materias
        setNumMaterias(clases.length);

        // mensajes no leídos
        const totalNoLeidos = conversaciones.reduce((acc, conv) => acc + conv.mensajes_no_leidos, 0);
        setMensajesNoLeidos(totalNoLeidos);

        // calificaciones recientes (últimas 4)
        const calificacionesOrdenadas = [...calificaciones]
          .sort((a, b) => {
            const fechaA = new Date(a.fecha_evaluacion || '').getTime();
            const fechaB = new Date(b.fecha_evaluacion || '').getTime();
            return fechaB - fechaA;
          })
          .slice(0, 4);

        const calificacionesFormateadas: CalificacionReciente[] = calificacionesOrdenadas.map(cal => {
          const nota = cal.nota || 0;
          const color = nota >= 6.0 ? '#10b981' : nota >= 4.0 ? '#f59e0b' : '#ef4444';
          return {
            materia: cal.clase?.materia?.nombre || 'Sin materia',
            nota: Math.round(nota * 10) / 10,
            color
          };
        });
        setCalificacionesRecientes(calificacionesFormateadas);

        // asistencia reciente (últimos 4 días)
        const asistencias = await getAsistenciaByEstudiante(estudianteId.toString());
        const asistenciasOrdenadas = [...asistencias]
          .sort((a, b) => {
            const fechaA = new Date(a.fecha || '').getTime();
            const fechaB = new Date(b.fecha || '').getTime();
            return fechaB - fechaA;
          })
          .slice(0, 4);

        const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const asistenciasFormateadas: AsistenciaReciente[] = asistenciasOrdenadas.map(asist => {
          const fecha = new Date(asist.fecha || '');
          const diaSemana = nombresDias[fecha.getDay()];
          const dia = fecha.getDate();
          const mes = fecha.getMonth() + 1;
          const fechaFormateada = `${diaSemana} ${dia}/${mes}`;

          let estado = 'Sin registro';
          let color = '#6b7280';
          let icon = '○';

          switch (asist.estado) {
            case 'presente':
              estado = 'Presente';
              color = '#10b981';
              icon = '✓';
              break;
            case 'tarde':
              estado = 'Tarde';
              color = '#f59e0b';
              icon = '⏰';
              break;
            case 'ausente':
              estado = 'Ausente';
              color = '#ef4444';
              icon = '✗';
              break;
            case 'justificado':
              estado = 'Justificado';
              color = '#3b82f6';
              icon = '📝';
              break;
          }

          return {
            dia: fechaFormateada,
            estado,
            color,
            icon
          };
        });
        setAsistenciasRecientes(asistenciasFormateadas);

      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // generar mensaje de bienvenida personalizado
  const generarMensajeBienvenida = (): string => {
    const mensajes: string[] = [];
    
    if (mensajesNoLeidos > 0) {
      mensajes.push(`${mensajesNoLeidos} mensaje${mensajesNoLeidos > 1 ? 's' : ''} nuevo${mensajesNoLeidos > 1 ? 's' : ''}`);
    }

    if (calificacionesRecientes.length > 0) {
      mensajes.push(`${calificacionesRecientes.length} calificación${calificacionesRecientes.length > 1 ? 'es' : ''} reciente${calificacionesRecientes.length > 1 ? 's' : ''}`);
    }

    if (mensajes.length === 0) {
      return '¡Sigue así con tu excelente trabajo!';
    }

    return `Tienes ${mensajes.join(' y ')}. ${porcentajeAsistencia >= 90 ? '¡Excelente asistencia!' : 'Continúa esforzándote!'} 🎉`;
  };

  if (loading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>⏳</div>
          <p style={{ color: '#6b7280' }}>Cargando tu panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1a1a1a',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          🎓 Panel del Estudiante
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          {nombreEstudiante ? `Bienvenido${nombreEstudiante.includes(' ') ? '' : ', '} ${nombreEstudiante}` : 'Bienvenido a tu panel personalizado'}
        </p>
      </div>

      {/* Estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: '#ede9fe',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #ddd6fe',
          boxShadow: '0 2px 4px rgba(124, 58, 237, 0.1)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#7c3aed' }}>
            {promedioGeneral > 0 ? `${promedioGeneral.toFixed(1)}` : 'N/A'}
          </div>
          <div style={{ fontSize: '13px', color: '#6d28d9', fontWeight: '500' }}>Promedio General</div>
        </div>

        <div style={{
          backgroundColor: '#d1fae5',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #a7f3d0',
          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#059669' }}>
            {porcentajeAsistencia}%
          </div>
          <div style={{ fontSize: '13px', color: '#047857', fontWeight: '500' }}>Asistencia</div>
        </div>

        <div style={{
          backgroundColor: '#dbeafe',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #bfdbfe',
          boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb' }}>
            {numMaterias}
          </div>
          <div style={{ fontSize: '13px', color: '#1d4ed8', fontWeight: '500' }}>Materias</div>
        </div>

        <div style={{
          backgroundColor: '#fef3c7',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #fde68a',
          boxShadow: '0 2px 4px rgba(217, 119, 6, 0.1)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#d97706' }}>
            {mensajesNoLeidos}
          </div>
          <div style={{ fontSize: '13px', color: '#b45309', fontWeight: '500' }}>Mensajes</div>
        </div>
      </div>

      {/* Secciones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Mis Calificaciones */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            📊 Mis Calificaciones Recientes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {calificacionesRecientes.length > 0 ? (
              calificacionesRecientes.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    {item.materia}
                  </span>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: item.color
                  }}>
                    {item.nota.toFixed(1)}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                No hay calificaciones recientes
              </div>
            )}
          </div>
        </div>

        {/* Mi Asistencia */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            📅 Mi Asistencia
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {asistenciasRecientes.length > 0 ? (
              asistenciasRecientes.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    {item.dia}
                  </span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {item.icon} {item.estado}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                No hay registros de asistencia recientes
              </div>
            )}
          </div>
        </div>

        {/* Tareas Pendientes */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            📝 Tareas Pendientes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
              Próximamente: sistema de tareas
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de Bienvenida */}
      <div style={{
        marginTop: '24px',
        backgroundColor: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ fontSize: '48px' }}>👋</div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#0369a1', marginBottom: '4px' }}>
            ¡Bienvenido de vuelta{nombreEstudiante ? `, ${nombreEstudiante.split(' ')[0]}` : ''}!
          </div>
          <div style={{ fontSize: '14px', color: '#075985' }}>
            {generarMensajeBienvenida()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
