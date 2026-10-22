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

// "POST /contacto": devuelve un número de radicado
export function enviarContacto(mensaje) {
  return simularPeticion({ radicado: Math.floor(Math.random() * 90000) + 10000 }, debeFallar(mensaje.email))
}
