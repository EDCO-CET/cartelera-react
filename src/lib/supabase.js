import { createClient } from '@supabase/supabase-js'

// Vite reemplaza import.meta.env.VITE_* por su valor AL CONSTRUIR (npm run build):
// los valores quedan escritos en el bundle. Por eso aquí solo van llaves públicas.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Fallar temprano y con un mensaje claro. Sin esto, el error aparece mucho después
// ("Invalid URL" o un fetch a undefined) y en otro archivo.
if (!url || !key) {
  throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY. Copia .env.example como .env y reinicia npm run dev.')
}

// Un solo cliente para toda la app. Guarda la sesión en localStorage y renueva el token solo.
export const supabase = createClient(url, key)
