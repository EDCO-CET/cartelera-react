import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { iniciarSesion } from '../services/api'

const CLAVE = 'auth_user'

// Lee la sesión guardada. Si alguien dejó un JSON inválido en localStorage,
// JSON.parse lanza un error: mejor empezar sin sesión que no arrancar la app.
function leerSesion() {
  try {
    const guardado = localStorage.getItem(CLAVE)
    return guardado ? JSON.parse(guardado) : null
  } catch {
    return null
  }
}

/*
  Guarda QUIÉN inició sesión (autenticación) y responde QUÉ puede hacer (autorización).
  Envuelve la app en main.jsx: cualquier componente lee la sesión con useAuth().
*/
function AuthProvider({ children }) {
  // Inicialización perezosa: lee localStorage UNA vez, al montar.
  // Con useState(null), el efecto de abajo borraría la sesión guardada al arrancar.
  const [usuario, setUsuario] = useState(leerSesion)

  // Cada cambio de usuario se refleja en localStorage: F5 no cierra la sesión
  useEffect(() => {
    if (usuario) {
      localStorage.setItem(CLAVE, JSON.stringify(usuario))
    } else {
      localStorage.removeItem(CLAVE)
    }
  }, [usuario])

  // Si las credenciales fallan, iniciarSesion rechaza y el error llega a quien llamó
  // (la página Login), que decide cómo mostrarlo.
  const login = async (email, password) => {
    const datos = await iniciarSesion(email, password)
    setUsuario(datos)
  }

  const logout = () => setUsuario(null)

  // ?. : sin sesión, usuario es null y hasRole devuelve false sin lanzar error
  const hasRole = (rol) => usuario?.rol === rol

  return (
    <AuthContext.Provider value={{ usuario, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
