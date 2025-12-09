// utilidades para parsear y trabajar con horarios

export interface DiaHorario {
  dia: string; // nombre del día en español
  horaInicio: string;
  horaFin: string;
}

// mapeo de días en español a números de día de la semana (0 = domingo, 1 = lunes, etc.)
const diasSemanaMap: Record<string, number> = {
  'domingo': 0,
  'lunes': 1,
  'martes': 2,
  'miércoles': 3,
  'miercoles': 3, // sin tilde
  'jueves': 4,
  'viernes': 5,
  'sábado': 6,
  'sabado': 6 // sin tilde
};

// parsear string de horario a array de días con horarios
// formato: "Lunes 8:00-9:30, Miércoles 8:00-9:40"
export const parsearHorario = (horario?: string | null): DiaHorario[] => {
  if (!horario || !horario.trim()) return [];

  const dias: DiaHorario[] = [];
  
  // separar por comas
  const partes = horario.split(',').map(p => p.trim());
  
  for (const parte of partes) {
    // buscar patrón: "Día HH:MM-HH:MM" (permitir acentos en el día)
    const match = parte.match(/^([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/i);
    
    if (match) {
      const [, diaStr, horaInicio, horaFin] = match;
      // normalizar día: convertir a minúsculas y manejar acentos
      const diaNormalizado = diaStr.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // quitar acentos para comparación
      const diaOriginal = diaStr.toLowerCase();
      
      // buscar en el mapa (con y sin acentos)
      const diaKey = Object.keys(diasSemanaMap).find(
        key => key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === diaNormalizado
      );
      
      if (diaKey !== undefined) {
        // mantener el formato original del día con mayúscula inicial
        const diaFormateado = diaStr.charAt(0).toUpperCase() + diaStr.slice(1).toLowerCase();
        dias.push({
          dia: diaFormateado,
          horaInicio,
          horaFin
        });
      }
    }
  }
  
  return dias;
};

// obtener número de día de la semana desde nombre en español
export const obtenerNumeroDia = (diaNombre: string): number | null => {
  const dia = diaNombre.toLowerCase();
  return diasSemanaMap[dia] ?? null;
};

// verificar si una clase tiene clases en un día específico
export const tieneClaseEnDia = (horario?: string | null, diaNumero?: number): boolean => {
  if (!horario || diaNumero === undefined) return false;
  
  const dias = parsearHorario(horario);
  if (dias.length === 0) return false;
  
  // obtener nombre del día desde el número
  const nombreDia = Object.keys(diasSemanaMap).find(
    key => diasSemanaMap[key] === diaNumero
  );
  
  if (!nombreDia) return false;
  
  // verificar si alguno de los días parseados coincide
  return dias.some(d => 
    d.dia.toLowerCase() === nombreDia || 
    d.dia.toLowerCase().replace('á', 'a').replace('é', 'e') === nombreDia
  );
};

// obtener días de la semana en que tiene clases
export const obtenerDiasConClases = (horario?: string | null): number[] => {
  if (!horario) return [];
  
  const dias = parsearHorario(horario);
  return dias
    .map(d => obtenerNumeroDia(d.dia))
    .filter((num): num is number => num !== null);
};

// verificar si tiene clases hoy
export const tieneClaseHoy = (horario?: string | null): boolean => {
  const hoy = new Date().getDay();
  return tieneClaseEnDia(horario, hoy);
};

// formatear horario para mostrar
export const formatearHorario = (horario?: string | null): string => {
  if (!horario) return 'Por definir';
  
  const dias = parsearHorario(horario);
  if (dias.length === 0) return horario; // retornar original si no se pudo parsear
  
  return dias
    .map(d => `${d.dia} ${d.horaInicio}-${d.horaFin}`)
    .join(', ');
};

// obtener nombre del día en español desde número
export const obtenerNombreDia = (diaNumero: number): string => {
  const nombres: Record<number, string> = {
    0: 'Domingo',
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
  };
  return nombres[diaNumero] || '';
};

