import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Clase, Docente, Materia, Estudiante } from '../../types/database';
import { UsuarioConDetalles } from '../../services/authService';
import { formatearHorario, tieneClaseHoy } from '../../utils/horarioUtils';

interface ClaseCompleta extends Omit<Clase, 'materia' | 'docente'> {
  materia?: {
    id: number;
    nombre: string;
    codigo: string;
  };
  docente?: {
    id: number;
    nombre: string;
    apellido: string;
    especialidad?: string;
  };
  totalEstudiantes?: number;
}

interface AdminPanelProps {
  docenteActual: UsuarioConDetalles;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ docenteActual }) => {
  // Estados para modales
  const [modalInscripcion, setModalInscripcion] = useState<{
    abierto: boolean;
    clase: ClaseCompleta | null;
  }>({ abierto: false, clase: null });
  
  const [modalEdicion, setModalEdicion] = useState<{
    abierto: boolean;
    clase: ClaseCompleta | null;
  }>({ abierto: false, clase: null });
  
  const [estudiantesInscritos, setEstudiantesInscritos] = useState<number[]>([]);
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState<Estudiante[]>([]);
  const [clases, setClases] = useState<ClaseCompleta[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para formularios
  const [mostrarFormularioClase, setMostrarFormularioClase] = useState(false);

  // Formulario de nueva clase (pre-llenado con datos del docente)
  const [nuevaClase, setNuevaClase] = useState({
    materia_id: docenteActual.detalles?.materia?.id?.toString() || '',
    docente_id: docenteActual.detalles?.id?.toString() || '',
    grado: '',
    seccion: '',
    horario: '',
    aula: '',
    periodo: '2024-2'
  });



  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarClases(),
        cargarDocentes(),
        cargarMaterias(),
        cargarEstudiantes()
      ]);
    } catch (err: any) {
      setError('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarClases = async () => {
    // Paso 1: Obtener solo las clases del docente actual
    const docenteId = docenteActual.detalles?.id;
    if (!docenteId) {
      setClases([]);
      return;
    }

    const { data: clasesData, error: clasesError } = await supabase
      .from('clases')
      .select(`
        *,
        materia:materias (
          id,
          nombre,
          codigo
        )
      `)
      .eq('docente_id', docenteId)
      .order('grado', { ascending: true });

    if (clasesError) throw clasesError;
    if (!clasesData) {
      setClases([]);
      return;
    }

    // Paso 2: Obtener IDs únicos de docentes
    const docenteIds = Array.from(new Set(clasesData.map(c => c.docente_id)));
    
    // Paso 3: Obtener información de docentes
    const { data: docentesData } = await supabase
      .from('docentes')
      .select('id, nombre, apellido, especialidad')
      .in('id', docenteIds);

    // Paso 4: Contar estudiantes y combinar información
    const clasesConConteo = await Promise.all(
      clasesData.map(async (clase) => {
        // Contar estudiantes inscritos
        const { count } = await supabase
          .from('inscripciones')
          .select('*', { count: 'exact', head: true })
          .eq('clase_id', clase.id)
          .eq('estado', 'activo');

        // Encontrar información del docente
        const docente = docentesData?.find(d => d.id === clase.docente_id);

        return {
          ...clase,
          docente,
          totalEstudiantes: count || 0
        };
      })
    );

    setClases(clasesConConteo);
  };

  const cargarDocentes = async () => {
    const { data, error } = await supabase
      .from('docentes')
      .select('*')
      .eq('estado', 'activo')
      .order('apellido', { ascending: true });

    if (error) throw error;
    setDocentes(data || []);
  };

  const cargarMaterias = async () => {
    // Solo cargar la materia asignada al docente
    const materiaAsignada = docenteActual.detalles?.materia;
    
    if (materiaAsignada) {
      setMaterias([materiaAsignada as any]);
    } else {
      // Si no tiene materia asignada, mostrar todas (para asignar)
      const { data, error } = await supabase
        .from('materias')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setMaterias(data || []);
    }
  };

  const cargarEstudiantes = async () => {
    // Solo cargar estudiantes de los grados asignados al docente
    const gradosAsignados = docenteActual.detalles?.grados_array || [];
    
    if (gradosAsignados.length > 0) {
      // Obtener todos los estudiantes activos
      const { data, error } = await supabase
        .from('Estudiantes')
        .select('*')
        .eq('estado', 'activo')
        .order('apellido', { ascending: true });

      if (error) throw error;
      
      // Filtrar por grado y sección (formato: "10°A", "10°B", etc.)
      const estudiantesFiltrados = (data || []).filter(est => {
        const gradoSeccion = `${est.grado}${est.seccion}`;
        return gradosAsignados.includes(gradoSeccion);
      });
      
      setEstudiantes(estudiantesFiltrados);
    } else {
      // Si no tiene grados asignados, mostrar todos
      const { data, error } = await supabase
        .from('Estudiantes')
        .select('*')
        .eq('estado', 'activo')
        .order('apellido', { ascending: true });

      if (error) throw error;
      setEstudiantes(data || []);
    }
  };

  const handleCrearClase = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('clases')
        .insert({
          materia_id: parseInt(nuevaClase.materia_id),
          docente_id: parseInt(nuevaClase.docente_id),
          grado: nuevaClase.grado,
          seccion: nuevaClase.seccion,
          horario: nuevaClase.horario || null,
          aula: nuevaClase.aula || null,
          periodo: nuevaClase.periodo,
          estado: 'activo'
        });

      if (error) throw error;

      setSuccess('✅ Clase creada correctamente');
      setNuevaClase({
        materia_id: docenteActual.detalles?.materia?.id?.toString() || '',
        docente_id: docenteActual.detalles?.id?.toString() || '',
        grado: '',
        seccion: '',
        horario: '',
        aula: '',
        periodo: '2024-2'
      });
      setMostrarFormularioClase(false);
      cargarClases();
    } catch (err: any) {
      setError('Error al crear clase: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  // Gestionar inscripciones (añadir/eliminar estudiantes)
  const toggleInscripcionEstudiante = async (estudianteId: number) => {
    if (!modalInscripcion.clase) return;
    
    const estaInscrito = estudiantesInscritos.includes(estudianteId);
    
    try {
      if (estaInscrito) {
        // Eliminar inscripción
        const { error } = await supabase
          .from('inscripciones')
          .delete()
          .eq('clase_id', modalInscripcion.clase.id)
          .eq('estudiante_id', estudianteId);
        
        if (error) throw error;
        setEstudiantesInscritos(prev => prev.filter(id => id !== estudianteId));
        setSuccess('✅ Estudiante eliminado de la clase');
      } else {
        // Añadir inscripción
        const { error } = await supabase
          .from('inscripciones')
          .insert({
            clase_id: modalInscripcion.clase.id,
            estudiante_id: estudianteId,
            estado: 'activo'
          });
        
        if (error) throw error;
        setEstudiantesInscritos(prev => [...prev, estudianteId]);
        setSuccess('✅ Estudiante añadido a la clase');
      }
      
      // Recargar clases para actualizar contadores
      await cargarClases();
    } catch (err: any) {
      setError('Error al gestionar inscripción: ' + err.message);
    }
  };
  
  // Editar clase
  const handleEditarClase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEdicion.clase) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Actualizar directamente sin verificar duplicados
      // La base de datos manejará la restricción única si es necesario
      // La sección no se puede modificar, usar siempre el valor original
      const { error } = await supabase
        .from('clases')
        .update({
          grado: nuevaClase.grado,
          seccion: modalEdicion.clase.seccion, // Usar siempre el valor original, no se puede modificar
          horario: nuevaClase.horario || null,
          aula: nuevaClase.aula || null,
          periodo: nuevaClase.periodo
        })
        .eq('id', modalEdicion.clase.id);
      
      if (error) throw error;
      
      setSuccess('✅ Clase actualizada correctamente');
      setModalEdicion({ abierto: false, clase: null });
      await cargarClases();
    } catch (err: any) {
      // Manejar errores específicos de restricción única con mensaje claro
      if (err.message?.includes('duplicate key') || err.message?.includes('unique constraint')) {
        setError('⚠️ No se puede actualizar: Ya existe otra clase con la misma materia, grado, sección y período. Por favor, cambia alguno de estos valores o elimina la clase duplicada.');
      } else {
        setError('Error al actualizar clase: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Funciones para abrir modales
  const abrirModalInscripcion = async (clase: ClaseCompleta) => {
    setModalInscripcion({ abierto: true, clase });
    
    // Cargar estudiantes inscritos en esta clase
    const { data: inscripciones } = await supabase
      .from('inscripciones')
      .select('estudiante_id')
      .eq('clase_id', clase.id)
      .eq('estado', 'activo');
    
    const idsInscritos = inscripciones?.map(i => i.estudiante_id) || [];
    setEstudiantesInscritos(idsInscritos);
    
    // Cargar estudiantes disponibles del mismo grado
    const { data: estudiantes } = await supabase
      .from('Estudiantes')
      .select('*')
      .eq('estado', 'activo')
      .eq('grado', clase.grado)
      .eq('seccion', clase.seccion)
      .order('apellido', { ascending: true });
    
    setEstudiantesDisponibles(estudiantes || []);
  };
  
  const abrirModalEdicion = (clase: ClaseCompleta) => {
    setModalEdicion({ abierto: true, clase });
    setNuevaClase({
      materia_id: clase.materia?.id?.toString() || '',
      docente_id: clase.docente_id.toString(),
      grado: clase.grado,
      seccion: clase.seccion,
      horario: clase.horario || '',
      aula: clase.aula || '',
      periodo: clase.periodo || '2024-2'
    });
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#1f2937',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          🏛️ Panel de Administración
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>
          Gestiona clases, materias e inscripciones del sistema
        </p>
      </div>

      {/* Alertas */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#b91c1c',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#d1fae5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>{success}</span>
          <button
            onClick={() => setSuccess(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#065f46',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Contenido - Gestión de Clases */}
      <div>
        <div>
          {/* Header de Clases */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                📚 Gestión de Clases
              </h2>
              <button
                onClick={() => setMostrarFormularioClase(!mostrarFormularioClase)}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {mostrarFormularioClase ? '✕ Cancelar' : '➕ Nueva Clase'}
              </button>
            </div>

            {/* Estadísticas de Clases */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>
                  {clases.length}
                </div>
                <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>
                  Total Clases
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#166534' }}>
                  {clases.reduce((sum, c) => sum + (c.totalEstudiantes || 0), 0)}
                </div>
                <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
                  Total Inscritos
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#92400e' }}>
                  {docentes.length}
                </div>
                <div style={{ fontSize: '12px', color: '#d97706', fontWeight: '600' }}>
                  Docentes Activos
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fce7f3', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#be185d' }}>
                  {materias.length}
                </div>
                <div style={{ fontSize: '12px', color: '#ec4899', fontWeight: '600' }}>
                  Materias Disponibles
                </div>
              </div>
            </div>
          </div>

          {/* Formulario Nueva Clase */}
          {mostrarFormularioClase && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '2px solid #3b82f6'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1f2937' }}>
                ➕ Crear Nueva Clase
              </h3>

              <form onSubmit={handleCrearClase}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <label style={labelStyle}>Materia *</label>
                    <select
                      value={nuevaClase.materia_id}
                      onChange={(e) => setNuevaClase({ ...nuevaClase, materia_id: e.target.value })}
                      style={{ ...inputStyle, backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                      required
                      disabled
                      title="Solo puedes crear clases de tu materia asignada"
                    >
                      {materias.map(materia => (
                        <option key={materia.id} value={materia.id}>
                          {materia.nombre} ({materia.codigo})
                        </option>
                      ))}
                    </select>
                    <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      📌 Materia asignada (no modificable)
                    </small>
                  </div>

                  <div>
                    <label style={labelStyle}>Docente *</label>
                    <input
                      type="text"
                      value={`${docenteActual.detalles?.nombre || ''} ${docenteActual.detalles?.apellido || ''}`}
                      style={{ ...inputStyle, backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                      disabled
                      title="Eres el docente asignado"
                    />
                    <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      👤 Tú eres el docente de esta clase
                    </small>
                  </div>

                  <div>
                    <label style={labelStyle}>Grado *</label>
                    <select
                      value={nuevaClase.grado}
                      onChange={(e) => setNuevaClase({ ...nuevaClase, grado: e.target.value })}
                      style={inputStyle}
                      required
                    >
                      <option value="">Seleccionar grado</option>
                      {(docenteActual.detalles?.grados_array || []).map((gradoSeccion: string) => {
                        const grado = gradoSeccion.split(/(?=[A-Z])/)[0]; // Extraer solo el grado (10°A -> 10°)
                        return (
                          <option key={grado} value={grado}>
                            {grado}
                          </option>
                        );
                      }).filter((v: any, i: number, a: any[]) => a.indexOf(v) === i)} {/* Eliminar duplicados */}
                    </select>
                    <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      📚 Solo grados asignados: {(docenteActual.detalles?.grados_array || []).join(', ')}
                    </small>
                  </div>

                  <div>
                    <label style={labelStyle}>Sección *</label>
                    <select
                      value={nuevaClase.seccion}
                      onChange={(e) => setNuevaClase({ ...nuevaClase, seccion: e.target.value })}
                      style={inputStyle}
                      required
                      disabled={!nuevaClase.grado}
                    >
                      <option value="">Seleccionar sección</option>
                      {nuevaClase.grado && (docenteActual.detalles?.grados_array || [])
                        .filter((gs: string) => gs.startsWith(nuevaClase.grado))
                        .map((gs: string) => {
                          const seccion = gs.replace(nuevaClase.grado, '');
                          return (
                            <option key={seccion} value={seccion}>
                              {seccion}
                            </option>
                          );
                        })}
                    </select>
                    <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {!nuevaClase.grado ? '⚠️ Selecciona primero un grado' : '📋 Secciones disponibles para este grado'}
                    </small>
                  </div>

                  <div>
                    <label style={labelStyle}>Horario</label>
                    <input
                      type="text"
                      placeholder="Ej: Lunes 8:00-9:30"
                      value={nuevaClase.horario}
                      onChange={(e) => setNuevaClase({ ...nuevaClase, horario: e.target.value })}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Aula</label>
                    <input
                      type="text"
                      placeholder="Ej: Aula 101"
                      value={nuevaClase.aula}
                      onChange={(e) => setNuevaClase({ ...nuevaClase, aula: e.target.value })}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Período</label>
                    <input
                      type="text"
                      placeholder="Ej: 2024-2"
                      value={nuevaClase.periodo}
                      onChange={(e) => setNuevaClase({ ...nuevaClase, periodo: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: loading ? '#9ca3af' : '#10b981',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? '⏳ Creando...' : '✅ Crear Clase'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarFormularioClase(false)}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Clases */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1f2937' }}>
              📋 Clases Configuradas ({clases.length})
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
                <p>Cargando clases...</p>
              </div>
            ) : clases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#6b7280' }}>
                  No hay clases configuradas
                </p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  Crea tu primera clase con el botón de arriba
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {clases.map((clase) => (
                  <div
                    key={clase.id}
                    style={{
                      padding: '20px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '16px',
                      alignItems: 'start'
                    }}>
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '12px'
                        }}>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#1f2937',
                            margin: 0
                          }}>
                            {clase.materia?.nombre || 'Materia'}
                          </h4>
                          <span style={{
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {clase.grado}{clase.seccion}
                          </span>
                          <span style={{
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {clase.totalEstudiantes || 0} estudiantes
                          </span>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: '12px',
                          fontSize: '14px'
                        }}>
                          <div>
                            <span style={{ color: '#6b7280', fontWeight: '500' }}>👨‍🏫 Docente:</span>
                            <div style={{ fontWeight: '600', color: '#374151' }}>
                              {clase.docente ? `${clase.docente.apellido} ${clase.docente.nombre}` : 'Sin asignar'}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#6b7280', fontWeight: '500' }}>🕐 Horario:</span>
                            <div style={{ fontWeight: '600', color: '#374151' }}>
                              <span>
                                {formatearHorario(clase.horario)}
                                {tieneClaseHoy(clase.horario) && (
                                  <span style={{ 
                                    marginLeft: '8px', 
                                    backgroundColor: '#10b981', 
                                    color: 'white', 
                                    padding: '2px 8px', 
                                    borderRadius: '12px', 
                                    fontSize: '11px',
                                    fontWeight: '600'
                                  }}>
                                    Hoy
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#6b7280', fontWeight: '500' }}>🚪 Aula:</span>
                            <div style={{ fontWeight: '600', color: '#374151' }}>
                              {clase.aula || 'Por asignar'}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#6b7280', fontWeight: '500' }}>📅 Período:</span>
                            <div style={{ fontWeight: '600', color: '#374151' }}>
                              {clase.periodo || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          onClick={() => abrirModalInscripcion(clase)}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          👥 Inscribir
                        </button>
                        <button
                          onClick={() => abrirModalEdicion(clase)}
                          style={{
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️ Editar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Gestión de Inscripciones */}
      {modalInscripcion.abierto && modalInscripcion.clase && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                👥 Gestión de Inscripciones - {modalInscripcion.clase?.materia?.nombre} {modalInscripcion.clase?.grado}{modalInscripcion.clase?.seccion}
              </h2>
              <button
                onClick={() => {
                  setModalInscripcion({ abierto: false, clase: null });
                  setEstudiantesInscritos([]);
                  setEstudiantesDisponibles([]);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '12px'
            }}>
              {estudiantesDisponibles.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                  No hay estudiantes disponibles para este grado
                </p>
              ) : (
                estudiantesDisponibles.map((estudiante) => {
                  const estaInscrito = estudiantesInscritos.includes(estudiante.id);
                  return (
                    <div
                      key={estudiante.id}
                      onClick={() => toggleInscripcionEstudiante(estudiante.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: estaInscrito ? '#dbeafe' : 'transparent',
                        border: estaInscrito ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        marginBottom: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: estaInscrito ? '#3b82f6' : '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '12px'
                      }}>
                        {estaInscrito ? '✓' : '+'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          {estudiante.apellido}, {estudiante.nombre}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {estudiante.grado}{estudiante.seccion} • {estudiante.email}
                        </div>
                      </div>
                      <span style={{
                        backgroundColor: estaInscrito ? '#3b82f6' : '#9ca3af',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {estaInscrito ? 'Inscrito' : 'No inscrito'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>
                Total inscritos: <span style={{ color: '#3b82f6' }}>{estudiantesInscritos.length}</span> de {estudiantesDisponibles.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Eliminar sección duplicada de materias */}
      {false && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                👥 Gestión de Inscripciones - {modalInscripcion.clase?.materia?.nombre} {modalInscripcion.clase?.grado}{modalInscripcion.clase?.seccion}
              </h2>
              <button
                onClick={() => {
                  setModalInscripcion({ abierto: false, clase: null });
                  setEstudiantesInscritos([]);
                  setEstudiantesDisponibles([]);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '12px'
            }}>
              {estudiantesDisponibles.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                  No hay estudiantes disponibles para este grado
                </p>
              ) : (
                estudiantesDisponibles.map((estudiante) => {
                  const estaInscrito = estudiantesInscritos.includes(estudiante.id);
                  return (
                    <div
                      key={estudiante.id}
                      onClick={() => toggleInscripcionEstudiante(estudiante.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: estaInscrito ? '#dbeafe' : 'transparent',
                        border: estaInscrito ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        marginBottom: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: estaInscrito ? '#3b82f6' : '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '12px'
                      }}>
                        {estaInscrito ? '✓' : '+'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          {estudiante.apellido}, {estudiante.nombre}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {estudiante.grado}{estudiante.seccion} • {estudiante.email}
                        </div>
                      </div>
                      <span style={{
                        backgroundColor: estaInscrito ? '#3b82f6' : '#9ca3af',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {estaInscrito ? 'Inscrito' : 'No inscrito'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>
                Total inscritos: <span style={{ color: '#3b82f6' }}>{estudiantesInscritos.length}</span> de {estudiantesDisponibles.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestión de Inscripciones (duplicado - eliminar si existe otro) */}
      {modalInscripcion.abierto && modalInscripcion.clase && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                👥 Gestión de Inscripciones - {modalInscripcion.clase?.materia?.nombre} {modalInscripcion.clase?.grado}{modalInscripcion.clase?.seccion}
              </h2>
              <button
                onClick={() => {
                  setModalInscripcion({ abierto: false, clase: null });
                  setEstudiantesInscritos([]);
                  setEstudiantesDisponibles([]);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '12px'
            }}>
              {estudiantesDisponibles.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                  No hay estudiantes disponibles para este grado
                </p>
              ) : (
                estudiantesDisponibles.map((estudiante) => {
                  const estaInscrito = estudiantesInscritos.includes(estudiante.id);
                  return (
                    <div
                      key={estudiante.id}
                      onClick={() => toggleInscripcionEstudiante(estudiante.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: estaInscrito ? '#dbeafe' : 'transparent',
                        border: estaInscrito ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        marginBottom: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: estaInscrito ? '#3b82f6' : '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '12px'
                      }}>
                        {estaInscrito ? '✓' : '+'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          {estudiante.apellido}, {estudiante.nombre}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {estudiante.grado}{estudiante.seccion} • {estudiante.email}
                        </div>
                      </div>
                      <span style={{
                        backgroundColor: estaInscrito ? '#3b82f6' : '#9ca3af',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {estaInscrito ? 'Inscrito' : 'No inscrito'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>
                Total inscritos: <span style={{ color: '#3b82f6' }}>{estudiantesInscritos.length}</span> de {estudiantesDisponibles.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición de Clase */}
      {modalEdicion.abierto && modalEdicion.clase && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                ✏️ Editar Clase - {modalEdicion.clase.materia?.nombre}
              </h2>
              <button
                onClick={() => setModalEdicion({ abierto: false, clase: null })}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditarClase}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Grado *</label>
                  <select
                    value={nuevaClase.grado}
                    onChange={(e) => setNuevaClase({ ...nuevaClase, grado: e.target.value })}
                    style={inputStyle}
                    required
                  >
                    <option value="">Seleccionar grado</option>
                    {(docenteActual.detalles?.grados_array || []).map((gradoSeccion: string) => {
                      const grado = gradoSeccion.split(/(?=[A-Z])/)[0];
                      return (
                        <option key={grado} value={grado}>
                          {grado}
                        </option>
                      );
                    }).filter((v: any, i: number, a: any[]) => a.indexOf(v) === i)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Sección *</label>
                  <select
                    value={nuevaClase.seccion}
                    onChange={(e) => setNuevaClase({ ...nuevaClase, seccion: e.target.value })}
                    style={{
                      ...inputStyle,
                      backgroundColor: '#f3f4f6',
                      cursor: 'not-allowed',
                      opacity: 0.7
                    }}
                    required
                    disabled={true}
                    title="La sección no puede ser modificada"
                  >
                    <option value={nuevaClase.seccion}>{nuevaClase.seccion}</option>
                  </select>
                  <small style={{ 
                    color: '#6b7280', 
                    fontSize: '12px', 
                    marginTop: '4px', 
                    display: 'block',
                    fontStyle: 'italic'
                  }}>
                    🔒 La sección no puede ser modificada
                  </small>
                </div>

                <div>
                  <label style={labelStyle}>Horario</label>
                  <input
                    type="text"
                    placeholder="Ej: Lunes 8:00-9:30, Miércoles 8:00-9:30"
                    value={nuevaClase.horario}
                    onChange={(e) => setNuevaClase({ ...nuevaClase, horario: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Aula</label>
                  <input
                    type="text"
                    placeholder="Ej: Aula 101"
                    value={nuevaClase.aula}
                    onChange={(e) => setNuevaClase({ ...nuevaClase, aula: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Período</label>
                  <input
                    type="text"
                    placeholder="Ej: 2024-2"
                    value={nuevaClase.periodo}
                    onChange={(e) => setNuevaClase({ ...nuevaClase, periodo: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? '#9ca3af' : '#10b981',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    flex: 1
                  }}
                >
                  {loading ? '⏳ Guardando...' : '✅ Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalEdicion({ abierto: false, clase: null })}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: '600',
  fontSize: '14px',
  color: '#374151'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none'
};

export default AdminPanel;
