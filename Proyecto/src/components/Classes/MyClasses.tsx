import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Clase, Estudiante } from '../../types/database';
import { useNavigate } from 'react-router-dom';
import { formatearHorario, tieneClaseHoy } from '../../utils/horarioUtils';

interface ClaseConDetalles extends Omit<Clase, 'materia'> {
  materia?: {
    nombre: string;
    codigo: string;
  };
  estudiantes?: Estudiante[];
  totalEstudiantes?: number;
}

interface MyClassesProps {
  docenteId: number;
  docenteNombre: string;
}

export const MyClasses: React.FC<MyClassesProps> = ({ docenteId, docenteNombre }) => {
  const navigate = useNavigate();
  const [clases, setClases] = useState<ClaseConDetalles[]>([]);
  const [claseSeleccionada, setClaseSeleccionada] = useState<ClaseConDetalles | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarClases();
  }, [docenteId]);

  const cargarClases = async () => {
    try {
      setLoading(true);
      
      // obtener clases del docente con información de materia
      const { data: clasesData, error: clasesError } = await supabase
        .from('clases')
        .select(`
          *,
          materia:materias (
            nombre,
            codigo
          )
        `)
        .eq('docente_id', docenteId)
        .eq('estado', 'activo')
        .order('grado', { ascending: true });

      if (clasesError) throw clasesError;

      // para cada clase, obtener los estudiantes inscritos
      const clasesConEstudiantes = await Promise.all(
        (clasesData || []).map(async (clase) => {
          // obtener inscripciones de esta clase
          const { data: inscripciones } = await supabase
            .from('inscripciones')
            .select(`
              estudiante:Estudiantes (
                id,
                nombre,
                apellido,
                grado,
                seccion,
                email,
                telefono
              )
            `)
            .eq('clase_id', clase.id)
            .eq('estado', 'activo');

          const estudiantes = (inscripciones || [])
            .map(i => i.estudiante)
            .filter(e => e !== null);

          return {
            ...clase,
            estudiantes,
            totalEstudiantes: estudiantes.length
          };
        })
      );

      setClases(clasesConEstudiantes);
      setError(null);
    } catch (err: any) {
      setError('Error al cargar clases: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerEstudiantes = (clase: ClaseConDetalles) => {
    setClaseSeleccionada(clase);
  };

  const handleTomarAsistencia = (claseId: number) => {
    navigate(`/attendance?claseId=${claseId}`);
  };

  const handleIngresarNotas = (claseId: number) => {
    // navegar a un nuevo componente de calificaciones o abrir modal
    navigate(`/grades?claseId=${claseId}`);
  };

  // estadísticas generales
  const totalEstudiantes = clases.reduce((sum, c) => sum + (c.totalEstudiantes || 0), 0);
  const totalClases = clases.length;

  return (
    <div style={{ 
      padding: '24px',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: '#1f2937',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          📚 Mis Clases
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          Gestiona tus clases y estudiantes asignados • Prof. {docenteNombre}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      {/* Estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            Total Clases
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>
            {totalClases}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            Total Estudiantes
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
            {totalEstudiantes}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            Promedio por Clase
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
            {totalClases > 0 ? Math.round(totalEstudiantes / totalClases) : 0}
          </div>
        </div>
      </div>

      {/* Lista de Clases */}
      {loading ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <p style={{ color: '#6b7280' }}>Cargando clases...</p>
        </div>
      ) : clases.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            No tienes clases asignadas
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Contacta con la administración para que te asignen clases.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: claseSeleccionada ? '1fr 1fr' : '1fr',
          gap: '24px'
        }}>
          {/* Panel de Clases */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {clases.map((clase) => (
              <div
                key={clase.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: claseSeleccionada?.id === clase.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => handleVerEstudiantes(clase)}
                onMouseEnter={(e) => {
                  if (claseSeleccionada?.id !== clase.id) {
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }
                }}
                onMouseLeave={(e) => {
                  if (claseSeleccionada?.id !== clase.id) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }
                }}
              >
                {/* Header de la clase */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '8px'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '4px'
                      }}>
                        {clase.materia?.nombre || 'Materia'}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                        Código: {clase.materia?.codigo || 'N/A'}
                      </p>
                    </div>
                    <div style={{
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {clase.grado}{clase.seccion}
                    </div>
                  </div>
                </div>

                {/* Info de la clase */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                      📊 Estudiantes
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#374151' }}>
                      {clase.totalEstudiantes || 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                      🕐 Horario
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      <span>
                        {formatearHorario(clase.horario)}
                        {tieneClaseHoy(clase.horario) && (
                          <span style={{ 
                            marginLeft: '8px', 
                            backgroundColor: '#10b981', 
                            color: 'white', 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            Hoy
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  {clase.aula && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                        🚪 Aula
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        {clase.aula}
                      </div>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVerEstudiantes(clase);
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    👥 Ver
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTomarAsistencia(clase.id);
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    📅 Asist.
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIngresarNotas(clase.id);
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    📝 Notas
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Panel de Estudiantes (si hay clase seleccionada) */}
          {claseSeleccionada && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              maxHeight: '800px',
              overflow: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                  👥 Estudiantes - {claseSeleccionada.grado}{claseSeleccionada.seccion}
                </h3>
                <button
                  onClick={() => setClaseSeleccionada(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  ✕
                </button>
              </div>

              {claseSeleccionada.estudiantes && claseSeleccionada.estudiantes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {claseSeleccionada.estudiantes.map((estudiante) => (
                    <div
                      key={estudiante.id}
                      style={{
                        padding: '16px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#dbeafe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1e40af',
                          flexShrink: 0
                        }}>
                          {estudiante.nombre.charAt(0)}{estudiante.apellido.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '2px'
                          }}>
                            {estudiante.apellido}, {estudiante.nombre}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {estudiante.email || 'Sin email'}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#6b7280',
                          backgroundColor: 'white',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}>
                          ID: {estudiante.id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '32px',
                  color: '#9ca3af'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                  <p>No hay estudiantes inscritos en esta clase</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyClasses;

