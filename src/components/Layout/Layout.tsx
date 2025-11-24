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

  return (
    <>
      <header className="header">
        <div className="logo">APT - Plataforma SaaS Educativa Integral</div>
        <div className="user-info">
          {/* Esto se queda igual, tomará el email simulado */}
          <span id="userName">{`${currentUser.email} (${currentUser.rol})`}</span>
          <div className="user-avatar" id="userAvatar">
            {currentUser.email.charAt(0).toUpperCase()}
          </div>
          
          {/* 4. CAMBIO: El botón ahora usa 'onLogout' y dice "Cambiar Rol" */}
          <button 
            onClick={onLogout} // Usa la función que viene de App.tsx
            className="btn" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}
          >
            Cambiar Rol 
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