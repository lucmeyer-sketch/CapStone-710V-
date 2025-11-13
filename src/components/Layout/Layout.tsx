// Contenido para src/components/Layout/Layout.tsx

import React from 'react';
// Outlet es el "espacio" donde React Router pondrá la página actual (ej. Dashboard)
import { Outlet } from 'react-router-dom'; 
import Sidebar from '../Sidebar/Sidebar'; // Importamos el Sidebar que creamos
import { User } from '../RoleSelector/RoleSelector'; // Importamos el tipo User

type LayoutProps = {
  currentUser: User;
  onShowRoleSelector: () => void; // Función para volver a mostrar el selector
};

const Layout: React.FC<LayoutProps> = ({ currentUser, onShowRoleSelector }) => {
  return (
    <>
      <header className="header">
        <div className="logo">APT - Plataforma SaaS Educativa Integral</div>
        <div className="user-info">
          <span id="userName">{`${currentUser.name} (${currentUser.roleName})`}</span>
          <div className="user-avatar" id="userAvatar">
            {currentUser.name.charAt(0)}
          </div>
          <button 
            onClick={onShowRoleSelector} 
            className="btn" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}
          >
            Cambiar Rol
          </button>
        </div>
      </header>

      <div className="container">
        <Sidebar role={currentUser.role} />
        
        <main className="main-content">
          {/* Aquí es donde se cargarán tus páginas (Dashboard, Reports, etc.) */}
          <Outlet /> 
        </main>
      </div>
    </>
  );
};

export default Layout;