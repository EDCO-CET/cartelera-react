import { startTransition } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'

/*
  <a href="/admin"> recarga la página completa y se pierde el estado de React
  (los eventos agregados desaparecerían). <Link to> / <NavLink to> cambian la URL
  SIN recargar. NavLink además agrega la clase "active" y aria-current="page"
  al enlace de la ruta actual; el CSS la usa para dejar el subrayado fijo.

  Los enlaces con ancla (#events, #contact) se quitaron del menú: desde /admin,
  un href="#contact" se quedaría en /admin#contact, donde esa sección no existe.
*/
/*
  Clase 21: el Header lee la sesión con useAuth(), sin recibir props.
  Sin sesión: "Ingresar". Con sesión: saludo y "Salir".
  "Agregar evento" solo se muestra al admin (autorización en la interfaz:
  la ruta /admin igual está protegida por RutaProtegida).
*/
function Header() {
  const { usuario, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  /*
    Al salir volvemos a la cartelera. Trampa: BrowserRouter cambia la URL dentro de
    startTransition (actualización "no urgente"), pero setUsuario(null) es urgente.
    Si llamamos logout() sin más, React pinta PRIMERO "sin usuario" con la URL vieja
    (/admin): RutaProtegida redirige a /login y la navegación a "/" se pierde.
    Con logout también en una transición, React aplica los dos cambios JUNTOS.
  */
  const salir = () => {
    navigate('/')
    startTransition(() => logout())
  }

  return (
    <header className="header">
      <h1><Link to="/" className="header-logo">Cartelera de eventos</Link></h1>
      <nav>
        <ul className="nav-list">
          {/* En "/" end es opcional: React Router 8 solo lo activa en la raíz */}
          <li><NavLink to="/" end>Inicio</NavLink></li>
          {hasRole('admin') && <li><NavLink to="/admin">Agregar evento</NavLink></li>}
          {usuario ? (
            <>
              <li className="nav-usuario">Hola, {usuario.nombre}</li>
              <li><button type="button" className="nav-salir" onClick={salir}>Salir</button></li>
            </>
          ) : (
            <li><NavLink to="/login">Ingresar</NavLink></li>
          )}
        </ul>
      </nav>
    </header>
  )
}

export default Header
