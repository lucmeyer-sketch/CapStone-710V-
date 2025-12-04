import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getEstadisticasDashboard,
  getNotificacionesRecientes,
  suscribirseACambios,
  Notificacion,
  EstadisticasDashboard
} from '../../services/notificationService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState<EstadisticasDashboard>({
    totalEstudiantes: 0,
    totalDocentes: 0,
    tasaAsistencia: 0,
    promedioGeneral: 0,
    usuariosActivos: 0,
    mensajesNoLeidos: 0,
    reportesGenerados: 0,
    clasesHoy: 0
  });
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();

    // suscribirse a cambios en tiempo real
    const unsub = suscribirseACambios((nuevaNotificacion) => {
      setNotificaciones(prev => [nuevaNotificacion, ...prev].slice(0, 15));
      
      // mostrar notificación
      console.log('🔔 Nueva notificación:', nuevaNotificacion);
      
      // recargar estadísticas cuando hay cambios importantes
      if (nuevaNotificacion.metadata?.tabla === 'asistencia' || 
          nuevaNotificacion.metadata?.tabla === 'calificaciones') {
        cargarEstadisticas();
      }
    });

    return () => {
      unsub();
    };
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarEstadisticas(),
        cargarNotificaciones()
      ]);
    } catch (err: any) {
      setError('Error al cargar datos del dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    const stats = await getEstadisticasDashboard();
    setEstadisticas(stats);
  };

  const cargarNotificaciones = async () => {
    const notifs = await getNotificacionesRecientes(15);
    setNotificaciones(notifs);
  };

  const formatearTiempo = (fecha: Date) => {
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) return 'Justo ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const handleNotificacionClick = (notificacion: Notificacion) => {
    if (notificacion.accion) {
      navigate(notificacion.accion.link);
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return { bg: '#d1fae5', border: '#a7f3d0', text: '#065f46' };
      case 'info':
        return { bg: '#dbeafe', border: '#bfdbfe', text: '#1e40af' };
      case 'warning':
        return { bg: '#fef3c7', border: '#fde68a', text: '#92400e' };
      case 'error':
        return { bg: '#fee2e2', border: '#fecaca', text: '#991b1b' };
      case 'urgente':
        return { bg: '#fce7f3', border: '#fbcfe8', text: '#9f1239' };
      default:
        return { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' };
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ fontSize: '48px' }}>⏳</div>
        <p style={{ color: '#6b7280' }}>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: 'calc(100vh - 80px)' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1f2937', marginBottom: '8px' }}>
          📊 Dashboard Institucional
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>
          Monitoreo en tiempo real de actividades académicas
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Estadísticas Principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <StatCard
          icon="🎓"
          title="Total Estudiantes"
          value={estadisticas.totalEstudiantes}
          color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          link="/students"
        />
        <StatCard
          icon="👨‍🏫"
          title="Total Docentes"
          value={estadisticas.totalDocentes}
          color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          icon="📈"
          title="Tasa de Asistencia"
          value={`${estadisticas.tasaAsistencia}%`}
          subtitle={`${estadisticas.tasaAsistencia >= 80 ? 'Excelente' : estadisticas.tasaAsistencia >= 60 ? 'Buena' : 'Requiere atención'}`}
          color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          progress={estadisticas.tasaAsistencia}
          link="/attendance"
        />
        <StatCard
          icon="📝"
          title="Promedio General"
          value={estadisticas.promedioGeneral.toFixed(1)}
          subtitle={estadisticas.promedioGeneral >= 70 ? '🌟 Sobresaliente' : '📚 Regular'}
          color="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
        />
        <StatCard
          icon="👥"
          title="Usuarios Activos"
          value={estadisticas.usuariosActivos}
          color="linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
        />
        <StatCard
          icon="💬"
          title="Mensajes Sin Leer"
          value={estadisticas.mensajesNoLeidos}
          color="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
          alert={estadisticas.mensajesNoLeidos > 0}
          link="/messages"
        />
        <StatCard
          icon="📊"
          title="Reportes Generados"
          value={estadisticas.reportesGenerados}
          color="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
          link="/reports"
        />
        <StatCard
          icon="📅"
          title="Clases Hoy"
          value={estadisticas.clasesHoy}
          color="linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
        />
      </div>

      {/* Estado del Sistema */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ color: '#10b981' }}>🟢</span>
          Estado del Sistema
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <StatusItem label="Servidor" status="Activo" type="success" />
          <StatusItem label="Base de Datos" status="Conectada" type="success" />
          <StatusItem label="Backup" status="Actualizado" type="success" />
          <StatusItem 
            label="Última Sincronización" 
            status={`${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`} 
            type="info" 
          />
        </div>
      </div>

      {/* Notificaciones en Tiempo Real */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🔔 Notificaciones en Tiempo Real
            {notificaciones.length > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                {notificaciones.length}
              </span>
            )}
          </h2>
          <button
            onClick={cargarNotificaciones}
            style={{
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          >
            🔄 Actualizar
          </button>
        </div>

        {notificaciones.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#9ca3af'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
            <p style={{ fontSize: '16px', fontWeight: '500', color: '#6b7280' }}>
              No hay notificaciones recientes
            </p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Los cambios en la base de datos aparecerán aquí automáticamente
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notificaciones.map((notif) => {
              const colores = getTipoColor(notif.tipo);
              
              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificacionClick(notif)}
                  style={{
                    padding: '16px',
                    backgroundColor: colores.bg,
                    border: `1px solid ${colores.border}`,
                    borderLeft: `4px solid ${colores.text}`,
                    borderRadius: '12px',
                    cursor: notif.accion ? 'pointer' : 'default',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (notif.accion) {
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (notif.accion) {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                    <div style={{ fontSize: '24px', flexShrink: 0 }}>
                      {notif.icono}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          fontWeight: '700',
                          color: colores.text,
                          fontSize: '14px'
                        }}>
                          {notif.titulo}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          flexShrink: 0,
                          marginLeft: '12px'
                        }}>
                          {formatearTiempo(notif.timestamp)}
                        </span>
                      </div>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: colores.text,
                        opacity: 0.9
                      }}>
                        {notif.mensaje}
                      </p>
                      {notif.accion && (
                        <button style={{
                          marginTop: '8px',
                          backgroundColor: 'rgba(255,255,255,0.6)',
                          border: `1px solid ${colores.border}`,
                          color: colores.text,
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}>
                          {notif.accion.texto} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// componente para las tarjetas de estadísticas
const StatCard: React.FC<{
  icon: string;
  title: string;
  value: number | string;
  subtitle?: string;
  color: string;
  progress?: number;
  alert?: boolean;
  link?: string;
}> = ({ icon, title, value, subtitle, color, progress, alert, link }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={link ? () => navigate(link) : undefined}
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        cursor: link ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseOver={(e) => {
        if (link) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
        }
      }}
      onMouseOut={(e) => {
        if (link) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }
      }}
    >
      {/* Decoración de fondo */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        background: color,
        opacity: 0.1,
        borderRadius: '50%'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {icon}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>
            {title}
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#1f2937', lineHeight: 1 }}>
            {value}
            {alert && (
              <span style={{
                marginLeft: '8px',
                fontSize: '16px'
              }}>
                🔴
              </span>
            )}
          </div>
          {subtitle && (
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              {subtitle}
            </div>
          )}
          {progress !== undefined && (
            <div style={{
              marginTop: '8px',
              height: '6px',
              backgroundColor: '#e5e7eb',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: color,
                transition: 'width 0.5s ease'
              }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// componente para el estado del sistema
const StatusItem: React.FC<{
  label: string;
  status: string;
  type: 'success' | 'warning' | 'error' | 'info';
}> = ({ label, status, type }) => {
  const colors = {
    success: { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
    warning: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
    error: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
    info: { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' }
  };

  const color = colors[type];

  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>{label}</span>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: color.bg,
        color: color.text,
        padding: '4px 12px',
        borderRadius: '16px',
        fontSize: '13px',
        fontWeight: '600'
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          backgroundColor: color.dot,
          borderRadius: '50%',
          display: 'inline-block'
        }} />
        {status}
      </div>
    </div>
  );
};

export default Dashboard;