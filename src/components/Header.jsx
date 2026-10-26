import { Link, NavLink } from 'react-router'

/*
  <a href="/admin"> recarga la página completa y se pierde el estado de React
  (los eventos agregados desaparecerían). <Link to> / <NavLink to> cambian la URL
  SIN recargar. NavLink además agrega la clase "active" y aria-current="page"
  al enlace de la ruta actual; el CSS la usa para dejar el subrayado fijo.

  Los enlaces con ancla (#events, #contact) se quitaron del menú: desde /admin,
  un href="#contact" se quedaría en /admin#contact, donde esa sección no existe.
*/
function Header() {
  return (
    <header className="header">
      <h1><Link to="/" className="header-logo">Cartelera de eventos</Link></h1>
      <nav>
        <ul className="nav-list">
          {/* En "/" end es opcional: React Router 8 solo lo activa en la raíz */}
          <li><NavLink to="/" end>Inicio</NavLink></li>
          <li><NavLink to="/admin">Agregar evento</NavLink></li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
