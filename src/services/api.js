/*
  API SIMULADA: no hay servidor. Cada función devuelve una Promesa que se
  resuelve (o se rechaza) después de un setTimeout, igual que tardaría un fetch real.
  Cuando conectemos MockAPI, solo cambia el cuerpo de estas funciones:
  los componentes seguirán llamando a crearEvento() y enviarContacto().
*/

const DEMORA_MS = 1200

// Para practicar el manejo de errores: si el texto incluye "error", la "API" falla
const debeFallar = (texto) => texto.toLowerCase().includes('error')

function simularPeticion(respuesta, fallar) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fallar) {
        reject(new Error('La API respondió 500'))
      } else {
        resolve(respuesta)
      }
    }, DEMORA_MS)
  })
}

// "POST /eventos": devuelve el evento con el id que asignaría el servidor
export function crearEvento(evento) {
  return simularPeticion({ ...evento, id: Date.now() }, debeFallar(evento.titulo))
}

// "PUT /eventos/:id": devuelve el evento tal como quedó guardado
export function actualizarEvento(evento) {
  return simularPeticion({ ...evento }, debeFallar(evento.titulo))
}

// "POST /contacto": devuelve un número de radicado
export function enviarContacto(mensaje) {
  return simularPeticion({ radicado: Math.floor(Math.random() * 90000) + 10000 }, debeFallar(mensaje.email))
}

/*
  "POST /login" simulado. Un servidor real compara la contraseña con un hash en la
  base de datos; aquí la lista vive en el código SOLO porque no hay backend.
  Usuarios de prueba (contraseña 1234): admin@cartelera.co (admin) y ana@cartelera.co (usuario).
*/
const USUARIOS_DEMO = [
  { id: 1, nombre: 'Ana', email: 'ana@cartelera.co', rol: 'usuario' },
  { id: 2, nombre: 'Carlos', email: 'admin@cartelera.co', rol: 'admin' },
]
const PASSWORD_DEMO = '1234'

// Devuelve el usuario con un token falso, o falla como lo haría un 401
export function iniciarSesion(email, password) {
  const usuario = USUARIOS_DEMO.find((u) => u.email === email.trim().toLowerCase())
  const valido = usuario && password === PASSWORD_DEMO
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (valido) {
        resolve({ ...usuario, token: `demo-token-${usuario.id}` })
      } else {
        reject(new Error('Credenciales inválidas'))
      }
    }, DEMORA_MS)
  })
}
