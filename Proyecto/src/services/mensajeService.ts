import { supabase } from '../supabaseClient';
import { Mensaje } from '../types/database';

// interfaz extendida con información del estudiante y docente
export interface MensajeConDetalles extends Mensaje {
  estudiante?: {
    id: number;
    nombre: string;
    apellido: string;
    grado?: string;
    seccion?: string;
    email?: string;
  };
  docente?: {
    id: number;
    nombre: string;
    apellido: string;
    especialidad?: string;
  };
}

// interfaz para agrupar mensajes por conversación (docente)
export interface Conversacion {
  estudiante_id: number;
  estudiante_nombre: string;
  estudiante_apellido: string;
  estudiante_grado?: string;
  estudiante_seccion?: string;
  ultimo_mensaje: string;
  ultimo_mensaje_fecha: string;
  ultimo_mensaje_tipo: string;
  mensajes_no_leidos: number;
  total_mensajes: number;
}

// interfaz para conversaciones del estudiante
export interface ConversacionEstudiante {
  docente_id: number;
  docente_nombre: string;
  docente_apellido: string;
  docente_especialidad?: string;
  ultimo_mensaje: string;
  ultimo_mensaje_fecha: string;
  ultimo_mensaje_tipo: string;
  mensajes_no_leidos: number;
  total_mensajes: number;
}

