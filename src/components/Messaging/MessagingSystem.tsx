// Contenido para src/components/Messaging/MessagingSystem.tsx

import React from 'react';

const MessagingSystem: React.FC = () => {

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    alert('Mensaje enviado (simulación)');
  };

  return (
    <>
      <h1 className="page-title">Mensajería Instantánea</h1>
                
      <div className="section">
          <h2>Nuevo Mensaje</h2>
          <form id="messageForm" onSubmit={handleSubmit}>
              <div className="form-row">
                  <div className="form-group">
                      <label htmlFor="messageType">Tipo de Mensaje</label>
                      <select id="messageType">
                          <option value="direct">Mensaje Directo</option>
                          <option value="group">Mensaje Grupal</option>
                          <option value="announcement">Anuncio</option>
                      </select>
                  </div>
                  <div className="form-group">
                      <label htmlFor="messageReceiver">Destinatario</label>
                      <select id="messageReceiver" defaultValue="">
                          <option value="">Seleccionar destinatario</option>
                          <option value="maria">María González (Administradora)</option>
                          <option value="carlos">Carlos Ruiz (Director)</option>
                          <option value="ana">Ana Martínez (Psicóloga)</option>
                      </select>
                  </div>
              </div>
              <div className="form-group">
                  <label htmlFor="messageContent">Mensaje</label>
                  <textarea id="messageContent" rows={4} placeholder="Escribe tu mensaje aquí..."></textarea>
              </div>
              <button type="submit" className="btn">Enviar Mensaje</button>
          </form>
      </div>

      <div className="section">
          <h2>Conversaciones Recientes</h2>
          <div className="notifications">
              <div className="notification info">
                  <span className="notification-badge info">DIRECTO</span>
                  <span><strong>María González (Administradora):</strong> "¿Podrías enviarme el reporte de asistencia de la semana pasada?"</span>
                  <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>Hace 2 horas</small>
              </div>
              <div className="notification warning">
                  <span className="notification-badge warning">GRUPAL</span>
                  <span><strong>Carlos Ruiz (Director):</strong> "Recordatorio: Reunión de coordinación académica mañana a las 10:00 AM."</span>
                  <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>Hace 4 horas</small>
              </div>
              {/* Puedes agregar el resto de los mensajes de tu index.html aquí */}
          </div>
      </div>
    </>
  );
};

export default MessagingSystem;