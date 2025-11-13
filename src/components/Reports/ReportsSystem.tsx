// Contenido para src/components/Reports/ReportsSystem.tsx

import React from 'react';

const ReportsSystem: React.FC = () => {

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    alert('Reporte generado (simulación)');
  };

  return (
    <>
      <h1 className="page-title">Sistema de Reportes</h1>
                
      <div className="section">
          <h2>Generar Nuevo Reporte</h2>
          <form id="reportForm" onSubmit={handleSubmit}>
              <div className="form-row">
                  <div className="form-group">
                      <label htmlFor="reportType">Tipo de Reporte</label>
                      <select id="reportType">
                          <option value="attendance">Reporte de Asistencia</option>
                          <option value="academic">Reporte Académico</option>
                          <option value="institutional">Reporte Institucional</option>
                      </select>
                  </div>
                  <div className="form-group">
                      <label htmlFor="reportGrade">Grado</label>
                      <select id="reportGrade" defaultValue="">
                          <option value="">Todos</option>
                          <option value="9">9°</option>
                          <option value="10">10°</option>
                          <option value="11">11°</option>
                          <option value="12">12°</option>
                      </select>
                  </div>
              </div>
              <div className="form-row">
                  <div className="form-group">
                      <label htmlFor="startDate">Fecha Inicio</label>
                      <input type="date" id="startDate" defaultValue="2024-01-01" />
                  </div>
                  <div className="form-group">
                      <label htmlFor="endDate">Fecha Fin</label>
                      <input type="date" id="endDate" defaultValue="2024-01-31" />
                  </div>
              </div>
              <button type="submit" className="btn">Generar Reporte</button>
          </form>
      </div>

      <div className="section">
          <h2>Reportes Generados</h2>
          <table className="table">
              <thead>
                  <tr>
                      <th>Título</th>
                      <th>Tipo</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td>Reporte de Asistencia - Enero 2024</td>
                      <td><span className="status-badge info">Asistencia</span></td>
                      <td>15/01/2024</td>
                      <td><span className="status-badge success">Completado</span></td>
                      <td>
                          <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Ver</button>
                          <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}>Descargar</button>
                      </td>
                  </tr>
                  <tr>
                      <td>Reporte Académico - Diciembre 2023</td>
                      <td><span className="status-badge success">Académico</span></td>
                      <td>30/12/2023</td>
                      <td><span className="status-badge success">Completado</span></td>
                      <td>
                          <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Ver</button>
                          <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}>Descargar</button>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
    </>
  );
};

export default ReportsSystem;