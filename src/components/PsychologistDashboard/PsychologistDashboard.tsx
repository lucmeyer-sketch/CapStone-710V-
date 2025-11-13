// Contenido para src/components/PsychologistDashboard/PsychologistDashboard.tsx

import React from 'react';

const PsychologistDashboard: React.FC = () => {
  return (
    <>
      <h1 className="page-title">Panel de Psicología Educativa</h1>
                
      <div className="metrics-grid">
          <div className="metric-card">
              <div className="metric-icon warning">⚠️</div>
              <div className="metric-info">
                  <h3>8</h3>
                  <p>Estudiantes en Riesgo</p>
              </div>
          </div>
          <div className="metric-card">
              <div className="metric-icon info">📋</div>
              <div className="metric-info">
                  <h3>12</h3>
                  <p>Sesiones Esta Semana</p>
              </div>
          </div>
          <div className="metric-card">
              <div className="metric-icon success">✅</div>
              <div className="metric-info">
                  <h3>15</h3>
                  <p>Casos Cerrados</p>
              </div>
          </div>
          <div className="metric-card">
              <div className="metric-icon primary">📊</div>
              <div className="metric-info">
                  <h3>85%</h3>
                  <p>Mejora Promedio</p>
              </div>
          </div>
      </div>

      <div className="section">
          <h2>Estudiantes que Requieren Atención</h2>
          <table className="table">
              <thead>
                  <tr>
                      <th>Estudiante</th>
                      <th>Grado</th>
                      <th>Problema Identificado</th>
                      <th>Severidad</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td>Juan Pérez</td>
                      <td>2° Medio A</td>
                      <td>Bajo rendimiento - Ansiedad</td>
                      <td><span className="status-badge warning">Media</span></td>
                      <td><span className="status-badge warning">En Seguimiento</span></td>
                      <td>
                          <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Ver Detalles</button>
                      </td>
                  </tr>
                  <tr>
                      <td>María López</td>
                      <td>8° Básico B</td>
                      <td>Problemas de asistencia - Bullying</td>
                      <td><span className="status-badge error">Alta</span></td>
                      <td><span className="status-badge error">Urgente</span></td>
                      <td>
                          <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Ver Detalles</button>
                      </td>
                  </tr>
                  {/* ... puedes agregar el resto de la tabla ... */}
              </tbody>
          </table>
      </div>
    </>
  );
};

export default PsychologistDashboard;