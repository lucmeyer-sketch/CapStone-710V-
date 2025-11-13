// Contenido para src/components/Students/StudentManagement.tsx

import React, { useState, useEffect } from 'react';
// 1. Importamos nuestro cliente de Supabase
import { supabase } from '../../supabaseClient'; 

// 2. Definimos un "tipo" para nuestros datos de estudiante
//    (Esto es para que TypeScript sepa qué forma tienen nuestros datos)
interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  id_clase: number;
}

const StudentManagement: React.FC = () => {
  // 3. Creamos un "estado" para guardar la lista de estudiantes
  //    Inicialmente, es un array vacío.
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);

  // 4. Usamos useEffect para que llame a Supabase
  //    solo una vez, cuando el componente se carga por primera vez.
  useEffect(() => {
    getEstudiantes();
  }, []);

  // 5. Esta es la función que habla con Supabase
  async function getEstudiantes() {
    setLoading(true);
    try {
      // Pedimos a Supabase: "Selecciona todo (*) de la tabla Estudiantes"
      const { data, error } = await supabase
        .from('Estudiantes')
        .select('*');

      if (error) throw error; // Si hay un error, lo lanzamos
      if (data) {
        // Si todo sale bien, guardamos los datos en nuestro "estado"
        setEstudiantes(data);
      }
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
      alert('Error cargando los estudiantes');
    } finally {
      setLoading(false); // Dejamos de cargar
    }
  }

  // (Esta función es para el formulario, la dejaremos como simulación por ahora)
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    alert('Estudiante agregado (simulación)');
  };

  return (
    <>
      <h1 className="page-title">Gestión de Estudiantes</h1>
                
      <div className="section">
          <h2>Agregar Estudiante</h2>
          {/* ... (el formulario se queda igual por ahora) ... */}
          <form id="studentForm" onSubmit={handleSubmit}>
              {/* ... (todo el <form> ... */}
          </form>
      </div>

      <div className="section">
          <h2>Lista de Estudiantes</h2>
          <table className="table">
              <thead>
                  <tr>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>ID de Clase</th> {/* ¡Cambiamos las columnas! */}
                      <th>Acciones</th>
                  </tr>
              </thead>
              <tbody>
                {/* 6. Hacemos un "map" (un bucle) sobre la lista de estudiantes
                       que obtuvimos de Supabase y creamos una fila (<tr>) por cada uno.
                */}
                {loading ? (
                  <tr><td colSpan={4}>Cargando...</td></tr>
                ) : (
                  estudiantes.map((estudiante) => (
                    <tr key={estudiante.id}>
                      <td>{estudiante.nombre}</td>
                      <td>{estudiante.apellido}</td>
                      <td>{estudiante.id_clase}</td>
                      <td>
                          <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Editar</button>
                          <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', marginLeft: '0.5rem', backgroundColor: '#dc3545' }}>Eliminar</button>
                      </td>
                    </tr>
                  ))
                )}
                {/* 7. Borramos los datos estáticos de Juan Pérez y Sofía López */}
              </tbody>
          </table>
      </div>
    </>
  );
};

export default StudentManagement;