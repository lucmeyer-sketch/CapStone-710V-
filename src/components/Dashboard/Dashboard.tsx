// Contenido para src/components/Dashboard/Dashboard.tsx

import React from 'react';

const Dashboard: React.FC = () => {
  return (
    // Usamos <></> (Fragment) porque el 'page' id no es necesario
    <>
      <h1 className="page-title">Dashboard Institucional</h1>
                
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
                  <p>Total Docentes</p>
              </div>
          </div>
          <div className="metric-card">
              <div className="metric-icon success">📈</div>
              <div className="metric-info">
                  <h3>87.5%</h3>
                  <p>Tasa de Asistencia</p>
                  <div className="progress-bar">
                      <div className="progress-fill" style={{ width: "87.5%" }}></div>
                  </div>
              </div>
          </div>
          <div className="metric-card">
              <div className="metric-icon info">📊</div>
              <div className="metric-info">
                  <h3>82.3</h3>
                  <p>Promedio General</p>
              </div>
          </div>
          <div className="metric-card">
              <div className="metric-icon warning">👥</div>
              <div className="metric-info">
                  <h3>18</h3>
                  <p>Usuarios Activos</p>
              </div>
          </div>
          <div className="metric-card">
              <div className="metric-icon error">📋</div>
              <div className="metric-info">
                  <h3>45</h3>
                  <p>Reportes Generados</p>
              </div>
          </div>
      </div>

      <div className="section">
          <h2>Estado del Sistema</h2>
          <div className="status-grid">
              <div className="status-item">
                  <span>Estado del Servidor</span>
                  <span className="status-badge success">Activo</span>
              </div>
              <div className="status-item">
                  <span>Base de Datos</span>
                  <span className="status-badge success">Conectada</span>
              </div>
              <div className="status-item">
                  <span>Backup</span>
                  <span className="status-badge success">Actualizado</span>
              </div>
              <div className="status-item">
                  <span>Última Sincronización</span>
                  <span className="status-badge info">Hace 5 min</span>
              </div>
          </div>
      </div>

      <div className="section">
          <h2>Notificaciones Recientes</h2>
          <div className="notifications">
              <div className="notification info">
                  <span className="notification-badge info">INFO</span>
                  <span>Se generó automáticamente el reporte de asistencia del mes de enero</span>
              </div>
              <div className="notification warning">
                  <span className="notification-badge warning">WARNING</span>
                  <span>3 estudiantes tienen asistencia por debajo del 80%</span>
              </div>
              <div className="notification success">
                  <span className="notification-badge success">SUCCESS</span>
                  <span>Se completó la sincronización con Google Workspace</span>
              </div>
          </div>
      </div>
    </>
  );
};

export default Dashboard;