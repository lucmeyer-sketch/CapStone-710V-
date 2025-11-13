// Contenido para src/components/DirectorDashboard/DirectorDashboard.tsx

import React from 'react';

const DirectorDashboard: React.FC = () => {
  return (
    <>
      <h1 className="page-title">Panel Directivo</h1>
                
      <div className="metrics-grid">
          <div className="metric-card">
              <div className="metric-icon primary">🏫</div>
              <div className="metric-info">
                  <h3>156</h3>
                  <p>Total Estudiantes</p>
              </div>
          </div>
          <div className="metric-card">
              <div className="metric-icon secondary">👨‍🏫</div>
              <div className="metric-info">
                  <h3>24</h3>
                  <p>Docentes Activos</p>
              </div>
          </div>
          <div className="metric-card">
              <div className="metric-icon success">📈</div>
              <div className="metric-info">
                  <h3>89.2%</h3>
                  <p>Rendimiento General</p>
              </div>
          </div>
          <div className="metric-card">
              <div className="metric-icon warning">⚠️</div>
              <div className="metric-info">
                  <h3>5</h3>
                  <p>Situaciones Críticas</p>
              </div>
          </div>
      </div>

      <div className="section">
          <h2>Indicadores Institucionales</h2>
          <div className="status-grid">
              <div className="status-item">
                  <span>Tasa de Asistencia General</span>
                  <span className="status-badge success">87.5%</span>
              </div>
              <div className="status-item">
                  <span>Promedio Académico General</span>
                  <span className="status-badge success">82.3</span>
              </div>
              <div className="status-item">
                  <span>Estudiantes en Riesgo</span>
                  <span className="status-badge warning">8 (5.1%)</span>
              </div>
              <div className="status-item">
                  <span>Satisfacción Docente</span>
                  <span className="status-badge success">91%</span>
              </div>
          </div>
      </div>

      <div className="section">
          <h2>Situaciones que Requieren Atención</h2>
          <table className="table">
              <thead>
                  <tr>
                      <th>Estudiante</th>
                      <th>Grado</th>
                      <th>Problema</th>
                      <th>Severidad</th>
                      <th>Responsable</th>
                      <th>Acciones</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td>María López</td>
                      <td>8° Básico B</td>
                      <td>Asistencia Crítica - Posible bullying</td>
                      <td><span className="status-badge error">Alta</span></td>
                      <td>Psicóloga Ana Martínez</td>
                      <td>
                          <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Ver Caso</button>
                      </td>
                  </tr>
                  <tr>
                      <td>Carlos Ruiz</td>
                      <td>3° Medio C</td>
                      <td>Problemas de Conducta - Agresividad</td>
                      <td><span className="status-badge warning">Media</span></td>
                      <td>Psicóloga Ana Martínez</td>
                      <td>
                          <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Ver Caso</button>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
    </>
  );
};

export default DirectorDashboard;