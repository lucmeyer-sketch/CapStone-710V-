// Contenido para src/components/StudentDashboard/StudentDashboard.tsx

import React from 'react';

const StudentDashboard: React.FC = () => {
  return (
    <>
      <h1 className="page-title">Mi Perfil Estudiantil</h1>
                
      <div className="metrics-grid">
          <div className="metric-card">
              <div className="metric-icon primary">📊</div>
              <div className="metric-info">
                  <h3>85.5</h3>
                  <p>Promedio General</p>
              </div>
          </div>
          <div className="metric-card">
              <div className="metric-icon success">📈</div>
              <div className="metric-info">
                  <h3>92%</h3>
                  <p>Asistencia</p>
              </div>
          </div>
          <div className="metric-card">
              <div className="metric-icon info">📚</div>
              <div className="metric-info">
                  <h3>6</h3>
                  <p>Asignaturas</p>
              </div>
          </div>
          <div className="metric-card">
              <div className="metric-icon warning">📅</div>
              <div className="metric-info">
                  <h3>15</h3>
                  <p>Días Restantes</p>
              </div>
          </div>
      </div>

      <div className="section">
          <h2>Mis Calificaciones</h2>
          <table className="table">
              <thead>
                  <tr>
                      <th>Asignatura</th>
                      <th>Profesor</th>
                      <th>Promedio</th>
                      <th>Estado</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td>Matemáticas</td>
                      <td>Prof. José Rodríguez</td>
                      <td>5.8</td>
                      <td><span className="status-badge success">Aprobado</span></td>
                  </tr>
                  <tr>
                      <td>Ciencias Naturales</td>
                      <td>Prof. María González</td>
                      <td>6.5</td>
                      <td><span className="status-badge success">Excelente</span></td>
                  </tr>
                  <tr>
                      <td>Lenguaje y Literatura</td>
                      <td>Prof. Ana Martínez</td>
                      <td>4.8</td>
                      <td><span className="status-badge warning">En Riesgo</span></td>
                  </tr>
                  {/* ... puedes agregar el resto de la tabla ... */}
              </tbody>
          </table>
      </div>

      <div className="section">
          <h2>Comunicaciones Recientes</h2>
          <div className="notifications">
              <div className="notification info">
                  <span className="notification-badge info">MENSAJE</span>
                  <span><strong>Prof. José Rodríguez (Matemáticas):</strong> "Recuerda entregar la tarea de álgebra mañana..."</span>
              </div>
              <div className="notification warning">
                  <span className="notification-badge warning">AVISO</span>
                  <span><strong>Sistema:</strong> "Tu asistencia en Lenguaje está por debajo del 80%."</span>
              </div>
          </div>
      </div>
    </>
  );
};

export default StudentDashboard;