import React from 'react';

const StudentDashboard: React.FC = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
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
          🎓 Panel del Estudiante
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Bienvenido a tu panel personalizado
        </p>
      </div>

      {/* Estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: '#ede9fe',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #ddd6fe',
          boxShadow: '0 2px 4px rgba(124, 58, 237, 0.1)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#7c3aed' }}>
            85%
          </div>
          <div style={{ fontSize: '13px', color: '#6d28d9', fontWeight: '500' }}>Promedio General</div>
        </div>

        <div style={{
          backgroundColor: '#d1fae5',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #a7f3d0',
          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#059669' }}>
            95%
          </div>
          <div style={{ fontSize: '13px', color: '#047857', fontWeight: '500' }}>Asistencia</div>
        </div>

        <div style={{
          backgroundColor: '#dbeafe',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #bfdbfe',
          boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb' }}>
            8
          </div>
          <div style={{ fontSize: '13px', color: '#1d4ed8', fontWeight: '500' }}>Materias</div>
        </div>

        <div style={{
          backgroundColor: '#fef3c7',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #fde68a',
          boxShadow: '0 2px 4px rgba(217, 119, 6, 0.1)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#d97706' }}>
            3
          </div>
          <div style={{ fontSize: '13px', color: '#b45309', fontWeight: '500' }}>Mensajes</div>
        </div>
      </div>

      {/* Secciones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Mis Calificaciones */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            📊 Mis Calificaciones Recientes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { materia: 'Matemáticas', nota: '6.5', color: '#10b981' },
              { materia: 'Lenguaje', nota: '6.8', color: '#10b981' },
              { materia: 'Ciencias', nota: '5.5', color: '#f59e0b' },
              { materia: 'Historia', nota: '6.2', color: '#10b981' }
            ].map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  {item.materia}
                </span>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: item.color
                }}>
                  {item.nota}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mi Asistencia */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            📅 Mi Asistencia
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { dia: 'Lunes 20/11', estado: 'Presente', color: '#10b981', icon: '✓' },
              { dia: 'Martes 21/11', estado: 'Presente', color: '#10b981', icon: '✓' },
              { dia: 'Miércoles 22/11', estado: 'Tarde', color: '#f59e0b', icon: '⏰' },
              { dia: 'Jueves 23/11', estado: 'Presente', color: '#10b981', icon: '✓' }
            ].map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {item.dia}
                </span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {item.icon} {item.estado}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tareas Pendientes */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            📝 Tareas Pendientes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { tarea: 'Ensayo de Lenguaje', fecha: 'Para el 25/11', urgente: true },
              { tarea: 'Ejercicios de Matemáticas', fecha: 'Para el 27/11', urgente: false },
              { tarea: 'Proyecto de Ciencias', fecha: 'Para el 30/11', urgente: false }
            ].map((item, idx) => (
              <div key={idx} style={{
                padding: '12px',
                backgroundColor: item.urgente ? '#fef3c7' : '#f9fafb',
                borderRadius: '8px',
                borderLeft: `4px solid ${item.urgente ? '#f59e0b' : '#e5e7eb'}`
              }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  {item.tarea}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {item.fecha}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mensaje de Bienvenida */}
      <div style={{
        marginTop: '24px',
        backgroundColor: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ fontSize: '48px' }}>👋</div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#0369a1', marginBottom: '4px' }}>
            ¡Bienvenido de vuelta!
          </div>
          <div style={{ fontSize: '14px', color: '#075985' }}>
            Tienes 3 tareas pendientes y 2 mensajes nuevos de tus profesores.
            Continúa con tu excelente trabajo! 🎉
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
