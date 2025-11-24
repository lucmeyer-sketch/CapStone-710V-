// Contenido para src/components/Sidebar/Sidebar.tsx

import React from 'react';
// Usamos NavLink en lugar de Link para que sepa cuál es la "página activa"
import { NavLink } from 'react-router-dom'; 

// Definimos los props que recibirá (el rol del usuario actual)
type SidebarProps = {
  role: string;
};

// Definimos un tipo para los enlaces
type NavItem = {
  path: string;
  text: string;
  icon: string;
};

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  let navItems: NavItem[] = [];

  // Esta lógica es la misma de tu index.html, pero adaptada a React
  switch (role) {
    case 'student':
      navItems = [
        { text: 'Mi Perfil', icon: '👤', path: '/dashboard' },
        { text: 'Mis Notas', icon: '📊', path: '/grades' },
        { text: 'Mi Asistencia', icon: '📅', path: '/attendance' },
        { text: 'Mensajes', icon: '💬', path: '/messages' },
        { text: 'Configuración', icon: '⚙️', path: '/settings' }
      ];
      break;
    case 'psychologist':
      navItems = [
        { text: 'Panel Principal', icon: '🧠', path: '/dashboard' },
        { text: 'Estudiantes en Riesgo', icon: '⚠️', path: '/risk' },
        { text: 'Agenda', icon: '📅', path: '/schedule' },
        { text: 'Reportes', icon: '📈', path: '/reports' },
        { text: 'Mensajería', icon: '💬', path: '/messages' },
        { text: 'Configuración', icon: '⚙️', path: '/settings' }
      ];
      break;
    case 'director':
      navItems = [
        { text: 'Panel Directivo', icon: '👔', path: '/dashboard' },
        { text: 'Indicadores', icon: '📊', path: '/metrics' },
        { text: 'Reportes Ejecutivos', icon: '📈', path: '/reports' },
        { text: 'Mensajería', icon: '💬', path: '/messages' },
        { text: 'Configuración', icon: '⚙️', path: '/settings' }
      ];
      break;
    default: // 'teacher'
      navItems = [
        { text: 'Dashboard', icon: '📊', path: '/dashboard' },
        { text: 'Asistencia', icon: '🏫', path: '/attendance' },
        { text: 'Reportes', icon: '📈', path: '/reports' },
        { text: 'Estudiantes', icon: '👥', path: '/students' },
        { text: 'Mensajería', icon: '💬', path: '/messages' },
        { text: 'Configuración', icon: '⚙️', path: '/settings' }
      ];
  }

  return (
    <nav className="sidebar">
      {navItems.map((item) => (
        <NavLink 
          to={item.path} 
          key={item.path}
          // Esto hace que el link activo tenga la clase 'active'
          className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
        >
          <i>{item.icon}</i>
          {item.text}
        </NavLink>
      ))}
    </nav>
  );
};

export default Sidebar;