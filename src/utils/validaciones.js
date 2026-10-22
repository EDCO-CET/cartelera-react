// Reglas pequeñas y reutilizables: JavaScript puro, sin React.

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const validateTelefono = (telefono) => /^\d{10}$/.test(telefono)

// Devuelve true si el objeto de errores no tiene ningún mensaje
export const sinErrores = (errors) => Object.keys(errors).length === 0
