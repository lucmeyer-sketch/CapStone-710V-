// Contenido para src/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

// Obtenemos las variables de nuestro archivo .env
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Verificamos que las llaves existan
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anon key are required.");
}

// Creamos y exportamos el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);