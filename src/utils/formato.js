// Las mismas funciones del script.js del proyecto en JS.
// No dependen de React: son JavaScript puro, por eso viven fuera de los componentes.

export const formatearPrecio = (precio) => {
  if (precio <= 0) {
    return 'Entrada libre'
  }
  return '$' + precio.toLocaleString('es-CO')
}

export const textoCupos = (cupos) => {
  if (cupos === 0) {
    return 'Sin cupos'
  } else if (cupos === 1) {
    return 'Queda 1 cupo'
  } else {
    return `Quedan ${cupos} cupos`
  }
}
