import React from 'react';
import { Outlet } from 'react-router-dom'; 
import Sidebar from '../Sidebar/Sidebar';
import { UserProfile } from '../../App'; // Importamos este tipo desde App.tsx
// 1. CAMBIO: Ya no necesitamos supabase aquí
// import { supabase } from '../../supabaseClient'; 

type LayoutProps = {
  currentUser: UserProfile; 
  onLogout: () => void; // 2. AÑADIDO: Recibimos la función de logout
};

const Layout: React.FC<LayoutProps> = ({ currentUser, onLogout }) => {

  // 3. CAMBIO: Eliminamos la función 'handleLogout' interna que
  // llamaba a supabase.auth.signOut()

  // Mapear roles a iconos y colores
  const getRoleInfo = (rol: string) => {
    const roleMap: { [key: string]: { icon: string; color: string; label: string } } = {
      'student': { icon: '🎓', color: '#667eea', label: 'Estudiante' },
      'teacher': { icon: '👨‍🏫', color: '#f093fb', label: 'Docente' },
      'psychologist': { icon: '🧠', color: '#4facfe', label: 'Psicólogo' },
      'director': { icon: '👔', color: '#43e97b', label: 'Director' },
      'admin': { icon: '🛡️', color: '#fa709a', label: 'Administrador' }
    };
    return roleMap[rol] || { icon: '👤', color: '#6b7280', label: rol };
  };

  const roleInfo = getRoleInfo(currentUser.rol);

  return (
    <>
      <header className="header">
        <div className="logo-container">
          <div className="logo-icon">🎓</div>
          <div className="logo-text">
            <span className="logo-main">APT</span>
            <span className="logo-sub">Plataforma Educativa Integral</span>
          </div>
        </div>
        <div className="user-info">
          <div className="user-details">
            <span className="user-email">{currentUser.email}</span>
            <span className="user-role-badge" style={{ backgroundColor: roleInfo.color }}>
              {roleInfo.icon} {roleInfo.label}
            </span>
          </div>
          <div className="user-avatar" id="userAvatar" style={{ background: `linear-gradient(135deg, ${roleInfo.color} 0%, ${roleInfo.color}dd 100%)` }}>
            {currentUser.nombre?.charAt(0) || currentUser.email.charAt(0).toUpperCase()}
          </div>
          <button 
            onClick={onLogout}
            className="btn-logout"
          >
            <span className="btn-icon">🚪</span>
            <span className="btn-text">Salir</span>
          </button>
        </div>
      </header>

      <div className="container">
        {/* Tu Sidebar usará el 'rol' simulado, lo cual es perfecto */}
        <Sidebar role={currentUser.rol} />
        
        <main className="main-content">
          <Outlet /> 
        </main>
      </div>
    </>
  );
};

export default Layout;