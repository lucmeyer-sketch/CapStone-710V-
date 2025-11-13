// Contenido para src/components/Attendance/AttendanceSystem.tsx

import React from 'react';
// No necesitamos importar nada de MUI por ahora, ya que usamos 
// las clases de CSS de tu index.html

const AttendanceSystem: React.FC = () => {

  // Esta función es para que el formulario no recargue la página
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    alert('Asistencia registrada (simulación)');
  };

  return (
    <>
      <h1 className="page-title">Control de Asistencia</h1>
                
      <div className="section">
          <h2>Registrar Asistencia</h2>
          <form id="attendanceForm" onSubmit={handleSubmit}>
              <div className="form-row">
                  <div className="form-group">
                      <label htmlFor="attendanceDate">Fecha</label>
                      <input type="date" id="attendanceDate" defaultValue="2024-01-15" />
                  </div>
                  <div className="form-group">
                      <label htmlFor="studentSelect">Estudiante</label>
                      <select id="studentSelect" defaultValue="">
                          <option value="">Seleccionar estudiante</option>
                          <option value="1">Juan Pérez - 10°A</option>
                          <option value="2">Sofía López - 10°A</option>
                          <option value="3">Diego Ramírez - 11°B</option>
                      </select>
                  </div>
              </div>
              <div className="form-row">
                  <div className="form-group">
                      <label htmlFor="attendanceStatus">Estado</label>
                      <select id="attendanceStatus" defaultValue="present">
                          <option value="present">Presente</option>
                          <option value="absent">Ausente</option>
                          <option value="late">Tardanza</option>
                          <option value="excused">Justificado</option>
                      </select>
                  </div>
                  <div className="form-group">
                      <label htmlFor="attendanceNotes">Notas (opcional)</label>
                      <input type="text" id="attendanceNotes" placeholder="Notas adicionales" />
                  </div>
              </div>
              <button type="submit" className="btn">Registrar Asistencia</button>
          </form>
      </div>

      <div className="section">
          <h2>Lista de Asistencia - Hoy</h2>
          <table className="table">
              <thead>
                  <tr>
                      <th>Estudiante</th>
                      <th>Grado/Sección</th>
                      <th>Estado</th>
                      <th>Notas</th>
                  </tr>
              </thead>
              <tbody id="attendanceTableBody">
                  <tr>
                      <td>Juan Pérez</td>
                      <td>10°A</td>
                      <td><span className="status-badge success">Presente</span></td>
                      <td>-</td>
                  </tr>
                  <tr>
                      <td>Sofía López</td>
                      <td>10°A</td>
                      <td><span className="status-badge warning">Tardanza</span></td>
                      <td>Llegó 10 min tarde</td>
                  </tr>
                  <tr>
                      <td>Diego Ramírez</td>
                      <td>11°B</td>
                      <td><span className="status-badge error">Ausente</span></td>
                      <td>Justificación médica</td>
                  </tr>
              </tbody>
          </table>
      </div>
    </>
  );
};

export default AttendanceSystem;