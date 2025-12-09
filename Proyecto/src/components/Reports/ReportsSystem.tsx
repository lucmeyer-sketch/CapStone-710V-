import React, { useState, useEffect } from 'react';
import { 
  generarReporteAsistencia, 
  generarReporteAcademico,
  obtenerReportesGuardados,
  ReporteGenerado 
} from '../../services/reporteService';

const ReportsSystem: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reporteGenerado, setReporteGenerado] = useState<any>(null);
  const [reportesGuardados, setReportesGuardados] = useState<ReporteGenerado[]>([]);
  const [mostrandoReporte, setMostrandoReporte] = useState(false);

  const [formData, setFormData] = useState({
    tipo: 'asistencia' as 'asistencia' | 'academico',
    grado: '',
    seccion: '',
    fechaInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    cargarReportesGuardados();
  }, []);

  const cargarReportesGuardados = async () => {
    try {
      const reportes = await obtenerReportesGuardados();
      setReportesGuardados(reportes);
    } catch (err: any) {
      console.error('Error cargando reportes:', err);
    }
  };

  const handleGenerarReporte = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMostrandoReporte(true);

    try {
      let reporte;
      
      if (formData.tipo === 'asistencia') {
        reporte = await generarReporteAsistencia(
          formData.fechaInicio,
          formData.fechaFin,
          formData.grado || undefined,
          formData.seccion || undefined
        );
      } else {
        reporte = await generarReporteAcademico(
          formData.grado || undefined,
          formData.seccion || undefined
        );
      }

      setReporteGenerado(reporte);
    } catch (err: any) {
      setError('Error al generar reporte: ' + err.message);
      setMostrandoReporte(false);
    } finally {
      setLoading(false);
    }
  };

  const renderReporteAsistencia = (reporte: any) => {
    if (!reporte) return null;

    return (
      <div>
        {/* Estadísticas Generales */}
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
            border: '1px solid #bbf7d0'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>✓</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
              {reporte.estadisticasGenerales.presente}
            </div>
            <div style={{ fontSize: '13px', color: '#15803d', fontWeight: '500' }}>Presentes</div>
          </div>
          
          <div style={{ 
            backgroundColor: '#fef3c7', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid #fde68a'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏰</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
              {reporte.estadisticasGenerales.tarde}
            </div>
            <div style={{ fontSize: '13px', color: '#b45309', fontWeight: '500' }}>Tardanzas</div>
          </div>
          
          <div style={{ 
            backgroundColor: '#fee2e2', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid #fecaca'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>✗</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
              {reporte.estadisticasGenerales.ausente}
            </div>
            <div style={{ fontSize: '13px', color: '#b91c1c', fontWeight: '500' }}>Ausentes</div>
          </div>
          
          <div style={{ 
            backgroundColor: '#e0e7ff', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid #c7d2fe'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📊</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#4f46e5' }}>
              {reporte.estadisticasGenerales.porcentajeAsistencia}%
            </div>
            <div style={{ fontSize: '13px', color: '#4338ca', fontWeight: '500' }}>Asistencia</div>
          </div>
        </div>

        {/* Tabla por Estudiante */}
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#374151'
        }}>
          📋 Asistencia por Estudiante
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={tableHeaderStyle}>Estudiante</th>
                <th style={tableHeaderStyle}>Grado</th>
                <th style={tableHeaderStyle}>Presente</th>
                <th style={tableHeaderStyle}>Tarde</th>
                <th style={tableHeaderStyle}>Ausente</th>
                <th style={tableHeaderStyle}>Justificado</th>
                <th style={tableHeaderStyle}>Total</th>
                <th style={tableHeaderStyle}>% Asistencia</th>
              </tr>
            </thead>
            <tbody>
              {reporte.porEstudiante.map((est: any, index: number) => {
                const porcentaje = est.total > 0 
                  ? ((est.presente + est.tarde) / est.total * 100).toFixed(1)
                  : 0;
                
                return (
                  <tr 
                    key={index}
                    style={{ 
                      backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                    }}
                  >
                    <td style={tableCellStyle}>
                      {est.estudiante?.apellido} {est.estudiante?.nombre}
                    </td>
                    <td style={tableCellStyle}>
                      {est.estudiante?.grado}{est.estudiante?.seccion}
                    </td>
                    <td style={{ ...tableCellStyle, color: '#16a34a', fontWeight: '600' }}>
                      {est.presente}
                    </td>
                    <td style={{ ...tableCellStyle, color: '#d97706', fontWeight: '600' }}>
                      {est.tarde}
                    </td>
                    <td style={{ ...tableCellStyle, color: '#dc2626', fontWeight: '600' }}>
                      {est.ausente}
                    </td>
                    <td style={{ ...tableCellStyle, color: '#2563eb', fontWeight: '600' }}>
                      {est.justificado}
                    </td>
                    <td style={{ ...tableCellStyle, fontWeight: '700' }}>
                      {est.total}
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        backgroundColor: parseFloat(porcentaje as string) >= 85 ? '#dcfce7' : 
                                        parseFloat(porcentaje as string) >= 70 ? '#fef3c7' : '#fee2e2',
                        color: parseFloat(porcentaje as string) >= 85 ? '#15803d' : 
                               parseFloat(porcentaje as string) >= 70 ? '#b45309' : '#b91c1c'
                      }}>
                        {porcentaje}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReporteAcademico = (reporte: any) => {
    if (!reporte) return null;

    return (
      <div>
        {/* Estadísticas Generales */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '16px', 
          marginBottom: '24px' 
        }}>
          <div style={{ 
            backgroundColor: '#ede9fe', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid #ddd6fe'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>👥</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed' }}>
              {reporte.estadisticasGenerales.totalEstudiantes}
            </div>
            <div style={{ fontSize: '13px', color: '#6d28d9', fontWeight: '500' }}>Estudiantes</div>
          </div>
          
          <div style={{ 
            backgroundColor: '#dbeafe', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📊</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
              {reporte.estadisticasGenerales.promedioGeneralCurso}
            </div>
            <div style={{ fontSize: '13px', color: '#1d4ed8', fontWeight: '500' }}>Promedio General</div>
          </div>
          
          <div style={{ 
            backgroundColor: '#d1fae5', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid #a7f3d0'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⬆️</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
              {reporte.estadisticasGenerales.promedioMasAlto}
            </div>
            <div style={{ fontSize: '13px', color: '#047857', fontWeight: '500' }}>Promedio Más Alto</div>
          </div>
          
          <div style={{ 
            backgroundColor: '#fed7aa', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid #fdba74'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⬇️</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#ea580c' }}>
              {reporte.estadisticasGenerales.promedioMasBajo}
            </div>
            <div style={{ fontSize: '13px', color: '#c2410c', fontWeight: '500' }}>Promedio Más Bajo</div>
          </div>
        </div>

        {/* Tabla de Estudiantes */}
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#374151'
        }}>
          📚 Rendimiento Académico por Estudiante
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={tableHeaderStyle}>Estudiante</th>
                <th style={tableHeaderStyle}>Grado</th>
                <th style={tableHeaderStyle}>Promedio General</th>
                <th style={tableHeaderStyle}>Total Evaluaciones</th>
                <th style={tableHeaderStyle}>Materias Cursadas</th>
              </tr>
            </thead>
            <tbody>
              {reporte.estudiantes.map((est: any, index: number) => {
                const promedio = parseFloat(est.promedioGeneral);
                
                return (
                  <tr 
                    key={index}
                    style={{ 
                      backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                    }}
                  >
                    <td style={tableCellStyle}>
                      {est.estudiante.apellido} {est.estudiante.nombre}
                    </td>
                    <td style={tableCellStyle}>
                      {est.estudiante.grado}{est.estudiante.seccion}
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '700',
                        backgroundColor: promedio >= 5.5 ? '#dcfce7' : 
                                        promedio >= 4.0 ? '#fef3c7' : '#fee2e2',
                        color: promedio >= 5.5 ? '#15803d' : 
                               promedio >= 4.0 ? '#b45309' : '#b91c1c'
                      }}>
                        {est.promedioGeneral}
                      </span>
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                      {est.totalEvaluaciones}
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                      {est.materias.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const tableHeaderStyle: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '2px solid #e5e7eb',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const tableCellStyle: React.CSSProperties = {
    padding: '14px 16px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
    color: '#1f2937'
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
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
          📊 Sistema de Reportes
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Genera reportes detallados de asistencia y rendimiento académico
        </p>
      </div>

      {/* Error Message */}
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

      {/* Formulario de Generación */}
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
          ✨ Generar Nuevo Reporte
        </h2>

        <form onSubmit={handleGenerarReporte}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>
                📋 Tipo de Reporte
              </label>
              <select 
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                style={inputStyle}
              >
                <option value="asistencia">📊 Reporte de Asistencia</option>
                <option value="academico">🎓 Reporte Académico</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                🎯 Grado (Opcional)
              </label>
              <select 
                value={formData.grado}
                onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
                style={inputStyle}
              >
                <option value="">Todos los grados</option>
                <option value="1ro Medio">1ro Medio</option>
                <option value="2do Medio">2do Medio</option>
                <option value="3ro Medio">3ro Medio</option>
                <option value="4to Medio">4to Medio</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                📚 Sección (Opcional)
              </label>
              <select 
                value={formData.seccion}
                onChange={(e) => setFormData({ ...formData, seccion: e.target.value })}
                style={inputStyle}
              >
                <option value="">Todas las secciones</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>

          {formData.tipo === 'asistencia' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>
                  📅 Fecha Inicio
                </label>
                <input 
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>
                  📅 Fecha Fin
                </label>
                <input 
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          )}

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
            {loading ? '⏳ Generando Reporte...' : '🚀 Generar Reporte'}
          </button>
        </form>
      </div>

      {/* Reporte Generado */}
      {mostrandoReporte && reporteGenerado && (
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
            marginBottom: '24px'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600',
              color: '#374151',
              margin: 0
            }}>
              📄 Reporte Generado
            </h2>
            <button
              onClick={() => setMostrandoReporte(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ✕ Cerrar
            </button>
          </div>

          {formData.tipo === 'asistencia' 
            ? renderReporteAsistencia(reporteGenerado)
            : renderReporteAcademico(reporteGenerado)
          }
        </div>
      )}
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: '500',
  fontSize: '14px',
  color: '#374151'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  cursor: 'pointer'
};

export default ReportsSystem;
