import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import AttendanceSystem from './components/Attendance/AttendanceSystem';
import ReportsSystem from './components/Reports/ReportsSystem';
import StudentManagement from './components/Students/StudentManagement';
import MessagingSystem from './components/Messages/MessagingSystem';
import MyClasses from './components/Classes/MyClasses';
import AdminPanel from './components/Administration/AdminPanel';
import StudentDashboard from './components/StudentDashboard/StudentDashboard';
import PsychologistDashboard from './components/PsychologistDashboard/PsychologistDashboard';
import DirectorDashboard from './components/DirectorDashboard/DirectorDashboard';
import ProfileSettings from './components/Settings/ProfileSettings';
import { UsuarioConDetalles, getUsuarioById } from './services/authService';

import './index.css';

// tipo simplificado para el perfil del usuario
export type UserProfile = {
  id: string;
  rol: string;
  email: string;
  nombre?: string;
  apellido?: string;
};

function App() {
  const [usuario, setUsuario] = useState<UsuarioConDetalles | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // verificar si hay un usuario guardado en localStorage
    const cargarUsuario = async () => {
      const usuarioGuardado = localStorage.getItem('usuario');
      if (usuarioGuardado) {
        try {
          const usuarioData = JSON.parse(usuarioGuardado);
          // Recargar datos completos desde la base de datos para obtener información actualizada
          const usuarioCompleto = await getUsuarioById(usuarioData.id);
          if (usuarioCompleto) {
            setUsuario(usuarioCompleto);
            // Actualizar localStorage con datos completos
            localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
          } else {
            // Si no se puede recargar, usar los datos guardados
            setUsuario(usuarioData);
          }
        } catch (error) {
          console.error('Error al cargar usuario guardado:', error);
          localStorage.removeItem('usuario');
        }
      }
      setLoading(false);
    };
    
    cargarUsuario();
  }, []);

  const handleLoginSuccess = (usuarioData: UsuarioConDetalles) => {
    setUsuario(usuarioData);
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
  };

  // convertir usuario a perfil compatible con el Layout
  // Mapear roles de BD a roles del frontend
  const mapearRol = (rolBD: string): string => {
    const mapeo: { [key: string]: string } = {
      'estudiante': 'student',
      'docente': 'teacher',
      'admin': 'admin',
      'psicologo': 'psychologist',
      'director': 'director'
    };
    return mapeo[rolBD] || rolBD;
  };

  const userProfile: UserProfile | null = usuario ? {
    id: usuario.id.toString(),
    rol: mapearRol(usuario.rol),
    email: usuario.email,
    nombre: usuario.detalles?.nombre,
    apellido: usuario.detalles?.apellido
  } : null;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {!usuario ? (
        // mostrar login si no hay usuario
        <Routes>
          <Route path="/" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        // mostrar aplicación si hay usuario
        <Routes>
          <Route 
            path="/" 
            element={<Layout currentUser={userProfile!} onLogout={handleLogout} />}
          >
            {/* Dashboard según rol */}
            <Route 
              path="dashboard" 
              element={
                usuario.rol === 'estudiante' ? <StudentDashboard /> :
                usuario.rol === 'psicologo' ? <PsychologistDashboard /> :
                usuario.rol === 'director' ? <DirectorDashboard /> :
                <Dashboard /> // Default para 'docente'
              } 
            />
            
            {/* Rutas para docentes */}
            {usuario.rol === 'docente' && (
              <>
                <Route path="admin" element={<AdminPanel docenteActual={usuario} />} />
                <Route 
                  path="classes" 
                  element={
                    <MyClasses 
                      docenteId={usuario.detalles?.id || 0} 
                      docenteNombre={`${usuario.detalles?.nombre || ''} ${usuario.detalles?.apellido || ''}`} 
                    />
                  } 
                />
                <Route path="attendance" element={<AttendanceSystem />} />
                <Route path="reports" element={<ReportsSystem />} />
                <Route path="students" element={<StudentManagement />} />
              </>
            )}
            
            {/* Rutas para estudiantes */}
            {usuario.rol === 'estudiante' && (
              <>
                <Route path="grades" element={<div className="page-title">Mis Notas (Próximamente)</div>} />
                <Route path="attendance" element={<div className="page-title">Mi Asistencia (Próximamente)</div>} />
              </>
            )}

            {/* Mensajería disponible para todos */}
            <Route path="messages" element={<MessagingSystem usuarioActual={usuario} />} />
            
            {/* Configuración disponible para todos */}
            <Route path="settings" element={<ProfileSettings usuario={usuario} onLogout={handleLogout} />} />
            
            <Route index element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
