import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

// Los componentes importan solo esto: no necesitan saber que hay un contexto detrás
export function useAuth() {
  const context = useContext(AuthContext)
  // Fuera de <AuthProvider>, useContext devuelve el valor por defecto (null)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return context
}
