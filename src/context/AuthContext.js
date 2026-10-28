import { createContext } from 'react'

/*
  El "canal" por donde viaja la sesión. Vive en su propio archivo (sin JSX) para que
  AuthProvider.jsx exporte SOLO un componente: así Fast Refresh conserva el estado
  al guardar (regla react/only-export-components de .oxlintrc.json).
  OJO: createContext viene de 'react'. React Router 8 también exporta un
  createContext (para su middleware) y el autoimport del editor puede traer ese.
*/
export const AuthContext = createContext(null)
