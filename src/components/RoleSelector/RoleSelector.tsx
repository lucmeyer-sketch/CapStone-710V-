
import React from 'react';

type RoleSelectorProps = {
  onSelectRole: (role: string, name: string, roleName: string) => void;
};


export type User = {
  role: string;
  name: string;
  roleName: string;
};

const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div className="overlay">
      <div className="role-selector">
        <h2>Selecciona tu Rol</h2>
        <div className="role-options">
          <div className="role-option" onClick={() => onSelectRole('teacher', 'José', 'Docente')}>
            <h3>👨‍🏫 Docente</h3>
            <p>Gestión de clases, asistencia y calificaciones</p>
          </div>
          <div className="role-option" onClick={() => onSelectRole('student', 'María García', 'Estudiante')}>
            <h3>🎓 Estudiante</h3>
            <p>Ver mis notas, asistencia y comunicaciones</p>
          </div>
          <div className="role-option" onClick={() => onSelectRole('psychologist', 'Ana Martínez', 'Psicóloga')}>
            <h3>🧠 Psicóloga</h3>
            <p>Seguimiento estudiantil y apoyo psicológico</p>
          </div>
          <div className="role-option" onClick={() => onSelectRole('director', 'Carlos Ruiz', 'Director')}>
            <h3>👔 Director</h3>
            <p>Gestión institucional y reportes ejecutivos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;