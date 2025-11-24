import React, { useState, useEffect } from 'react';
import { getAllStudents } from '../../services/studentService';
import { 
  getAsistenciaByFecha, 
  upsertAsistencia
} from '../../services/asistenciaService';
import { AsistenciaConDetalles } from '../../types/database';
import { Student } from '../../types';

const AttendanceSystem: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AsistenciaConDetalles[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // formulario
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    studentId: '' as string | number,
    status: 'presente' as 'presente' | 'ausente' | 'tarde' | 'justificado',
    notes: '',
  });

  // cargar estudiantes al montar el componente
  useEffect(() => {
    loadStudents();
  }, []);

  // cargar asistencias cuando cambia la fecha
  useEffect(() => {
    loadAttendance(selectedDate);
  }, [selectedDate]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await getAllStudents();
      setStudents(data);
    } catch (err: any) {
      setError('Error al cargar estudiantes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async (date: string) => {
    try {
      setLoading(true);
      const data = await getAsistenciaByFecha(date);
      setAttendanceRecords(data);
      setError(null);
    } catch (err: any) {
      setError('Error al cargar asistencias: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.studentId) {
      setError('Por favor selecciona un estudiante');
      return;
    }

    try {
      setLoading(true);
      await upsertAsistencia({
        estudiante_id: Number(formData.studentId),
        fecha: formData.date,
        estado: formData.status,
        observaciones: formData.notes || undefined,
      });

      // recargar la lista de asistencias
      await loadAttendance(selectedDate);
      
      // limpiar formulario
      setFormData({
        ...formData,
        studentId: '',
        notes: '',
      });
      
      setError(null);
      alert('Asistencia registrada correctamente');
    } catch (err: any) {
      setError('Error al registrar asistencia: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'presente':
        return 'status-badge success';
      case 'tarde':
        return 'status-badge warning';
      case 'ausente':
        return 'status-badge error';
      case 'justificado':
        return 'status-badge info';
      default:
        return 'status-badge';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'presente':
        return 'Presente';
      case 'tarde':
        return 'Tardanza';
      case 'ausente':
        return 'Ausente';
      case 'justificado':
        return 'Justificado';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'presente':
        return '✓';
      case 'tarde':
        return '⏰';
      case 'ausente':
        return '✗';
      case 'justificado':
        return '📝';
      default:
        return '·';
    }
  };

  // calcular estadísticas
  const stats = {
    total: attendanceRecords.length,
    presente: attendanceRecords.filter(r => r.estado === 'presente').length,
    tarde: attendanceRecords.filter(r => r.estado === 'tarde').length,
    ausente: attendanceRecords.filter(r => r.estado === 'ausente').length,
    justificado: attendanceRecords.filter(r => r.estado === 'justificado').length,
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
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
          📋 Control de Asistencia
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Registra y gestiona la asistencia de los estudiantes
        </p>
      </div>

      {error && (
        <div style={{ 
          padding: '16px 20px', 
          backgroundColor: '#fee', 
          border: '1px solid #fcc',
          color: '#c00',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      
      {/* Formulario de Registro */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          marginBottom: '20px',
          color: '#374151',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ✏️ Registrar Nueva Asistencia
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label htmlFor="attendanceDate" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                fontSize: '14px',
                color: '#374151'
              }}>
                📅 Fecha
              </label>
              <input 
                type="date" 
                id="attendanceDate" 
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
            
            <div>
              <label htmlFor="studentSelect" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                fontSize: '14px',
                color: '#374151'
              }}>
                👤 Estudiante
              </label>
              <select 
                id="studentSelect" 
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: loading ? '#f3f4f6' : 'white',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="">Seleccionar estudiante</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.lastName} {student.name} - {student.grade}{student.section}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="attendanceStatus" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                fontSize: '14px',
                color: '#374151'
              }}>
                📊 Estado
              </label>
              <select 
                id="attendanceStatus" 
                value={formData.status}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  status: e.target.value as any 
                })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="presente">✓ Presente</option>
                <option value="ausente">✗ Ausente</option>
                <option value="tarde">⏰ Tardanza</option>
                <option value="justificado">📝 Justificado</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="attendanceNotes" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                fontSize: '14px',
                color: '#374151'
              }}>
                💬 Notas (opcional)
              </label>
              <input 
                type="text" 
                id="attendanceNotes" 
                placeholder="Ej: Llegó 10 min tarde"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 2px 4px rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#2563eb')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = '#3b82f6')}
          >
            {loading ? '⏳ Guardando...' : '✓ Registrar Asistencia'}
          </button>
        </form>
      </div>

      {/* Estadísticas */}
      {attendanceRecords.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '16px', 
          marginBottom: '24px' 
        }}>
          <div style={{ 
            backgroundColor: '#f0fdf4', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid #bbf7d0',
            boxShadow: '0 2px 4px rgba(34, 197, 94, 0.1)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
              {stats.presente}
            </div>
            <div style={{ fontSize: '13px', color: '#15803d', fontWeight: '500' }}>Presentes</div>
          </div>
          
          <div style={{ 
            backgroundColor: '#fef3c7', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid #fde68a',
            boxShadow: '0 2px 4px rgba(245, 158, 11, 0.1)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏰</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
              {stats.tarde}
            </div>
            <div style={{ fontSize: '13px', color: '#b45309', fontWeight: '500' }}>Tardanzas</div>
          </div>
          
          <div style={{ 
            backgroundColor: '#fee2e2', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid #fecaca',
            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.1)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✗</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
              {stats.ausente}
            </div>
            <div style={{ fontSize: '13px', color: '#b91c1c', fontWeight: '500' }}>Ausentes</div>
          </div>
          
          <div style={{ 
            backgroundColor: '#dbeafe', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid #bfdbfe',
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
              {stats.justificado}
            </div>
            <div style={{ fontSize: '13px', color: '#1d4ed8', fontWeight: '500' }}>Justificados</div>
          </div>
        </div>
      )}

      {/* Lista de Asistencia */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600',
            color: '#374151',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📋 Lista de Asistencia
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label htmlFor="filterDate" style={{ 
              fontSize: '14px', 
              fontWeight: '500',
              color: '#6b7280'
            }}>
              📅 Filtrar por fecha:
            </label>
            <input 
              type="date" 
              id="filterDate" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p style={{ fontSize: '16px' }}>Cargando registros...</p>
          </div>
        ) : attendanceRecords.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#9ca3af'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
            <p style={{ fontSize: '18px', fontWeight: '500', color: '#6b7280' }}>
              No hay registros de asistencia
            </p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              para la fecha {new Date(selectedDate).toLocaleDateString('es-ES')}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'separate',
              borderSpacing: '0'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    borderBottom: '2px solid #e5e7eb',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Estudiante
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    borderBottom: '2px solid #e5e7eb',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Grado/Sección
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    borderBottom: '2px solid #e5e7eb',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Estado
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    borderBottom: '2px solid #e5e7eb',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Observaciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record, index) => (
                  <tr 
                    key={record.id}
                    style={{ 
                      backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f9fafb'}
                  >
                    <td style={{ 
                      padding: '14px 16px',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '14px',
                      color: '#1f2937',
                      fontWeight: '500'
                    }}>
                      {record.estudiante?.apellido} {record.estudiante?.nombre}
                    </td>
                    <td style={{ 
                      padding: '14px 16px',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      <span style={{
                        backgroundColor: '#f3f4f6',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        {record.estudiante?.grado}{record.estudiante?.seccion}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '14px 16px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 
                          record.estado === 'presente' ? '#dcfce7' :
                          record.estado === 'tarde' ? '#fef3c7' :
                          record.estado === 'ausente' ? '#fee2e2' :
                          '#dbeafe',
                        color:
                          record.estado === 'presente' ? '#15803d' :
                          record.estado === 'tarde' ? '#b45309' :
                          record.estado === 'ausente' ? '#b91c1c' :
                          '#1d4ed8'
                      }}>
                        <span>{getStatusIcon(record.estado)}</span>
                        <span>{getStatusText(record.estado)}</span>
                      </span>
                    </td>
                    <td style={{ 
                      padding: '14px 16px',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '14px',
                      color: '#6b7280',
                      fontStyle: record.observaciones ? 'normal' : 'italic'
                    }}>
                      {record.observaciones || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceSystem;