import React, { useState, useEffect } from 'react';
import { UsuarioConDetalles } from '../../services/authService';
import { supabase } from '../../supabaseClient';

interface ClaseAsignada {
  id: number;
  grado: string;
  seccion: string;
  horario?: string;
  aula?: string;
  materia?: {
    nombre: string;
    codigo: string;
  };
  totalEstudiantes?: number;
}

interface ProfileSettingsProps {
  usuario: UsuarioConDetalles;
  onLogout: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ usuario, onLogout }) => {
  const [editando, setEditando] = useState(false);
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [clasesAsignadas, setClasesAsignadas] = useState<ClaseAsignada[]>([]);

  const [formData, setFormData] = useState({
    nombre: usuario.detalles?.nombre || '',
    apellido: usuario.detalles?.apellido || '',
    telefono: usuario.detalles?.telefono || '',
    email: usuario.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    passwordActual: '',
    passwordNueva: '',
    passwordConfirm: ''
  });

  const esEstudiante = usuario.rol === 'estudiante';
  const esDocente = usuario.rol === 'docente';

  // obtener iniciales para el avatar
  const iniciales = `${usuario.detalles?.nombre?.charAt(0) || ''}${usuario.detalles?.apellido?.charAt(0) || ''}`.toUpperCase();

  // cargar clases asignadas si es docente
  useEffect(() => {
    if (esDocente && usuario.detalles?.id) {
      cargarClasesAsignadas();
    }
  }, [esDocente, usuario.detalles?.id]);

  const cargarClasesAsignadas = async () => {
    try {
      const { data: clasesData, error: clasesError } = await supabase
        .from('clases')
        .select(`
          *,
          materia:materias (
            nombre,
            codigo
          )
        `)
        .eq('docente_id', usuario.detalles?.id)
        .eq('estado', 'activo')
        .order('grado', { ascending: true });

      if (clasesError) throw clasesError;

      // para cada clase, contar estudiantes inscritos
      const clasesConConteo = await Promise.all(
        (clasesData || []).map(async (clase) => {
          const { count } = await supabase
            .from('inscripciones')
            .select('*', { count: 'exact', head: true })
            .eq('clase_id', clase.id)
            .eq('estado', 'activo');

          return {
            ...clase,
            totalEstudiantes: count || 0
          };
        })
      );

      setClasesAsignadas(clasesConConteo);
    } catch (err) {
      console.error('Error cargando clases:', err);
    }
  };

  // color del badge según el rol
  const getRolBadgeStyle = () => {
    if (esEstudiante) {
      return {
        bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        icon: '🎓',
        text: 'Estudiante'
      };
    } else if (esDocente) {
      return {
        bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        icon: '👨‍🏫',
        text: 'Docente'
      };
    } else {
      return {
        bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        icon: '🛡️',
        text: usuario.rol
      };
    }
  };

  const rolStyle = getRolBadgeStyle();

  const handleGuardarCambios = async () => {
    try {
      setLoading(true);
      setError(null);

      // actualizar en la tabla correspondiente
      const tabla = esEstudiante ? 'Estudiantes' : 'docentes';
      
      const { error: updateError } = await supabase
        .from(tabla)
        .update({
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono || null
        })
        .eq('id', usuario.detalles?.id);

      if (updateError) throw updateError;

      // actualizar usuario en localStorage
      const usuarioActualizado = {
        ...usuario,
        detalles: {
          ...usuario.detalles,
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono
        }
      };
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));

      setSuccess('✅ Perfil actualizado correctamente');
      setEditando(false);
      
      // recargar página después de 1 segundo para reflejar cambios
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err: any) {
      setError('Error al actualizar perfil: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPassword = async () => {
    if (passwordData.passwordNueva !== passwordData.passwordConfirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.passwordNueva.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // actualizar contraseña en la tabla usuarios
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ password: passwordData.passwordNueva })
        .eq('email', usuario.email);

      if (updateError) throw updateError;

      setSuccess('✅ Contraseña actualizada correctamente');
      setPasswordData({ passwordActual: '', passwordNueva: '', passwordConfirm: '' });
      setCambiandoPassword(false);

    } catch (err: any) {
      setError('Error al cambiar contraseña: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    setFormData({
      nombre: usuario.detalles?.nombre || '',
      apellido: usuario.detalles?.apellido || '',
      telefono: usuario.detalles?.telefono || '',
      email: usuario.email || ''
    });
    setEditando(false);
    setError(null);
  };

  const InfoCard: React.FC<{ icon: string; label: string; value: string; color: string }> = 
    ({ icon, label, value, color }) => (
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      >
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '20px',
          flexShrink: 0
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>
            {label}
          </div>
          <div style={{ fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
            {value || 'No especificado'}
          </div>
        </div>
      </div>
    );

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: '#f9fafb', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header con Badge de Rol */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decoración de fondo */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: rolStyle.bg,
            opacity: 0.1,
            borderRadius: '50%',
            transform: 'translate(30%, -30%)'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative' }}>
            {/* Avatar grande */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '24px',
              background: rolStyle.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '48px',
              fontWeight: '700',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
              flexShrink: 0
            }}>
              {iniciales || '👤'}
            </div>

            {/* Información principal */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                  {usuario.detalles?.nombre} {usuario.detalles?.apellido}
                </h1>
                {/* Badge de rol */}
                <div style={{
                  background: rolStyle.bg,
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                  {rolStyle.icon}
                  {rolStyle.text}
                </div>
              </div>
              <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 8px 0' }}>
                <span style={{ marginRight: '8px' }}>📧</span>
                {usuario.email}
              </p>
              {usuario.detalles?.telefono && (
                <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
                  <span style={{ marginRight: '8px' }}>📱</span>
                  {usuario.detalles.telefono}
                </p>
              )}
            </div>

            {/* Botón de editar */}
            {!editando && (
              <button
                onClick={() => setEditando(true)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                ✏️ Editar Perfil
              </button>
            )}
          </div>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Columna izquierda: Información del perfil */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Información Personal */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ color: '#3b82f6' }}>👤</span>
                Información Personal
              </h2>

              {editando ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Nombre</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Apellido</label>
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      style={inputStyle}
                      placeholder="Ej: +569 1234 5678"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                      onClick={handleGuardarCambios}
                      disabled={loading}
                      style={{
                        flex: 1,
                        backgroundColor: loading ? '#9ca3af' : '#10b981',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      💾 {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button
                      onClick={handleCancelar}
                      disabled={loading}
                      style={{
                        backgroundColor: '#6b7280',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <InfoCard
                    icon="👤"
                    label="Nombre Completo"
                    value={`${usuario.detalles?.nombre} ${usuario.detalles?.apellido}`}
                    color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  />
                  <InfoCard
                    icon="📧"
                    label="Correo Electrónico"
                    value={usuario.email || ''}
                    color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                  />
                  <InfoCard
                    icon="📱"
                    label="Teléfono"
                    value={usuario.detalles?.telefono || 'No especificado'}
                    color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                  />
                </div>
              )}
            </div>

            {/* Información Académica */}
            {(esEstudiante || esDocente) && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ color: esEstudiante ? '#8b5cf6' : '#ec4899' }}>{esEstudiante ? '🎓' : '👨‍🏫'}</span>
                  Información {esEstudiante ? 'Académica' : 'Profesional'}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {esEstudiante && (
                    <>
                      <InfoCard
                        icon="🎓"
                        label="Grado"
                        value={usuario.detalles?.grado || 'No especificado'}
                        color="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                      />
                      <InfoCard
                        icon="📚"
                        label="Sección"
                        value={usuario.detalles?.seccion || 'No especificado'}
                        color="linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
                      />
                    </>
                  )}
                  {esDocente && (
                    <>
                      <InfoCard
                        icon="👨‍🏫"
                        label="Especialidad"
                        value={usuario.detalles?.especialidad || 'No especificado'}
                        color="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
                      />
                      <InfoCard
                        icon="📖"
                        label="Materia Asignada"
                        value={usuario.detalles?.materia?.nombre 
                          ? `${usuario.detalles.materia.nombre} (${usuario.detalles.materia.codigo})`
                          : 'No asignada'}
                        color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      />
                      <InfoCard
                        icon="📚"
                        label="Grados Asignados"
                        value={(usuario.detalles?.grados_array && usuario.detalles.grados_array.length > 0)
                          ? usuario.detalles.grados_array.join(', ')
                          : 'No asignados'}
                        color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Clases Asignadas (solo para docentes) */}
            {esDocente && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  📚 Clases Asignadas
                </h2>

                {clasesAsignadas.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '32px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px dashed #d1d5db'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                      No tienes clases asignadas
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {clasesAsignadas.map((clase) => (
                      <div
                        key={clase.id}
                        style={{
                          padding: '16px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '12px'
                        }}>
                          <div>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#1f2937',
                              marginBottom: '4px'
                            }}>
                              {clase.materia?.nombre || 'Materia'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              Código: {clase.materia?.codigo || 'N/A'}
                            </div>
                          </div>
                          <div style={{
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            {clase.grado}{clase.seccion}
                          </div>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '12px',
                          fontSize: '12px'
                        }}>
                          <div>
                            <div style={{ color: '#6b7280', marginBottom: '4px' }}>
                              📊 Estudiantes
                            </div>
                            <div style={{ fontWeight: '600', color: '#374151' }}>
                              {clase.totalEstudiantes || 0}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: '#6b7280', marginBottom: '4px' }}>
                              🕐 Horario
                            </div>
                            <div style={{ fontWeight: '600', color: '#374151' }}>
                              {clase.horario || 'Por definir'}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: '#6b7280', marginBottom: '4px' }}>
                              🚪 Aula
                            </div>
                            <div style={{ fontWeight: '600', color: '#374151' }}>
                              {clase.aula || 'Por asignar'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Resumen */}
                    <div style={{
                      marginTop: '8px',
                      padding: '16px',
                      backgroundColor: '#eff6ff',
                      borderRadius: '12px',
                      border: '1px solid #bfdbfe'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px',
                        textAlign: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>
                            {clasesAsignadas.length}
                          </div>
                          <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>
                            Clases Totales
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                            {clasesAsignadas.reduce((sum, c) => sum + (c.totalEstudiantes || 0), 0)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>
                            Estudiantes Totales
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Columna derecha: Seguridad y acciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Seguridad */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ color: '#ef4444' }}>🔑</span>
                Seguridad
              </h2>

              {!cambiandoPassword ? (
                <button
                  onClick={() => setCambiandoPassword(true)}
                  style={{
                    width: '100%',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  🔑 Cambiar Contraseña
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Contraseña Actual</label>
                    <input
                      type="password"
                      value={passwordData.passwordActual}
                      onChange={(e) => setPasswordData({ ...passwordData, passwordActual: e.target.value })}
                      style={inputStyle}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Nueva Contraseña</label>
                    <input
                      type="password"
                      value={passwordData.passwordNueva}
                      onChange={(e) => setPasswordData({ ...passwordData, passwordNueva: e.target.value })}
                      style={inputStyle}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      value={passwordData.passwordConfirm}
                      onChange={(e) => setPasswordData({ ...passwordData, passwordConfirm: e.target.value })}
                      style={inputStyle}
                      placeholder="••••••••"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleCambiarPassword}
                      disabled={loading}
                      style={{
                        flex: 1,
                        backgroundColor: loading ? '#9ca3af' : '#10b981',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      💾 Actualizar
                    </button>
                    <button
                      onClick={() => {
                        setCambiandoPassword(false);
                        setPasswordData({ passwordActual: '', passwordNueva: '', passwordConfirm: '' });
                        setError(null);
                      }}
                      disabled={loading}
                      style={{
                        backgroundColor: '#6b7280',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                border: '1px solid #fde68a',
                fontSize: '13px',
                color: '#92400e'
              }}>
                <strong>💡 Consejo de seguridad:</strong> Usa una contraseña fuerte con letras, números y símbolos.
              </div>
            </div>

            {/* Información de cuenta */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ color: '#3b82f6' }}>ℹ️</span>
                Información de Cuenta
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🛡️ ID de Usuario
                  </div>
                  <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: '600', fontFamily: 'monospace' }}>
                    {usuario.id || usuario.detalles?.id}
                  </div>
                </div>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📅 Tipo de Cuenta
                  </div>
                  <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>
                    {rolStyle.text}
                  </div>
                </div>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🕐 Estado
                  </div>
                  <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '600' }}>
                    ● Activa
                  </div>
                </div>
              </div>
            </div>

            {/* Cerrar sesión */}
            <button
              onClick={onLogout}
              style={{
                width: '100%',
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
              }}
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
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
  padding: '12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s'
};

export default ProfileSettings;

