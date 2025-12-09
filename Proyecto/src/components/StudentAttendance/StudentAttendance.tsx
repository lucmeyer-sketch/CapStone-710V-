import React, { useState, useEffect } from 'react';
import { getClasesByEstudiante } from '../../services/studentService';
import { getAsistenciaByEstudiante } from '../../services/asistenciaService';
import { Asistencia } from '../../types/database';
import { Clase } from '../../types/database';

interface ClaseConDetalles extends Omit<Clase, 'docente' | 'materia'> {
  materia?: {
    id: number;
    nombre: string;
    codigo: string;
  };
  docente?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  inscripcion_id?: number;
}

const StudentAttendance: React.FC = () => {
  const [clases, setClases] = useState<ClaseConDetalles[]>([]);
  const [claseSeleccionada, setClaseSeleccionada] = useState<ClaseConDetalles | null>(null);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [semanaActual, setSemanaActual] = useState<Date>(new Date());
  const [estudianteId, setEstudianteId] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    cargarEstudianteId();
  }, []);

  useEffect(() => {
    if (estudianteId) {
      cargarClases();
    }
  }, [estudianteId]);

  useEffect(() => {
    if (claseSeleccionada && estudianteId) {
      cargarAsistencias();
    }
  }, [claseSeleccionada, estudianteId, semanaActual]);

  const cargarEstudianteId = async () => {
    try {
      const usuarioGuardado = localStorage.getItem('usuario');
      if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        if (usuario.detalles?.id) {
          setEstudianteId(usuario.detalles.id);
        }
      }
    } catch (err) {
      console.error('Error al cargar estudiante:', err);
    }
  };

  const cargarClases = async () => {
    if (!estudianteId) return;
    
    try {
      setLoading(true);
      const clasesData = await getClasesByEstudiante(estudianteId);
      setClases(clasesData);
      setError(null);
    } catch (err: any) {
      setError('Error al cargar clases: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarAsistencias = async () => {
    if (!claseSeleccionada || !estudianteId) return;

    try {
      setLoading(true);
      const asistenciasData = await getAsistenciaByEstudiante(estudianteId.toString());
      const asistenciasFiltradas = asistenciasData.filter(
        asist => asist.clase_id === claseSeleccionada.id
      );
      setAsistencias(asistenciasFiltradas);
      setError(null);
    } catch (err: any) {
      setError('Error al cargar asistencias: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // funciones para navegar semanas con animaciones
  const obtenerInicioSemana = (fecha: Date): Date => {
    const inicio = new Date(fecha);
    const dia = inicio.getDay();
    const diff = inicio.getDate() - dia + (dia === 0 ? -6 : 1);
    inicio.setDate(diff);
    inicio.setHours(0, 0, 0, 0);
    return inicio;
  };

  const obtenerDiasSemana = (fecha: Date): Date[] => {
    const inicio = obtenerInicioSemana(fecha);
    const dias: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicio);
      dia.setDate(inicio.getDate() + i);
      dias.push(dia);
    }
    return dias;
  };

  const cambiarSemana = (direccion: 'anterior' | 'siguiente') => {
    setAnimating(true);
    setSlideDirection(direccion === 'anterior' ? 'left' : 'right');
    
    setTimeout(() => {
      const nuevaFecha = new Date(semanaActual);
      if (direccion === 'anterior') {
        nuevaFecha.setDate(nuevaFecha.getDate() - 7);
      } else {
        nuevaFecha.setDate(nuevaFecha.getDate() + 7);
      }
      setSemanaActual(nuevaFecha);
      
      setTimeout(() => {
        setAnimating(false);
        setSlideDirection(null);
      }, 300);
    }, 150);
  };

  const semanaAnterior = () => cambiarSemana('anterior');
  const semanaSiguiente = () => cambiarSemana('siguiente');

  const irAHoy = () => {
    const hoy = new Date();
    if (obtenerInicioSemana(hoy).getTime() !== obtenerInicioSemana(semanaActual).getTime()) {
      setAnimating(true);
      setSlideDirection('right');
      setTimeout(() => {
        setSemanaActual(hoy);
        setTimeout(() => {
          setAnimating(false);
          setSlideDirection(null);
        }, 300);
      }, 150);
    }
  };

  // obtener asistencia para un día específico
  const obtenerAsistenciaDia = (fecha: Date): Asistencia | undefined => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return asistencias.find(asist => asist.fecha === fechaStr);
  };

  // obtener estadísticas de la semana
  const obtenerEstadisticasSemana = () => {
    const diasSemana = obtenerDiasSemana(semanaActual);
    const asistenciasSemana = diasSemana.map(dia => obtenerAsistenciaDia(dia)).filter(Boolean);
    
    const presente = asistenciasSemana.filter(a => a?.estado === 'presente').length;
    const tarde = asistenciasSemana.filter(a => a?.estado === 'tarde').length;
    const ausente = asistenciasSemana.filter(a => a?.estado === 'ausente').length;
    const justificado = asistenciasSemana.filter(a => a?.estado === 'justificado').length;
    const total = asistenciasSemana.length;
    
    return { presente, tarde, ausente, justificado, total };
  };

  // obtener color según estado de asistencia
  const obtenerColorAsistencia = (estado?: string): string => {
    switch (estado) {
      case 'presente':
        return '#10b981';
      case 'tarde':
        return '#f59e0b';
      case 'ausente':
        return '#ef4444';
      case 'justificado':
        return '#6366f1';
      default:
        return '#e5e7eb';
    }
  };

  // obtener icono según estado de asistencia
  const obtenerIconoAsistencia = (estado?: string): string => {
    switch (estado) {
      case 'presente':
        return '✓';
      case 'tarde':
        return '⏰';
      case 'ausente':
        return '✗';
      case 'justificado':
        return '📝';
      default:
        return '○';
    }
  };

  // obtener porcentaje de asistencia
  const obtenerPorcentajeAsistencia = (): number => {
    const stats = obtenerEstadisticasSemana();
    if (stats.total === 0) return 0;
    const asistio = stats.presente + stats.tarde + stats.justificado;
    return Math.round((asistio / stats.total) * 100);
  };

  const diasSemana = obtenerDiasSemana(semanaActual);
  const nombresDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const nombresDiasCortos = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const estadisticas = obtenerEstadisticasSemana();
  const porcentajeAsistencia = obtenerPorcentajeAsistencia();

  if (loading && clases.length === 0) {
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
          <p style={{ color: '#6b7280' }}>Cargando tus clases...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1a1a1a',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          📅 Mi Asistencia
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Consulta tu asistencia por clase y semana
        </p>
      </div>

      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          marginBottom: '24px',
          color: '#991b1b'
        }}>
          {error}
        </div>
      )}

      {/* Selector de Clases */}
      <div style={{ marginBottom: '32px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '12px'
        }}>
          Selecciona una clase:
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {clases.map((clase) => (
            <div
              key={clase.id}
              onClick={() => setClaseSeleccionada(clase)}
              style={{
                padding: '20px',
                backgroundColor: claseSeleccionada?.id === clase.id ? '#ede9fe' : 'white',
                border: `2px solid ${claseSeleccionada?.id === clase.id ? '#7c3aed' : '#e5e7eb'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: claseSeleccionada?.id === clase.id 
                  ? '0 4px 12px rgba(124, 58, 237, 0.15)' 
                  : '0 2px 4px rgba(0,0,0,0.05)',
                transform: claseSeleccionada?.id === clase.id ? 'scale(1.02)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (claseSeleccionada?.id !== clase.id) {
                  e.currentTarget.style.borderColor = '#a78bfa';
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (claseSeleccionada?.id !== clase.id) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }
              }}
            >
              <div style={{
                fontSize: '24px',
                marginBottom: '12px'
              }}>
                📚
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '4px'
              }}>
                {clase.materia?.nombre || 'Sin materia'}
              </div>
              <div style={{
                fontSize: '13px',
                color: '#6b7280',
                marginBottom: '8px'
              }}>
                {clase.grado} {clase.seccion}
              </div>
              {clase.docente && (
                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af'
                }}>
                  Prof. {clase.docente.nombre} {clase.docente.apellido}
                </div>
              )}
            </div>
          ))}
        </div>
        {clases.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <p style={{ color: '#6b7280' }}>No tienes clases asignadas</p>
          </div>
        )}
      </div>

      {/* Vista de Asistencia de Clase Seleccionada */}
      {claseSeleccionada && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          {/* Información de la Clase */}
          <div style={{
            marginBottom: '32px',
            paddingBottom: '24px',
            borderBottom: '2px solid #f3f4f6'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  marginBottom: '12px'
                }}>
                  {claseSeleccionada.materia?.nombre}
                </h2>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    <span style={{ fontSize: '18px' }}>📅</span>
                    <span>{claseSeleccionada.grado} {claseSeleccionada.seccion}</span>
                  </div>
                  {claseSeleccionada.horario && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      <span style={{ fontSize: '18px' }}>🕐</span>
                      <span>{claseSeleccionada.horario}</span>
                    </div>
                  )}
                  {claseSeleccionada.aula && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      <span style={{ fontSize: '18px' }}>🏫</span>
                      <span>{claseSeleccionada.aula}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Estadísticas de la Semana */}
              <div style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  backgroundColor: '#f0fdf4',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '2px solid #86efac',
                  minWidth: '120px'
                }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#16a34a',
                    marginBottom: '4px'
                  }}>
                    {porcentajeAsistencia}%
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#15803d',
                    fontWeight: '600'
                  }}>
                    Asistencia
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controles de Navegación */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '4px'
              }}>
                Calendario Semanal
              </h3>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                {diasSemana[0].toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                })} - {diasSemana[6].toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={semanaAnterior}
                disabled={animating}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  cursor: animating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  transition: 'all 0.2s',
                  opacity: animating ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!animating) {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateX(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!animating) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                ← Anterior
              </button>
              <button
                onClick={irAHoy}
                disabled={animating}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ede9fe',
                  border: '1px solid #a78bfa',
                  borderRadius: '10px',
                  cursor: animating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#7c3aed',
                  transition: 'all 0.2s',
                  opacity: animating ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!animating) {
                    e.currentTarget.style.backgroundColor = '#ddd6fe';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!animating) {
                    e.currentTarget.style.backgroundColor = '#ede9fe';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                Hoy
              </button>
              <button
                onClick={semanaSiguiente}
                disabled={animating}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  cursor: animating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  transition: 'all 0.2s',
                  opacity: animating ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!animating) {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!animating) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                Siguiente →
              </button>
            </div>
          </div>

          {/* Grid de días con animación */}
          <div style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: '400px'
          }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '16px',
                transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
                transform: animating 
                  ? (slideDirection === 'left' ? 'translateX(-100%)' : 'translateX(100%)')
                  : 'translateX(0)',
                opacity: animating ? 0.3 : 1
              }}
            >
              {diasSemana.map((dia, index) => {
                const asistencia = obtenerAsistenciaDia(dia);
                const esHoy = dia.toDateString() === new Date().toDateString();
                const esPasado = dia < new Date() && !esHoy;
                const esFuturo = dia > new Date() && !esHoy;
                const colorEstado = obtenerColorAsistencia(asistencia?.estado);

                return (
                  <div
                    key={`${dia.getTime()}-${index}`}
                    style={{
                      padding: '20px',
                      backgroundColor: esHoy ? '#fef3c7' : esFuturo ? '#f9fafb' : '#ffffff',
                      border: `3px solid ${esHoy ? '#f59e0b' : colorEstado}`,
                      borderRadius: '16px',
                      textAlign: 'center',
                      minHeight: '180px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: esHoy 
                        ? '0 4px 12px rgba(245, 158, 11, 0.2)' 
                        : '0 2px 8px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      animation: `fadeInUp 0.5s ease ${index * 0.05}s both`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = esHoy 
                        ? '0 4px 12px rgba(245, 158, 11, 0.2)' 
                        : '0 2px 8px rgba(0,0,0,0.08)';
                    }}
                  >
                    <div>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: esHoy ? '#d97706' : '#6b7280',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {nombresDiasCortos[index]}
                      </div>
                      <div style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: esHoy ? '#d97706' : '#1a1a1a',
                        marginBottom: '12px'
                      }}>
                        {dia.getDate()}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        marginBottom: '12px'
                      }}>
                        {dia.toLocaleDateString('es-ES', { month: 'short' })}
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        fontSize: '36px',
                        color: colorEstado,
                        fontWeight: 'bold',
                        transition: 'transform 0.2s'
                      }}>
                        {obtenerIconoAsistencia(asistencia?.estado)}
                      </div>
                      {asistencia?.estado && (
                        <>
                          <div style={{
                            fontSize: '12px',
                            color: colorEstado,
                            fontWeight: '700',
                            textTransform: 'capitalize',
                            padding: '4px 12px',
                            backgroundColor: `${colorEstado}15`,
                            borderRadius: '20px'
                          }}>
                            {asistencia.estado}
                          </div>
                          {asistencia.hora_llegada && (
                            <div style={{
                              fontSize: '11px',
                              color: '#6b7280',
                              marginTop: '4px'
                            }}>
                              {asistencia.hora_llegada}
                            </div>
                          )}
                        </>
                      )}
                      {!asistencia?.estado && !esFuturo && (
                        <div style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          fontStyle: 'italic'
                        }}>
                          Sin registro
                        </div>
                      )}
                      {esFuturo && (
                        <div style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          fontStyle: 'italic'
                        }}>
                          Próximo
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estadísticas Detalladas */}
          <div style={{
            marginTop: '32px',
            padding: '24px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h4 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '20px'
            }}>
              📊 Resumen de la Semana
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '10px',
                textAlign: 'center',
                border: '2px solid #10b981'
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>✓</div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#10b981',
                  marginBottom: '4px'
                }}>
                  {estadisticas.presente}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  Presente
                </div>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '10px',
                textAlign: 'center',
                border: '2px solid #f59e0b'
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏰</div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#f59e0b',
                  marginBottom: '4px'
                }}>
                  {estadisticas.tarde}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  Tarde
                </div>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '10px',
                textAlign: 'center',
                border: '2px solid #ef4444'
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>✗</div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#ef4444',
                  marginBottom: '4px'
                }}>
                  {estadisticas.ausente}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  Ausente
                </div>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '10px',
                textAlign: 'center',
                border: '2px solid #6366f1'
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📝</div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#6366f1',
                  marginBottom: '4px'
                }}>
                  {estadisticas.justificado}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  Justificado
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!claseSeleccionada && clases.length > 0 && (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          borderRadius: '16px',
          border: '2px dashed #e5e7eb'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px', animation: 'bounce 2s infinite' }}>👆</div>
          <p style={{ color: '#6b7280', fontSize: '16px', fontWeight: '500' }}>
            Selecciona una clase para ver tu asistencia semanal
          </p>
        </div>
      )}
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default StudentAttendance;

