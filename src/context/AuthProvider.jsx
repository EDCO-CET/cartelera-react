import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { cerrarSesion, escucharSesion, iniciarSesion, obtenerPerfil } from '../services/api'

/*
  Guarda QUIÉN inició sesión (autenticación) y responde QUÉ puede hacer (autorización).
  Clase Supabase: ya no guardamos nada en localStorage a mano. El SDK guarda el token
  y nos AVISA cuando la sesión cambia (onAuthStateChange): al cargar la página,
  al entrar, al salir y cuando renueva el token.
*/
function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  // true hasta saber si hay sesión guardada. Sin esto, F5 en /admin mandaría al
  // login: durante el primer render usuario todavía es null.
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Se dispara de inmediato con la sesión guardada (INITIAL_SESSION) y luego en cada cambio
    const cancelar = escucharSesion((session) => {
      if (!session) {
        setUsuario(null)
        setIsLoading(false)
        return
      }
      obtenerPerfil(session.user)
        .then(setUsuario)
        .catch((error) => {
          console.error('No se pudo leer el perfil:', error.message)
          setUsuario(null)
        })
        .finally(() => setIsLoading(false))
    })
    // Limpieza: sin esto, cada montaje dejaría un listener vivo
    return cancelar
  }, [])

  // Si las credenciales fallan, iniciarSesion rechaza y el error llega a la página Login
  const login = async (email, password) => {
    const datos = await iniciarSesion(email, password)
    setUsuario(datos)   // ya: Login navega justo después y RutaProtegida debe ver al usuario
  }

  // Header la llama dentro de startTransition (ver Header.jsx): el cambio de estado
  // va primero, sin esperar a la red; el aviso de Supabase llega después y no cambia nada.
  const logout = () => {
    setUsuario(null)
    cerrarSesion().catch((error) => console.error('No se pudo cerrar la sesión:', error.message))
  }

  // ?. : sin sesión, usuario es null y hasRole devuelve false sin lanzar error
  const hasRole = (rol) => usuario?.rol === rol

  return (
    <AuthContext.Provider value={{ usuario, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
