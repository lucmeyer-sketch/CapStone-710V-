// src/components/Students/StudentManagement.tsx

import React, { useState, useEffect } from 'react';
// 1. Importamos nuestro cliente de Supabase
import { supabase } from '../../supabaseClient'; 

// 2. Definimos un "tipo" para nuestros datos de estudiante
interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  id_clase: number;
}

const StudentManagement: React.FC = () => {
  // 3. Estados para la lista y la carga
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);

  // 4. Estados para los campos del formulario
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoApellido, setNuevoApellido] = useState('');
  const [nuevaClaseId, setNuevaClaseId] = useState(''); 

  // 5. useEffect se queda igual: carga los estudiantes al inicio
  useEffect(() => {
    getEstudiantes();
  }, []);

  // 6. Función para LEER estudiantes (se queda igual)
  async function getEstudiantes() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('Estudiantes')
        .select('*');

      if (error) throw error; 
      if (data) {
        setEstudiantes(data);
      }
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
    } finally {
      setLoading(false);
    }
  }

  // 7. Función para CREAR un estudiante (el formulario)
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Evita que la página se recargue

    if (!nuevoNombre || !nuevoApellido || !nuevaClaseId) {
      alert('Por favor completa todos los campos.');
      return;
    }

    try {
      const { error } = await supabase
        .from('Estudiantes')
        .insert({ 
          nombre: nuevoNombre, 
          apellido: nuevoApellido, 
          id_clase: parseInt(nuevaClaseId) 
        });

      if (error) throw error;

      setNuevoNombre('');
      setNuevoApellido('');
      setNuevaClaseId('');

      getEstudiantes(); 
      alert('¡Estudiante agregado con éxito!');

    } catch (error: any) {
      alert(`Error agregando estudiante: ${error.message}`);
    }
  };

  // 8. ¡NUEVA FUNCIÓN! Para ELIMINAR un estudiante
  const handleDelete = async (studentId: number) => {
    // Usamos 'window.confirm' (una alerta nativa del navegador)
    // para pedir confirmación.
    // Usaremos 'confirm' por ahora para simplificar,
    // ¡más adelante podríamos hacer un modal bonito!
    if (window.confirm("¿Estás seguro de que quieres eliminar este estudiante?")) {
      try {
        // 1. Usamos 'delete' de Supabase
        const { error } = await supabase
          .from('Estudiantes')
          .delete()
          .eq('id', studentId); // Borra la fila donde el 'id' coincida

        if (error) throw error;

        // 2. Si todo sale bien, volvemos a cargar la lista
        getEstudiantes(); 
        alert('Estudiante eliminado con éxito');

      } catch (error: any) {
        alert(`Error eliminando estudiante: ${error.message}`);
      }
    }
  };

  return (
    <>
      <h1 className="page-title">Gestión de Estudiantes</h1>
                
      <div className="section">
          <h2>Agregar Estudiante</h2>
          <form id="studentForm" onSubmit={handleSubmit}>
              <div className="form-row">
                  <div className="form-group">
                      <label htmlFor="studentName">Nombre</label>
                      <input 
                        type="text" 
                        id="studentName" 
                        placeholder="Nombre del estudiante"
                        value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)}
                      />
                  </div>
                  <div className="form-group">
                      <label htmlFor="studentLastName">Apellido</label>
                      <input 
                        type="text" 
                        id="studentLastName" 
                        placeholder="Apellido del estudiante"
                        value={nuevoApellido}
                        onChange={(e) => setNuevoApellido(e.target.value)}
                      />
                  </div>
              </div>
              <div className="form-group">
                  <label htmlFor="studentClassId">ID de Clase</label>
                  <input 
                    type="number" 
                    id="studentClassId" 
                    placeholder="Ej: 1 (para 1ro Básico A)"
                    value={nuevaClaseId}
                    onChange={(e) => setNuevaClaseId(e.target.value)}
                  />
              </div>
              <button type="submit" className="btn">Agregar Estudiante</button>
          </form>
      </div>

      <div className="section">
          <h2>Lista de Estudiantes</h2>
          <table className="table">
              <thead>
                  <tr>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>ID de Clase</th>
                      <th>Acciones</th>
                  </tr>
              </thead>
              <tbody>
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
                          
                          {/* 9. BOTÓN ACTUALIZADO */}
                          <button 
                            className="btn" 
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', marginLeft: '0.5rem', backgroundColor: '#dc3545' }}
                            onClick={() => handleDelete(estudiante.id)}
                          >
                            Eliminar
                          </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
          </table>
      </div>
    </>
  );
};

export default StudentManagement;