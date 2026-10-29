import { Link, Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import Hero from './Hero'

/*
  Ruta LAYOUT (sin path), como Layout: todo lo que va dentro en App.jsx queda protegido.
  1. Sin sesión -> /login, recordando a dónde iba (state) y sin dejar esta URL en el
     historial (replace): si no, "atrás" desde el login volvería aquí y redirigiría otra vez.
  2. Con sesión pero sin el rol -> aviso en la misma URL.
  3. Todo bien -> <Outlet />: la página hija.
  RECORDAR: esto es experiencia de usuario, no seguridad. Quien tenga la URL de la API
  puede llamarla directamente; el que debe validar el token es el servidor.
  Con Supabase, ese "servidor" son las políticas RLS de supabase/02-rls.sql.
*/
function RutaProtegida({ rol }) {
  const { usuario, isLoading, hasRole } = useAuth()
  const location = useLocation()

  // Clase Supabase: primero saber si hay sesión guardada. Decidir antes de saber
  // = F5 en /admin siempre terminaría en /login.
  if (isLoading) {
    return (
      <>
        <Hero titulo="Verificando tu sesión..." texto="Un momento, por favor." />
        <div className="layout" />
      </>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }

  if (rol && !hasRole(rol)) {
    return (
      <>
        <Hero titulo="Acceso restringido" texto={`${usuario.nombre}, tu usuario no tiene permiso para ver esta página.`}>
          <Link className="btn btn--accent hero-cta" to="/">Volver a la cartelera</Link>
        </Hero>
        {/* layout vacío: el body es un grid de 4 filas (header|hero|layout|footer) */}
        <div className="layout" />
      </>
    )
  }

  return <Outlet />
}

export default RutaProtegida
