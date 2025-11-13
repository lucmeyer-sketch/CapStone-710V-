// Contenido para src/App.tsx

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importamos los componentes que creamos (con la ruta corregida)
import Layout from './components/Layout/Layout';
import RoleSelector, { User } from './components/RoleSelector/RoleSelector';
import Dashboard from './components/Dashboard/Dashboard';

// --- Importamos TODOS los componentes de página reales (con la ruta corregida) ---
import AttendanceSystem from './components/Attendance/AttendanceSystem';
import ReportsSystem from './components/Reports/ReportsSystem';
import StudentManagement from './components/Students/StudentManagement';
import MessagingSystem from './components/Messaging/MessagingSystem';
import StudentDashboard from './components/StudentDashboard/StudentDashboard';
import PsychologistDashboard from './components/PsychologistDashboard/PsychologistDashboard';
import DirectorDashboard from './components/DirectorDashboard/DirectorDashboard';

// Importamos el CSS que pegamos en el Paso 1
import './index.css';

// --- Componentes vacíos que aún no hemos hecho ---
const Settings = () => <h1 className="page-title">Página de Configuración</h1>;


function App() {
  // Estado para guardar el usuario actual
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Función que se pasa al RoleSelector
  const handleSelectRole = (role: string, name: string, roleName: string) => {
    setCurrentUser({ role, name, roleName });
  };

  // Función para "cerrar sesión" y volver al selector
  const showRoleSelector = () => {
    setCurrentUser(null);
  };

  return (
    <BrowserRouter>
      {/* Si NO hay usuario (currentUser es null), mostramos el Selector de Roles.
        Si SÍ hay usuario, mostramos las Rutas (la aplicación principal).
      */}
      {!currentUser ? (
        <RoleSelector onSelectRole={handleSelectRole} />
      ) : (
        <Routes>
          {/* Esta es la ruta "principal" que usa nuestro Layout.
            Todas las páginas de adentro se mostrarán dentro del Layout.
          */}
          <Route 
            path="/" 
            element={<Layout currentUser={currentUser} onShowRoleSelector={showRoleSelector} />}
          >
            {/* Dependiendo del rol, la ruta "/dashboard" mostrará un componente diferente.
            */}
            <Route 
              path="dashboard" 
              element={
                currentUser.role === 'student' ? <StudentDashboard /> :
                currentUser.role === 'psychologist' ? <PsychologistDashboard /> :
                currentUser.role === 'director' ? <DirectorDashboard /> :
                <Dashboard /> // Default para 'teacher'
              } 
            />
            
            {/* --- Rutas para el Docente (AHORA CON LOS COMPONENTES REALES) --- */}
            <Route path="attendance" element={<AttendanceSystem />} />
            <Route path="reports" element={<ReportsSystem />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="messages" element={<MessagingSystem />} />
            <Route path="settings" element={<Settings />} />

            {/* Rutas para otros roles (puedes agregar más) */}
            <Route path="grades" element={<h1>Mis Notas</h1>} />
            <Route path="risk" element={<h1>Estudiantes en Riesgo</h1>} />
            <Route path="schedule" element={<h1>Agenda</h1>} />
            <Route path="metrics" element={<h1>Indicadores</h1>} />

            {/* Esta ruta redirige a /dashboard si entras a la raíz "/" */}
            <Route index element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;