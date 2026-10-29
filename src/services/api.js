import { supabase } from '../lib/supabase'

/*
  Clase Supabase: este archivo es el ÚNICO que habla con el backend.
  Las funciones conservan sus nombres y lo que devuelven, así que los componentes
  (FormularioEvento, AuthProvider...) siguen llamando a crearEvento() sin enterarse
  de que ya no es un setTimeout.

  Patrón del SDK: cada consulta devuelve { data, error } y NO lanza excepciones
  (como fetch con un 404). Por eso cada función revisa error y hace throw: así quien
  llama puede seguir usando try/catch.
*/

// "GET /eventos": la lista ordenada por id
export async function obtenerEventos() {
  const { data, error } = await supabase.from('eventos').select('*').order('id')
  if (error) throw error
  return data
}

// "POST /eventos": .select().single() pide de vuelta la fila creada (con su id)
export async function crearEvento(evento) {
  const { data, error } = await supabase.from('eventos').insert(evento).select().single()
  if (error) throw error
  return data
}

/*
  "PUT /eventos/:id". El id va en el filtro, no en los datos.
  Trampa: si RLS no deja editar la fila, Postgres NO da error: la actualización
  afecta 0 filas. .single() convierte ese "0 filas" en un error que sí vemos.
*/
export async function actualizarEvento({ id, ...cambios }) {
  const { data, error } = await supabase.from('eventos').update(cambios).eq('id', id).select().single()
  if (error) throw error
  return data
}

// Para practicar el manejo de errores: si el texto incluye "error", la "API" falla
const debeFallar = (texto) => texto.toLowerCase().includes('error')

// "POST /contacto" sigue SIMULADO (no hay tabla de mensajes): devuelve un número de radicado
export function enviarContacto(mensaje) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (debeFallar(mensaje.email)) {
        reject(new Error('La API respondió 500'))
      } else {
        resolve({ radicado: Math.floor(Math.random() * 90000) + 10000 })
      }
    }, 1200)
  })
}

/*
  El usuario de la app = datos de Supabase Auth (id, email) + su fila en profiles (rol).
  El rol se LEE del servidor: nunca se decide en el frontend.
*/
export async function obtenerPerfil(user) {
  const { data, error } = await supabase.from('profiles').select('nombre, rol').eq('id', user.id).single()
  if (error) throw error
  return { id: user.id, email: user.email, nombre: data.nombre, rol: data.rol }
}

// "POST /login": Supabase compara la contraseña con su hash y guarda la sesión (token) en localStorage
export async function iniciarSesion(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  // Mismo mensaje para "no existe" y "contraseña mala": no le decimos al atacante cuál falló
  if (error) throw new Error('Credenciales inválidas')
  return obtenerPerfil(data.user)
}

/*
  Avisa cada vez que cambia la sesión (y una vez al empezar, con la sesión guardada).
  Devuelve la función para dejar de escuchar. El setTimeout no es capricho: Supabase
  advierte que llamar a otra función del SDK DENTRO de este callback puede bloquearlo,
  y quien escucha (AuthProvider) va a consultar profiles.
*/
export function escucharSesion(callback) {
  const { data } = supabase.auth.onAuthStateChange((_evento, session) => {
    setTimeout(() => callback(session), 0)
  })
  return () => data.subscription.unsubscribe()
}

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
