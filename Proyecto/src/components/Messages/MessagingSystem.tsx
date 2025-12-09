import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import {
  crearMensaje,
  getConversaciones,
  getConversacionesEstudiante,
  getMensajesPorEstudiante,
  getMensajesConversacionPrivada,
  marcarConversacionLeida,
  getEstadisticasMensajes,
  Conversacion,
  ConversacionEstudiante,
  MensajeConDetalles
} from '../../services/mensajeService';
import { UsuarioConDetalles } from '../../services/authService';
import { useNotification } from '../../hooks/useNotification';

interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  grado?: string;
  seccion?: string;
  email?: string;
}

interface MessagingSystemProps {
  usuarioActual: UsuarioConDetalles;
}

const RESPUESTAS_RAPIDAS = [
  '¡Excelente trabajo! Sigue así 👏',
  'Necesitamos hablar sobre tu rendimiento académico',
  'Por favor, entrega las tareas pendientes',
  'Felicitaciones por tu dedicación 🎉',
  'Tu tutor debe comunicarse conmigo',
  'Recuerda asistir a clases puntualmente'
];

const MessagingSystem: React.FC<MessagingSystemProps> = ({ usuarioActual }) => {
  const { showNotification, NotificationContainer } = useNotification();
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [conversacionesEstudiante, setConversacionesEstudiante] = useState<ConversacionEstudiante[]>([]);
  const [conversacionActiva, setConversacionActiva] = useState<number | null>(null);
  const [mensajesActivos, setMensajesActivos] = useState<MensajeConDetalles[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarNuevoMensaje, setMostrarNuevoMensaje] = useState(false);
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);
  const [mensajeAResponder, setMensajeAResponder] = useState<MensajeConDetalles | null>(null);
  
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    noLeidos: 0,
    leidos: 0,
    porTipo: {
      general: 0,
      urgente: 0,
      academico: 0,
      conductual: 0,
      felicitacion: 0
    }
  });

  // formulario de mensaje
  const [formMensaje, setFormMensaje] = useState({
    estudiante_id: '',
    asunto: '',
    mensaje: '',
    tipo: 'general' as 'general' | 'urgente' | 'academico' | 'conductual' | 'felicitacion',
    destinatario_tipo: 'tutor' as 'tutor' | 'estudiante' | 'docente'
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // determinar ID y rol del usuario actual
  const esDocente = usuarioActual.rol === 'docente';
  const esEstudiante = usuarioActual.rol === 'estudiante';
  
  // Para docentes: ID de docentes, Para estudiantes: ID de Estudiantes
  const usuarioId = usuarioActual.detalles?.id || 1;
  const estudianteId = esEstudiante ? usuarioActual.detalles?.id : null;

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (conversacionActiva) {
      cargarMensajesEstudiante(conversacionActiva);
    }
  }, [conversacionActiva]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajesActivos]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // cargar estudiantes
      const { data: estudiantesData, error: estudiantesError } = await supabase
        .from('Estudiantes')
        .select('id, nombre, apellido, grado, seccion, email')
        .order('apellido', { ascending: true });

      if (estudiantesError) throw estudiantesError;
      setEstudiantes(estudiantesData || []);

      // cargar conversaciones (solo para docentes)
      if (esDocente) {
        const conversacionesData = await getConversaciones(usuarioId);
        setConversaciones(conversacionesData);

        // cargar estadísticas
        const stats = await getEstadisticasMensajes(usuarioId);
        setEstadisticas(stats);
      } else if (esEstudiante && estudianteId) {
        // para estudiantes, cargar sus conversaciones agrupadas por docente
        const conversacionesData = await getConversacionesEstudiante(estudianteId);
        setConversacionesEstudiante(conversacionesData);
        
        // obtener todos los mensajes para las estadísticas
        const mensajesEstudiante = await getMensajesPorEstudiante(estudianteId);
        
        // actualizar estadísticas para estudiantes
        setEstadisticas({
          total: mensajesEstudiante.length,
          noLeidos: mensajesEstudiante.filter(m => !m.leido && m.destinatario_tipo === 'estudiante').length,
          leidos: mensajesEstudiante.filter(m => m.leido || m.remitente_tipo === 'estudiante').length,
          porTipo: {
            general: mensajesEstudiante.filter(m => m.tipo === 'general').length,
            urgente: mensajesEstudiante.filter(m => m.tipo === 'urgente').length,
            academico: mensajesEstudiante.filter(m => m.tipo === 'academico').length,
            conductual: mensajesEstudiante.filter(m => m.tipo === 'conductual').length,
            felicitacion: mensajesEstudiante.filter(m => m.tipo === 'felicitacion').length
          }
        });
      }

      setError(null);
    } catch (err: any) {
      setError('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarMensajesEstudiante = async (idConversacion: number) => {
    try {
      let mensajes: MensajeConDetalles[] = [];
      
      if (esDocente) {
        // Docente viendo conversación con un estudiante
        mensajes = await getMensajesConversacionPrivada(usuarioId, idConversacion);
        // Marcar como leídos los mensajes de esta conversación
        await marcarConversacionLeida(idConversacion, usuarioId);
      } else if (esEstudiante && estudianteId) {
        // Estudiante viendo conversación con un docente
        // idConversacion es el ID del docente
        mensajes = await getMensajesConversacionPrivada(idConversacion, estudianteId);
        // Marcar como leídos los mensajes del docente
        await marcarConversacionLeida(estudianteId, idConversacion);
      }
      
      setMensajesActivos(mensajes);
      
      // actualizar conversaciones
      cargarDatos();
    } catch (err: any) {
      setError('Error al cargar mensajes: ' + err.message);
    }
  };

  const handleEnviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formMensaje.estudiante_id || !formMensaje.asunto || !formMensaje.mensaje) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);

      await crearMensaje({
        remitente_tipo: usuarioActual.rol as any,
        remitente_id: usuarioId,
        destinatario_tipo: formMensaje.destinatario_tipo,
        destinatario_id: undefined, // se enviaría al tutor o estudiante según el caso
        estudiante_id: parseInt(formMensaje.estudiante_id),
        asunto: formMensaje.asunto,
        mensaje: formMensaje.mensaje,
        tipo: formMensaje.tipo,
        leido: false
      });

      showNotification('Mensaje enviado correctamente', 'success');
      
      setFormMensaje({
        estudiante_id: '',
        asunto: '',
        mensaje: '',
        tipo: 'general',
        destinatario_tipo: 'tutor'
      });

      setMostrarNuevoMensaje(false);
      cargarDatos();

      // si estamos en la conversación de este estudiante, recargar mensajes
      if (conversacionActiva === parseInt(formMensaje.estudiante_id)) {
        cargarMensajesEstudiante(conversacionActiva);
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Error desconocido';
      setError('Error al enviar mensaje: ' + errorMessage);
      showNotification('Error al enviar mensaje: ' + errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRespuestaRapida = (respuesta: string) => {
    setFormMensaje({ ...formMensaje, mensaje: respuesta });
  };

  const handleResponder = (mensaje: MensajeConDetalles) => {
    setMensajeAResponder(mensaje);
    setMostrarRespuesta(true);
  };

  const handleEnviarRespuesta = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formMensaje.mensaje) {
      setError('Por favor escribe tu respuesta');
      return;
    }

    if (!mensajeAResponder) {
      setError('No hay mensaje para responder');
      return;
    }

    try {
      setLoading(true);

      // Para estudiantes que responden: el docente es el destinatario
      // Necesitamos obtener el ID del docente que envió el mensaje original
      await crearMensaje({
        remitente_tipo: 'estudiante' as any, // El estudiante responde
        remitente_id: usuarioId, // ID del estudiante en la tabla usuarios
        destinatario_tipo: 'docente' as any, // Al docente
        destinatario_id: mensajeAResponder.remitente_id, // ID del docente que envió el mensaje
        estudiante_id: estudianteId!, // ID del estudiante
        asunto: `RE: ${mensajeAResponder.asunto}`,
        mensaje: formMensaje.mensaje,
        tipo: formMensaje.tipo,
        leido: false
      });

      showNotification('Respuesta enviada correctamente', 'success');
      
      setFormMensaje({
        estudiante_id: '',
        asunto: '',
        mensaje: '',
        tipo: 'general',
        destinatario_tipo: 'docente'
      });

      setMostrarRespuesta(false);
      setMensajeAResponder(null);
      
      // Recargar mensajes de la conversación activa
      if (conversacionActiva) {
        await cargarMensajesEstudiante(conversacionActiva);
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Error desconocido';
      setError('Error al enviar respuesta: ' + errorMessage);
      showNotification('Error al enviar respuesta: ' + errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'urgente': return { bg: '#fee2e2', text: '#991b1b', icon: '🚨' };
      case 'academico': return { bg: '#dbeafe', text: '#1e40af', icon: '📚' };
      case 'conductual': return { bg: '#fef3c7', text: '#92400e', icon: '⚠️' };
      case 'felicitacion': return { bg: '#dcfce7', text: '#166534', icon: '🎉' };
      default: return { bg: '#f3f4f6', text: '#374151', icon: '💬' };
    }
  };

  const getTipoBadge = (tipo: string) => {
    const colores = getTipoColor(tipo);
    return (
      <span style={{
        backgroundColor: colores.bg,
        color: colores.text,
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {colores.icon} {tipo.toUpperCase()}
      </span>
    );
  };

  const estudiantesFiltrados = estudiantes.filter(est =>
    `${est.nombre} ${est.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    est.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // filtrar conversaciones según el rol
  const conversacionesFiltradas = esDocente
    ? conversaciones.filter(conv =>
        `${conv.estudiante_nombre} ${conv.estudiante_apellido}`.toLowerCase().includes(busqueda.toLowerCase())
      )
    : conversacionesEstudiante.filter(conv =>
        `${conv.docente_nombre} ${conv.docente_apellido}`.toLowerCase().includes(busqueda.toLowerCase())
      );

  const estudianteActivo = conversacionActiva && esDocente
    ? conversaciones.find(c => c.estudiante_id === conversacionActiva)
    : null;
  
  const docenteActivo = conversacionActiva && esEstudiante
    ? conversacionesEstudiante.find(c => c.docente_id === conversacionActiva)
    : null;

  return (
    <>
      <NotificationContainer />
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
      {/* Header con Estadísticas */}
      <div style={{ padding: '20px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '16px' }}>
          💬 {esEstudiante ? 'Mis Mensajes' : 'Sistema de Mensajería'}
        </h1>

        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#b91c1c'
              }}
            >
              ✕
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: '#ede9fe', padding: '16px', borderRadius: '10px', border: '1px solid #ddd6fe' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed' }}>
              {estadisticas.total}
            </div>
            <div style={{ fontSize: '12px', color: '#6d28d9', fontWeight: '500' }}>Total Mensajes</div>
          </div>

          <div style={{ backgroundColor: '#dbeafe', padding: '16px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
              {conversaciones.length}
            </div>
            <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: '500' }}>Conversaciones</div>
          </div>

          <div style={{ backgroundColor: '#fef3c7', padding: '16px', borderRadius: '10px', border: '1px solid #fde68a' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
              {estadisticas.noLeidos}
            </div>
            <div style={{ fontSize: '12px', color: '#b45309', fontWeight: '500' }}>Sin Leer</div>
          </div>

          <div style={{ backgroundColor: '#dcfce7', padding: '16px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
              {estadisticas.leidos}
            </div>
            <div style={{ fontSize: '12px', color: '#047857', fontWeight: '500' }}>Leídos</div>
          </div>
        </div>
      </div>

      {/* Layout principal estilo WhatsApp */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Panel izquierdo: Lista de conversaciones */}
        {(esDocente || esEstudiante) && (
        <div style={{
          width: '350px',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Búsqueda y botón nuevo */}
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ marginBottom: esDocente ? '12px' : '0' }}>
              <input
                type="text"
                placeholder="🔍 Buscar conversación..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
            {esDocente && (
              <button
                onClick={() => setMostrarNuevoMensaje(true)}
                style={{
                  width: '100%',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                ✏️ Nuevo Mensaje
              </button>
            )}
          </div>

          {/* Lista de conversaciones */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                <p>Cargando...</p>
              </div>
            ) : conversacionesFiltradas.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                <p style={{ fontSize: '14px' }}>No hay conversaciones</p>
              </div>
            ) : esDocente ? (
              // Vista de conversaciones para docentes
              (conversacionesFiltradas as Conversacion[]).map((conv) => (
                <div
                  key={conv.estudiante_id}
                  onClick={() => setConversacionActiva(conv.estudiante_id)}
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    backgroundColor: conversacionActiva === conv.estudiante_id ? '#f0f9ff' : 'white',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (conversacionActiva !== conv.estudiante_id) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (conversacionActiva !== conv.estudiante_id) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#e0e7ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#4f46e5',
                      flexShrink: 0
                    }}>
                      {conv.estudiante_nombre.charAt(0)}{conv.estudiante_apellido.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                          {conv.estudiante_apellido} {conv.estudiante_nombre}
                        </div>
                        {conv.mensajes_no_leidos > 0 && (
                          <div style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '12px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}>
                            {conv.mensajes_no_leidos}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                        {conv.estudiante_grado}{conv.estudiante_seccion}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {conv.ultimo_mensaje}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        {getTipoBadge(conv.ultimo_mensaje_tipo)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Vista de conversaciones para estudiantes
              (conversacionesFiltradas as ConversacionEstudiante[]).map((conv) => (
                <div
                  key={conv.docente_id}
                  onClick={() => setConversacionActiva(conv.docente_id)}
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    backgroundColor: conversacionActiva === conv.docente_id ? '#f0f9ff' : 'white',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (conversacionActiva !== conv.docente_id) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (conversacionActiva !== conv.docente_id) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#fce7f3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#be123c',
                      flexShrink: 0
                    }}>
                      {conv.docente_nombre.charAt(0)}{conv.docente_apellido.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                          Prof. {conv.docente_apellido} {conv.docente_nombre}
                        </div>
                        {conv.mensajes_no_leidos > 0 && (
                          <div style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            borderRadius: '12px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}>
                            {conv.mensajes_no_leidos}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                        {conv.docente_especialidad || 'Docente'}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {conv.ultimo_mensaje}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        {getTipoBadge(conv.ultimo_mensaje_tipo)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        )}

        {/* Panel derecho: Chat activo o formulario nuevo mensaje */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
          {mostrarRespuesta && esEstudiante ? (
            // Formulario de respuesta para estudiantes
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
              <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151' }}>
                      ↩️ Responder Mensaje
                    </h2>
                    <button
                      onClick={() => {
                        setMostrarRespuesta(false);
                        setMensajeAResponder(null);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#9ca3af'
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Mensaje original */}
                  <div style={{
                    backgroundColor: '#f9fafb',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    borderLeft: '4px solid #3b82f6'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                      Mensaje original de tu profesor:
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                      {mensajeAResponder?.asunto}
                    </div>
                    <div style={{ fontSize: '14px', color: '#374151' }}>
                      {mensajeAResponder?.mensaje}
                    </div>
                  </div>

                  <form onSubmit={handleEnviarRespuesta}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={labelStyle}>Tipo de Mensaje</label>
                      <select
                        value={formMensaje.tipo}
                        onChange={(e) => setFormMensaje({ ...formMensaje, tipo: e.target.value as any })}
                        style={inputStyle}
                      >
                        <option value="general">💬 General</option>
                        <option value="academico">📚 Académico</option>
                        <option value="conductual">⚠️ Conductual</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={labelStyle}>Tu Respuesta *</label>
                      <textarea
                        value={formMensaje.mensaje}
                        onChange={(e) => setFormMensaje({ ...formMensaje, mensaje: e.target.value })}
                        style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }}
                        placeholder="Escribe tu respuesta aquí..."
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="submit"
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
                          cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {loading ? '⏳ Enviando...' : '📤 Enviar Respuesta'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMostrarRespuesta(false);
                          setMensajeAResponder(null);
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
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : mostrarNuevoMensaje ? (
            // Formulario nuevo mensaje
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
              <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151' }}>
                      ✏️ Nuevo Mensaje
                    </h2>
                    <button
                      onClick={() => setMostrarNuevoMensaje(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#9ca3af'
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleEnviarMensaje}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={labelStyle}>Estudiante *</label>
                      <select
                        value={formMensaje.estudiante_id}
                        onChange={(e) => setFormMensaje({ ...formMensaje, estudiante_id: e.target.value })}
                        style={inputStyle}
                        required
                      >
                        <option value="">Seleccionar estudiante</option>
                        {estudiantesFiltrados.map(est => (
                          <option key={est.id} value={est.id}>
                            {est.apellido} {est.nombre} - {est.grado}{est.seccion}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <label style={labelStyle}>Destinatario *</label>
                        <select
                          value={formMensaje.destinatario_tipo}
                          onChange={(e) => setFormMensaje({ ...formMensaje, destinatario_tipo: e.target.value as any })}
                          style={inputStyle}
                        >
                          <option value="tutor">👨‍👩‍👦 Tutor/Apoderado</option>
                          <option value="estudiante">🎓 Estudiante</option>
                        </select>
                      </div>

                      <div>
                        <label style={labelStyle}>Tipo de Mensaje *</label>
                        <select
                          value={formMensaje.tipo}
                          onChange={(e) => setFormMensaje({ ...formMensaje, tipo: e.target.value as any })}
                          style={inputStyle}
                        >
                          <option value="general">💬 General</option>
                          <option value="academico">📚 Académico</option>
                          <option value="conductual">⚠️ Conductual</option>
                          <option value="urgente">🚨 Urgente</option>
                          <option value="felicitacion">🎉 Felicitación</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={labelStyle}>Asunto *</label>
                      <input
                        type="text"
                        value={formMensaje.asunto}
                        onChange={(e) => setFormMensaje({ ...formMensaje, asunto: e.target.value })}
                        style={inputStyle}
                        placeholder="Ej: Revisión de calificaciones"
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Mensaje *</label>
                      <textarea
                        value={formMensaje.mensaje}
                        onChange={(e) => setFormMensaje({ ...formMensaje, mensaje: e.target.value })}
                        style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                        placeholder="Escribe tu mensaje aquí..."
                        required
                      />
                    </div>

                    {/* Respuestas rápidas */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ ...labelStyle, marginBottom: '8px' }}>⚡ Respuestas Rápidas:</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {RESPUESTAS_RAPIDAS.map((respuesta, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleRespuestaRapida(respuesta)}
                            style={{
                              backgroundColor: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              padding: '6px 12px',
                              borderRadius: '16px',
                              fontSize: '12px',
                              cursor: 'pointer',
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
                            {respuesta}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="submit"
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
                          cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {loading ? '⏳ Enviando...' : '📤 Enviar Mensaje'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setMostrarNuevoMensaje(false)}
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
            </div>
          ) : (esDocente && conversacionActiva && estudianteActivo) || (esEstudiante && conversacionActiva && docenteActivo) ? (
            // Vista de chat
            <>
              {/* Header del chat */}
              <div style={{
                backgroundColor: 'white',
                padding: '16px 24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {esDocente && estudianteActivo ? (
                  <>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#e0e7ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#4f46e5'
                    }}>
                      {estudianteActivo.estudiante_nombre.charAt(0)}{estudianteActivo.estudiante_apellido.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '16px', color: '#1f2937' }}>
                        {estudianteActivo.estudiante_apellido} {estudianteActivo.estudiante_nombre}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {estudianteActivo.estudiante_grado}{estudianteActivo.estudiante_seccion} • {estudianteActivo.total_mensajes} mensajes
                      </div>
                    </div>
                    <button
                      onClick={() => setConversacionActiva(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#9ca3af'
                      }}
                    >
                      ✕
                    </button>
                  </>
                ) : esEstudiante && docenteActivo ? (
                  <>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#fce7f3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#be123c'
                    }}>
                      {docenteActivo.docente_nombre.charAt(0)}{docenteActivo.docente_apellido.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '16px', color: '#1f2937' }}>
                        Prof. {docenteActivo.docente_apellido} {docenteActivo.docente_nombre}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {docenteActivo.docente_especialidad || 'Docente'} • {docenteActivo.total_mensajes} mensajes
                      </div>
                    </div>
                    <button
                      onClick={() => setConversacionActiva(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#9ca3af'
                      }}
                    >
                      ✕
                    </button>
                  </>
                ) : null}
              </div>

              {/* Mensajes */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {mensajesActivos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
                    <p style={{ fontSize: '16px', fontWeight: '500', color: '#6b7280' }}>
                      No hay mensajes en esta conversación
                    </p>
                    <p style={{ fontSize: '14px', marginTop: '8px' }}>
                      ¡Envía el primer mensaje!
                    </p>
                  </div>
                ) : (
                  mensajesActivos.map((mensaje) => {
                    // determinar si el mensaje es del usuario actual
                    const esMioElMensaje = (
                      esEstudiante && 
                      (mensaje.remitente_tipo as string) === 'estudiante' && 
                      mensaje.remitente_id === usuarioId
                    ) || (
                      esDocente && 
                      (mensaje.remitente_tipo as string) === 'docente' && 
                      mensaje.remitente_id === usuarioId
                    );
                    
                    return (
                      <div
                        key={mensaje.id}
                        style={{
                          display: 'flex',
                          justifyContent: esMioElMensaje ? 'flex-end' : 'flex-start',
                          marginBottom: '12px'
                        }}
                      >
                        <div style={{
                          maxWidth: '70%',
                          backgroundColor: esMioElMensaje ? '#10b981' : '#3b82f6',
                          color: 'white',
                          padding: '12px 16px',
                          borderRadius: esMioElMensaje ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          boxShadow: `0 2px 4px rgba(${esMioElMensaje ? '16, 185, 129' : '59, 130, 246'}, 0.3)`
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            {getTipoBadge(mensaje.tipo || 'general')}
                            <span style={{ fontSize: '11px', opacity: 0.9 }}>
                              {esMioElMensaje 
                                ? (esEstudiante ? `Tú → Profesor ${mensaje.docente?.apellido || ''}` : `Tú → ${mensaje.estudiante?.apellido || 'estudiante'}`)
                                : (esEstudiante 
                                    ? `De: Prof. ${mensaje.docente?.nombre} ${mensaje.docente?.apellido}` 
                                    : `Respuesta de: ${mensaje.estudiante?.nombre} ${mensaje.estudiante?.apellido}`
                                  )
                              }
                            </span>
                          </div>
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>
                            {mensaje.asunto}
                          </div>
                          <div style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '8px' }}>
                            {mensaje.mensaje}
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <div style={{ fontSize: '11px', opacity: 0.8 }}>
                              {new Date(mensaje.created_at!).toLocaleString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {mensaje.leido && ' • ✓✓'}
                            </div>
                            {esEstudiante && !esMioElMensaje && (
                              <button
                                onClick={() => handleResponder(mensaje)}
                                style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                  color: 'white',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                              >
                                ↩️ Responder
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Botón flotante para nuevo mensaje en esta conversación (solo docentes) */}
              {esDocente && conversacionActiva && (
                <div style={{
                  backgroundColor: 'white',
                  borderTop: '1px solid #e5e7eb',
                  padding: '16px 24px'
                }}>
                  <button
                    onClick={() => {
                      setFormMensaje({
                        ...formMensaje,
                        estudiante_id: conversacionActiva.toString()
                      });
                      setMostrarNuevoMensaje(true);
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    ✏️ Escribir Nuevo Mensaje
                  </button>
                </div>
              )}
            </>
          ) : (
            // Estado vacío
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: '#9ca3af'
            }}>
              <div style={{ fontSize: '96px', marginBottom: '24px' }}>💬</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                Selecciona una conversación
              </h3>
              <p style={{ fontSize: '14px' }}>
                o crea un nuevo mensaje con el botón de arriba
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
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

export default MessagingSystem;

