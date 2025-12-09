import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getClasesByEstudiante } from '../../services/studentService';
import { getCalificacionesByEstudiante, getPromedioEstudianteClase } from '../../services/calificacionService';
import { CalificacionConDetalles } from '../../types/database';
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

const StudentGrades: React.FC = () => {
  const [clases, setClases] = useState<ClaseConDetalles[]>([]);
  const [claseSeleccionada, setClaseSeleccionada] = useState<ClaseConDetalles | null>(null);
  const [calificaciones, setCalificaciones] = useState<CalificacionConDetalles[]>([]);
  const [promedio, setPromedio] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estudianteId, setEstudianteId] = useState<number | null>(null);

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
      cargarDatosClase();
    }
  }, [claseSeleccionada, estudianteId]);

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

  const cargarDatosClase = async () => {
    if (!claseSeleccionada || !estudianteId) return;

    try {
      setLoading(true);
      
      // cargar calificaciones
      const calificacionesData = await getCalificacionesByEstudiante(estudianteId.toString());
      const calificacionesFiltradas = calificacionesData.filter(
        cal => cal.clase_id === claseSeleccionada.id
      );
      setCalificaciones(calificacionesFiltradas);

      // cargar promedio
      const promedioData = await getPromedioEstudianteClase(
        estudianteId.toString(),
        claseSeleccionada.id.toString()
      );
      setPromedio(promedioData);

      setError(null);
    } catch (err: any) {
      setError('Error al cargar datos de la clase: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#6b7280' }}>Cargando tus clases...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
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
          📊 Mis Notas
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Consulta tus calificaciones por clase
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
          marginBottom: '8px'
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
                transition: 'all 0.2s',
                boxShadow: claseSeleccionada?.id === clase.id 
                  ? '0 4px 12px rgba(124, 58, 237, 0.15)' 
                  : '0 2px 4px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                if (claseSeleccionada?.id !== clase.id) {
                  e.currentTarget.style.borderColor = '#a78bfa';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (claseSeleccionada?.id !== clase.id) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
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

      {/* Vista de Clase Seleccionada */}
      {claseSeleccionada && (
        <>
          {/* Información de la Clase */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '8px'
                }}>
                  {claseSeleccionada.materia?.nombre}
                </h2>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    📅 {claseSeleccionada.grado} {claseSeleccionada.seccion}
                  </span>
                  {claseSeleccionada.horario && (
                    <span style={{
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      🕐 {claseSeleccionada.horario}
                    </span>
                  )}
                  {claseSeleccionada.aula && (
                    <span style={{
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      🏫 {claseSeleccionada.aula}
                    </span>
                  )}
                </div>
              </div>
              <div style={{
                backgroundColor: '#ede9fe',
                padding: '16px 24px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#6d28d9',
                  fontWeight: '500',
                  marginBottom: '4px'
                }}>
                  Promedio
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#7c3aed'
                }}>
                  {promedio > 0 ? promedio.toFixed(1) : '--'}
                </div>
              </div>
            </div>
          </div>

          {/* Calificaciones */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '20px'
            }}>
              📝 Calificaciones
            </h3>
            {calificaciones.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {calificaciones.map((cal) => (
                  <div
                    key={cal.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1a1a1a',
                        marginBottom: '4px'
                      }}>
                        {cal.nombre_evaluacion}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}>
                        <span>
                          📋 {cal.tipo_evaluacion}
                        </span>
                        <span>
                          📅 {new Date(cal.fecha_evaluacion).toLocaleDateString('es-ES')}
                        </span>
                        {cal.ponderacion && (
                          <span>
                            ⚖️ {cal.ponderacion}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: cal.nota >= 6 ? '#10b981' : cal.nota >= 4 ? '#f59e0b' : '#ef4444',
                      minWidth: '80px',
                      textAlign: 'right'
                    }}>
                      {cal.nota.toFixed(1)} / {cal.nota_maxima}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <p>No hay calificaciones registradas para esta clase</p>
              </div>
            )}
          </div>

        </>
      )}

      {!claseSeleccionada && clases.length > 0 && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👆</div>
          <p style={{ color: '#6b7280' }}>Selecciona una clase para ver tus calificaciones</p>
        </div>
      )}
    </div>
  );
};

export default StudentGrades;

