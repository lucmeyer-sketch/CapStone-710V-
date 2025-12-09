import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNotification } from '../../hooks/useNotification';

interface Estudiante {
  id: number;
  rut?: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  grado?: string;
  seccion?: string;
  estado?: 'activo' | 'inactivo' | 'graduado';
  tutor_nombre?: string;
  tutor_telefono?: string;
  tutor_email?: string;
  created_at?: string;
  updated_at?: string;
}

const StudentManagement: React.FC = () => {
  const { showNotification, NotificationContainer } = useNotification();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrado, setFilterGrado] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [formData, setFormData] = useState<Partial<Estudiante>>({
    rut: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: '',
    grado: '',
    seccion: '',
    estado: 'activo',
    tutor_nombre: '',
    tutor_telefono: '',
    tutor_email: ''
  });

  useEffect(() => {
    cargarEstudiantes();
  }, []);

  const cargarEstudiantes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Estudiantes')
        .select('*')
        .order('apellido', { ascending: true });

      if (error) throw error;
      setEstudiantes(data || []);
      setError(null);
    } catch (err: any) {
      setError('Error al cargar estudiantes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.apellido) {
      setError('El nombre y apellido son obligatorios');
      return;
    }

    try {
      setLoading(true);

      if (modoEdicion && estudianteSeleccionado) {
        // Actualizar
        const { error } = await supabase
          .from('Estudiantes')
          .update({
            rut: formData.rut || null,
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email || null,
            telefono: formData.telefono || null,
            direccion: formData.direccion || null,
            fecha_nacimiento: formData.fecha_nacimiento || null,
            grado: formData.grado || null,
            seccion: formData.seccion || null,
            estado: formData.estado || 'activo',
            tutor_nombre: formData.tutor_nombre || null,
            tutor_telefono: formData.tutor_telefono || null,
            tutor_email: formData.tutor_email || null
          })
          .eq('id', estudianteSeleccionado.id);

        if (error) throw error;
        showNotification('Estudiante actualizado correctamente', 'success');
      } else {
        // Crear
        const { error } = await supabase
          .from('Estudiantes')
          .insert({
            rut: formData.rut || null,
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email || null,
            telefono: formData.telefono || null,
            direccion: formData.direccion || null,
            fecha_nacimiento: formData.fecha_nacimiento || null,
            grado: formData.grado || null,
            seccion: formData.seccion || null,
            estado: formData.estado || 'activo',
            tutor_nombre: formData.tutor_nombre || null,
            tutor_telefono: formData.tutor_telefono || null,
            tutor_email: formData.tutor_email || null
          });

        if (error) throw error;
        showNotification('Estudiante agregado correctamente', 'success');
      }

      limpiarFormulario();
      cargarEstudiantes();
      setMostrarFormulario(false);
    } catch (err: any) {
      const errorMessage = err.message || 'Error desconocido';
      setError('Error: ' + errorMessage);
      showNotification('Error: ' + errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (estudiante: Estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setFormData({
      rut: estudiante.rut || '',
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      email: estudiante.email || '',
      telefono: estudiante.telefono || '',
      direccion: estudiante.direccion || '',
      fecha_nacimiento: estudiante.fecha_nacimiento || '',
      grado: estudiante.grado || '',
      seccion: estudiante.seccion || '',
      estado: estudiante.estado || 'activo',
      tutor_nombre: estudiante.tutor_nombre || '',
      tutor_telefono: estudiante.tutor_telefono || '',
      tutor_email: estudiante.tutor_email || ''
    });
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id: number, nombre: string, apellido: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${nombre} ${apellido}?`)) {
      try {
        const { error } = await supabase
          .from('Estudiantes')
          .delete()
          .eq('id', id);

        if (error) throw error;
        showNotification('Estudiante eliminado correctamente', 'success');
        cargarEstudiantes();
      } catch (err: any) {
        const errorMessage = err.message || 'Error desconocido';
        setError('Error al eliminar: ' + errorMessage);
        showNotification('Error al eliminar: ' + errorMessage, 'error');
      }
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      rut: '',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      fecha_nacimiento: '',
      grado: '',
      seccion: '',
      estado: 'activo',
      tutor_nombre: '',
      tutor_telefono: '',
      tutor_email: ''
    });
    setModoEdicion(false);
    setEstudianteSeleccionado(null);
  };

  // Filtrar estudiantes
  const estudiantesFiltrados = estudiantes.filter(est => {
    const matchSearch = searchTerm === '' || 
      `${est.nombre} ${est.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchGrado = filterGrado === '' || est.grado === filterGrado;
    const matchEstado = filterEstado === '' || est.estado === filterEstado;

    return matchSearch && matchGrado && matchEstado;
  });

  // Calcular estadísticas
  const stats = {
    total: estudiantes.length,
    activos: estudiantes.filter(e => e.estado === 'activo').length,
    inactivos: estudiantes.filter(e => e.estado === 'inactivo').length,
    graduados: estudiantes.filter(e => e.estado === 'graduado').length
  };

  const grados = Array.from(new Set(estudiantes.map(e => e.grado).filter(Boolean))).sort();

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <NotificationContainer />
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700', 
          color: '#1a1a1a',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          👥 Gestión de Estudiantes
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Administra la información completa de todos los estudiantes
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ 
          padding: '16px 20px', 
          backgroundColor: '#fee', 
          border: '1px solid #fcc',
          color: '#c00',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#c00'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Estadísticas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        <div style={{ 
          backgroundColor: '#ede9fe', 
          padding: '20px', 
          borderRadius: '12px',
          border: '1px solid #ddd6fe',
          boxShadow: '0 2px 4px rgba(124, 58, 237, 0.1)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#7c3aed' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '13px', color: '#6d28d9', fontWeight: '500' }}>Total Estudiantes</div>
        </div>
        
        <div style={{ 
          backgroundColor: '#d1fae5', 
          padding: '20px', 
          borderRadius: '12px',
          border: '1px solid #a7f3d0',
          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#059669' }}>
            {stats.activos}
          </div>
          <div style={{ fontSize: '13px', color: '#047857', fontWeight: '500' }}>Activos</div>
        </div>
        
        <div style={{ 
          backgroundColor: '#fee2e2', 
          padding: '20px', 
          borderRadius: '12px',
          border: '1px solid #fecaca',
          boxShadow: '0 2px 4px rgba(220, 38, 38, 0.1)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏸</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#dc2626' }}>
            {stats.inactivos}
          </div>
          <div style={{ fontSize: '13px', color: '#b91c1c', fontWeight: '500' }}>Inactivos</div>
        </div>
        
        <div style={{ 
          backgroundColor: '#dbeafe', 
          padding: '20px', 
          borderRadius: '12px',
          border: '1px solid #bfdbfe',
          boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎓</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb' }}>
            {stats.graduados}
          </div>
          <div style={{ fontSize: '13px', color: '#1d4ed8', fontWeight: '500' }}>Graduados</div>
        </div>
      </div>

      {/* Controles: Búsqueda y Filtros */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div>
            <label style={labelStyle}>
              🔍 Buscar
            </label>
            <input 
              type="text"
              placeholder="Nombre, apellido o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              📚 Filtrar por Grado
            </label>
            <select 
              value={filterGrado}
              onChange={(e) => setFilterGrado(e.target.value)}
              style={inputStyle}
            >
              <option value="">Todos los grados</option>
              {grados.map(grado => (
                <option key={grado} value={grado}>{grado}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              📊 Filtrar por Estado
            </label>
            <select 
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              style={inputStyle}
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="graduado">Graduados</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            limpiarFormulario();
            setMostrarFormulario(!mostrarFormulario);
          }}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          {mostrarFormulario ? '✕ Cancelar' : '➕ Agregar Nuevo Estudiante'}
        </button>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '20px',
            color: '#374151'
          }}>
            {modoEdicion ? '✏️ Editar Estudiante' : '➕ Nuevo Estudiante'}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Información Personal */}
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#6b7280' }}>
              👤 Información Personal
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>RUT *</label>
                <input 
                  type="text"
                  value={formData.rut}
                  onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                  style={inputStyle}
                  required
                  placeholder="21.564.207-0"
                />
              </div>

              <div>
                <label style={labelStyle}>Nombre *</label>
                <input 
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  style={inputStyle}
                  required
                  placeholder="Ej: Juan"
                />
              </div>

              <div>
                <label style={labelStyle}>Apellido *</label>
                <input 
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  style={inputStyle}
                  required
                  placeholder="Ej: Pérez"
                />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={inputStyle}
                  placeholder="juan.perez@estudiante.edu"
                />
              </div>

              <div>
                <label style={labelStyle}>Teléfono</label>
                <input 
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  style={inputStyle}
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div>
                <label style={labelStyle}>Fecha de Nacimiento</label>
                <input 
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Dirección</label>
                <input 
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  style={inputStyle}
                  placeholder="Calle 123, Ciudad"
                />
              </div>
            </div>

            {/* Información Académica */}
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#6b7280' }}>
              🎓 Información Académica
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>Grado</label>
                <select 
                  value={formData.grado}
                  onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Seleccionar grado</option>
                  <option value="10°">10°</option>
                  <option value="11°">11°</option>
                  <option value="12°">12°</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Sección</label>
                <select 
                  value={formData.seccion}
                  onChange={(e) => setFormData({ ...formData, seccion: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Seleccionar sección</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Estado</label>
                <select 
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                  style={inputStyle}
                >
                  <option value="activo">✓ Activo</option>
                  <option value="inactivo">⏸ Inactivo</option>
                  <option value="graduado">🎓 Graduado</option>
                </select>
              </div>
            </div>

            {/* Información del Tutor */}
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#6b7280' }}>
              👨‍👩‍👦 Información del Tutor/Apoderado
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>Nombre del Tutor</label>
                <input 
                  type="text"
                  value={formData.tutor_nombre}
                  onChange={(e) => setFormData({ ...formData, tutor_nombre: e.target.value })}
                  style={inputStyle}
                  placeholder="Nombre completo del tutor"
                />
              </div>

              <div>
                <label style={labelStyle}>Teléfono del Tutor</label>
                <input 
                  type="tel"
                  value={formData.tutor_telefono}
                  onChange={(e) => setFormData({ ...formData, tutor_telefono: e.target.value })}
                  style={inputStyle}
                  placeholder="+56 9 8765 4321"
                />
              </div>

              <div>
                <label style={labelStyle}>Email del Tutor</label>
                <input 
                  type="email"
                  value={formData.tutor_email}
                  onChange={(e) => setFormData({ ...formData, tutor_email: e.target.value })}
                  style={inputStyle}
                  placeholder="tutor@correo.com"
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
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.4)'
                }}
              >
                {loading ? '⏳ Guardando...' : modoEdicion ? '✓ Actualizar' : '➕ Agregar'}
              </button>

              {modoEdicion && (
                <button 
                  type="button"
                  onClick={() => {
                    limpiarFormulario();
                    setMostrarFormulario(false);
                  }}
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
                  ✕ Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Lista de Estudiantes */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          marginBottom: '20px',
          color: '#374151'
        }}>
          📋 Lista de Estudiantes ({estudiantesFiltrados.length})
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p>Cargando estudiantes...</p>
          </div>
        ) : estudiantesFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
            <p style={{ fontSize: '18px', fontWeight: '500', color: '#6b7280' }}>
              No se encontraron estudiantes
            </p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              {searchTerm || filterGrado || filterEstado 
                ? 'Intenta con otros filtros de búsqueda'
                : 'Agrega tu primer estudiante usando el botón de arriba'
              }
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={tableHeaderStyle}>Estudiante</th>
                  <th style={tableHeaderStyle}>Email</th>
                  <th style={tableHeaderStyle}>Grado</th>
                  <th style={tableHeaderStyle}>Teléfono</th>
                  <th style={tableHeaderStyle}>Tutor</th>
                  <th style={tableHeaderStyle}>Estado</th>
                  <th style={tableHeaderStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesFiltrados.map((estudiante, index) => (
                  <tr 
                    key={estudiante.id}
                    style={{ 
                      backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f9fafb'}
                  >
                    <td style={tableCellStyle}>
                      <div style={{ fontWeight: '600', color: '#1f2937' }}>
                        {estudiante.apellido} {estudiante.nombre}
                      </div>
                      {estudiante.rut && (
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          🪪 {estudiante.rut}
                        </div>
                      )}
                      {estudiante.fecha_nacimiento && (
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                          📅 {new Date(estudiante.fecha_nacimiento).toLocaleDateString('es-ES')}
                        </div>
                      )}
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {estudiante.email || '-'}
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        backgroundColor: '#f3f4f6',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        {estudiante.grado} - {estudiante.seccion}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {estudiante.telefono || '-'}
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ fontSize: '13px', color: '#374151' }}>
                        {estudiante.tutor_nombre || '-'}
                      </div>
                      {estudiante.tutor_telefono && (
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                          📞 {estudiante.tutor_telefono}
                        </div>
                      )}
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: 
                          estudiante.estado === 'activo' ? '#dcfce7' :
                          estudiante.estado === 'inactivo' ? '#fee2e2' :
                          '#dbeafe',
                        color:
                          estudiante.estado === 'activo' ? '#15803d' :
                          estudiante.estado === 'inactivo' ? '#b91c1c' :
                          '#1d4ed8'
                      }}>
                        {estudiante.estado === 'activo' ? '✓ Activo' :
                         estudiante.estado === 'inactivo' ? '⏸ Inactivo' :
                         '🎓 Graduado'}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEditar(estudiante)}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(estudiante.id, estudiante.nombre, estudiante.apellido)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: '500',
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

const tableHeaderStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  borderBottom: '2px solid #e5e7eb',
  fontSize: '13px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const tableCellStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderBottom: '1px solid #e5e7eb',
  fontSize: '14px',
  color: '#1f2937'
};

export default StudentManagement;