// crear un mensaje
export const crearMensaje = async (mensaje: Omit<Mensaje, 'id' | 'created_at'>): Promise<Mensaje> => {
  const { data, error } = await supabase
    .from('mensajes')
    .insert(mensaje)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// obtener conversaciones del estudiante agrupadas por docente
export const getConversacionesEstudiante = async (estudianteId: number): Promise<ConversacionEstudiante[]> => {
  // obtener todos los mensajes del estudiante
  const { data: mensajes, error } = await supabase
    .from('mensajes')
    .select('*')
    .eq('estudiante_id', estudianteId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!mensajes) return [];

  // obtener IDs únicos de docentes
  const docenteIds = Array.from(new Set(
    mensajes
      .filter(m => m.remitente_tipo === 'docente' || m.destinatario_tipo === 'docente')
      .map(m => m.remitente_tipo === 'docente' ? m.remitente_id : m.destinatario_id)
      .filter(id => id !== undefined)
  ));

  // obtener información de docentes
  const { data: docentes } = await supabase
    .from('docentes')
    .select('id, nombre, apellido, especialidad')
    .in('id', docenteIds);

  if (!docentes) return [];

  // agrupar por docente
  const conversacionesMap = new Map<number, ConversacionEstudiante>();

  mensajes.forEach((msg: any) => {
    // identificar el docente en este mensaje
    let docenteId: number | undefined;
    if (msg.remitente_tipo === 'docente') {
      docenteId = msg.remitente_id;
    } else if (msg.destinatario_tipo === 'docente') {
      docenteId = msg.destinatario_id;
    }

    if (!docenteId) return;

    const docente = docentes.find(d => d.id === docenteId);
    if (!docente) return;

    if (!conversacionesMap.has(docenteId)) {
      // determinar si está leído (si el estudiante es el destinatario y no está leído)
      const esParaEstudiante = msg.destinatario_tipo === 'estudiante' && msg.estudiante_id === estudianteId;
      
      conversacionesMap.set(docenteId, {
        docente_id: docenteId,
        docente_nombre: docente.nombre,
        docente_apellido: docente.apellido,
        docente_especialidad: docente.especialidad,
        ultimo_mensaje: msg.mensaje,
        ultimo_mensaje_fecha: msg.created_at,
        ultimo_mensaje_tipo: msg.tipo || 'general',
        mensajes_no_leidos: (esParaEstudiante && !msg.leido) ? 1 : 0,
        total_mensajes: 1
      });
    } else {
      const conv = conversacionesMap.get(docenteId)!;
      conv.total_mensajes++;
      
      const esParaEstudiante = msg.destinatario_tipo === 'estudiante' && msg.estudiante_id === estudianteId;
      if (esParaEstudiante && !msg.leido) {
        conv.mensajes_no_leidos++;
      }
    }
  });

  return Array.from(conversacionesMap.values()).sort((a, b) => 
    new Date(b.ultimo_mensaje_fecha).getTime() - new Date(a.ultimo_mensaje_fecha).getTime()
  );
};

// obtener todas las conversaciones agrupadas por estudiante (para docentes)
export const getConversaciones = async (docenteId: number): Promise<Conversacion[]> => {
  // obtener todos los mensajes donde el docente es remitente
  const { data: mensajes, error } = await supabase
    .from('mensajes')
    .select(`
      *,
      estudiante:Estudiantes!mensajes_estudiante_id_fkey (
        id,
        nombre,
        apellido,
        grado,
        seccion
      )
    `)
    .eq('remitente_id', docenteId)
    .not('estudiante_id', 'is', null)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // agrupar por estudiante
  const conversacionesMap = new Map<number, Conversacion>();

  (mensajes || []).forEach((msg: any) => {
    if (!msg.estudiante) return;

    const estudianteId = msg.estudiante.id;

    if (!conversacionesMap.has(estudianteId)) {
      conversacionesMap.set(estudianteId, {
        estudiante_id: estudianteId,
        estudiante_nombre: msg.estudiante.nombre,
        estudiante_apellido: msg.estudiante.apellido,
        estudiante_grado: msg.estudiante.grado,
        estudiante_seccion: msg.estudiante.seccion,
        ultimo_mensaje: msg.mensaje,
        ultimo_mensaje_fecha: msg.created_at,
        ultimo_mensaje_tipo: msg.tipo || 'general',
        mensajes_no_leidos: msg.leido ? 0 : 1,
        total_mensajes: 1
      });
    } else {
      const conv = conversacionesMap.get(estudianteId)!;
      conv.total_mensajes++;
      if (!msg.leido) {
        conv.mensajes_no_leidos++;
      }
    }
  });

  return Array.from(conversacionesMap.values()).sort((a, b) => 
    new Date(b.ultimo_mensaje_fecha).getTime() - new Date(a.ultimo_mensaje_fecha).getTime()
  );
};

// obtener mensajes de un estudiante específico (con información del docente)
export const getMensajesPorEstudiante = async (
  estudianteId: number
): Promise<MensajeConDetalles[]> => {
  // Primero obtenemos los mensajes
  const { data: mensajes, error } = await supabase
    .from('mensajes')
    .select(`
      *,
      estudiante:Estudiantes!mensajes_estudiante_id_fkey (
        id,
        nombre,
        apellido,
        grado,
        seccion,
        email
      )
    `)
    .eq('estudiante_id', estudianteId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!mensajes) return [];

  // Obtener IDs únicos de docentes
  const docenteIds = Array.from(new Set(
    mensajes
      .filter(m => m.remitente_tipo === 'docente')
      .map(m => m.remitente_id)
  ));

  // Obtener información de docentes si hay
  let docentes: any[] = [];
  if (docenteIds.length > 0) {
    const { data: docentesData } = await supabase
      .from('docentes')
      .select('id, nombre, apellido, especialidad')
      .in('id', docenteIds);
    
    docentes = docentesData || [];
  }

  // Combinar la información
  return mensajes.map(mensaje => ({
    ...mensaje,
    docente: mensaje.remitente_tipo === 'docente' 
      ? docentes.find(d => d.id === mensaje.remitente_id)
      : undefined
  }));
};

// obtener mensajes entre un docente y un estudiante específico (conversación privada)
export const getMensajesConversacionPrivada = async (
  docenteId: number,
  estudianteId: number
): Promise<MensajeConDetalles[]> => {
  // Obtener mensajes donde:
  // 1. El estudiante es el destinatario Y el docente es el remitente
  // 2. O el estudiante es el remitente (respuesta)
  const { data: mensajes, error } = await supabase
    .from('mensajes')
    .select(`
      *,
      estudiante:Estudiantes!mensajes_estudiante_id_fkey (
        id,
        nombre,
        apellido,
        grado,
        seccion,
        email
      )
    `)
    .eq('estudiante_id', estudianteId)
    .or(`and(remitente_tipo.eq.docente,remitente_id.eq.${docenteId}),and(remitente_tipo.eq.estudiante,remitente_id.eq.${estudianteId})`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!mensajes) return [];

  // Obtener información del docente
  const { data: docenteData } = await supabase
    .from('docentes')
    .select('id, nombre, apellido, especialidad')
    .eq('id', docenteId)
    .single();

  // Agregar información del docente a los mensajes
  return mensajes.map(mensaje => ({
    ...mensaje,
    docente: mensaje.remitente_tipo === 'docente' && mensaje.remitente_id === docenteId
      ? docenteData
      : undefined
  }));
};

// obtener todos los mensajes del docente
export const getMensajesDocente = async (docenteId: number): Promise<MensajeConDetalles[]> => {
  const { data, error } = await supabase
    .from('mensajes')
    .select(`
      *,
      estudiante:Estudiantes!mensajes_estudiante_id_fkey (
        id,
        nombre,
        apellido,
        grado,
        seccion,
        email
      )
    `)
    .eq('remitente_id', docenteId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// marcar mensaje como leído
export const marcarComoLeido = async (mensajeId: number): Promise<void> => {
  const { error } = await supabase
    .from('mensajes')
    .update({ 
      leido: true,
      fecha_lectura: new Date().toISOString()
    })
    .eq('id', mensajeId);

  if (error) throw error;
};

// marcar todos los mensajes de una conversación específica como leídos
export const marcarConversacionLeida = async (
  estudianteId: number,
  docenteId?: number
): Promise<void> => {
  let query = supabase
    .from('mensajes')
    .update({ 
      leido: true,
      fecha_lectura: new Date().toISOString()
    })
    .eq('estudiante_id', estudianteId)
    .eq('leido', false);

  // Si se proporciona docenteId, solo marcar mensajes de ese docente
  if (docenteId) {
    query = query.eq('remitente_id', docenteId);
  }

  const { error } = await query;
  if (error) throw error;
};

// actualizar un mensaje
export const actualizarMensaje = async (
  id: number,
  cambios: Partial<Mensaje>
): Promise<Mensaje> => {
  const { data, error } = await supabase
    .from('mensajes')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// eliminar un mensaje
export const eliminarMensaje = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('mensajes')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// buscar mensajes
export const buscarMensajes = async (
  termino: string,
  docenteId: number
): Promise<MensajeConDetalles[]> => {
  const { data, error } = await supabase
    .from('mensajes')
    .select(`
      *,
      estudiante:Estudiantes!mensajes_estudiante_id_fkey (
        id,
        nombre,
        apellido,
        grado,
        seccion,
        email
      )
    `)
    .eq('remitente_id', docenteId)
    .or(`asunto.ilike.%${termino}%,mensaje.ilike.%${termino}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// obtener estadísticas de mensajería
export const getEstadisticasMensajes = async (docenteId: number) => {
  const { data: mensajes, error } = await supabase
    .from('mensajes')
    .select('id, tipo, leido')
    .eq('remitente_id', docenteId);

  if (error) throw error;

  const total = mensajes?.length || 0;
  const noLeidos = mensajes?.filter(m => !m.leido).length || 0;
  const porTipo = {
    general: mensajes?.filter(m => m.tipo === 'general').length || 0,
    urgente: mensajes?.filter(m => m.tipo === 'urgente').length || 0,
    academico: mensajes?.filter(m => m.tipo === 'academico').length || 0,
    conductual: mensajes?.filter(m => m.tipo === 'conductual').length || 0,
    felicitacion: mensajes?.filter(m => m.tipo === 'felicitacion').length || 0
  };

  return {
    total,
    noLeidos,
    leidos: total - noLeidos,
    porTipo
  };
};

