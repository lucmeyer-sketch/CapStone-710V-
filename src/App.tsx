import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// 1. CAMBIO: Ya no necesitamos Session ni el auth de supabase aquí
// import { Session } from '@supabase/supabase-js';
// import { supabase } from './supabaseClient';

// 2. CAMBIO: Importamos RoleSelector en vez de Login
// import Login from './components/Login/Login';
import RoleSelector from './components/RoleSelector/RoleSelector'; // <-- AÑADE ESTA LÍNEA

// (El resto de imports de páginas se queda igual)
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import AttendanceSystem from './components/Attendance/AttendanceSystem';
import ReportsSystem from './components/Reports/ReportsSystem';
import StudentManagement from './components/Students/StudentManagement';
import MessagingSystem from './components/Messaging/MessagingSystem';
import StudentDashboard from './components/StudentDashboard/StudentDashboard';
import PsychologistDashboard from './components/PsychologistDashboard/PsychologistDashboard';
import DirectorDashboard from './components/DirectorDashboard/DirectorDashboard';

import './index.css';

// El tipo UserProfile se queda igual, ¡es perfecto!
export type UserProfile = {
  id: string;
  rol: string;
  email: string;
};

const Settings = () => <h1 className="page-title">Página de Configuración</h1>;

function App() {
  // 3. CAMBIO: Dejamos solo el estado del perfil.
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // 4. CAMBIO: Eliminamos todo el useEffect, onAuthStateChange, y fetchProfile
  
  // 5. AÑADIDO: Creamos la función para el RoleSelector
  // Esta función "simula" un inicio de sesión
  const handleSelectRole = (role: string, name: string, roleName: string) => {
    // Creamos un perfil falso que coincida con el tipo UserProfile
    // que el resto de tu app (Layout, Sidebar) espera.
    const fakeProfile: UserProfile = {
      id: 'usuario-simulado-123',
      rol: role, // 'teacher', 'student', etc.
      email: `${name.toLowerCase().replace(' ', '.')}@simulado.com` // ej: jose.rodriguez@simulado.com
    };
    setProfile(fakeProfile);
  };

  // 6. AÑADIDO: Creamos la función de "logout" que simplemente borra el perfil
  const handleLogout = () => {
    setProfile(null); // Borramos el perfil para volver al selector
  };

  // Si tenías un estado 'loading', puedes borrarlo o dejarlo en 'false'
  // if (loading) return null;

  return (
    <BrowserRouter>
      {/* 7. CAMBIO: La lógica principal ahora es solo 'profile' */}
      {!profile ? (
        // Si NO hay perfil, muestra el RoleSelector
        <Routes>
          {/* Usamos 'onSelectRole' que espera RoleSelector.tsx */}
          <Route path="/" element={<RoleSelector onSelectRole={handleSelectRole} />} />
          {/* Cualquier otra ruta, redirige al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        // Si SÍ hay perfil, muestra la app
        <Routes>
          <Route 
            path="/" 
            // 8. CAMBIO: Pasamos la función de logout al Layout
            element={<Layout currentUser={profile} onLogout={handleLogout} />}
          >
            {/* El resto de tus rutas anidadas funciona perfecto */}
            <Route 
              path="dashboard" 
              element={
                profile.rol === 'student' ? <StudentDashboard /> :
                profile.rol === 'psychologist' ? <PsychologistDashboard /> :
                profile.rol === 'director' ? <DirectorDashboard /> :
                <Dashboard /> // Default para 'teacher'
              } 
            />
            
            {profile.rol === 'teacher' && (
              <>
                <Route path="attendance" element={<AttendanceSystem />} />
                <Route path="reports" element={<ReportsSystem />} />
                <Route path="students" element={<StudentManagement />} />
                <Route path="settings" element={<Settings />} />
              </>
            )}

            <Route path="messages" element={<MessagingSystem />} />
            
            {/* ... más rutas ... */}

            <Route index element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;