function Header() {
  return (
    <header className="header">
      <h1>Cartelera de eventos</h1>
      <nav>
        <ul className="nav-list">
          <li><a href="#home">Inicio</a></li>
          <li><a href="#events">Eventos</a></li>
          <li><a href="#admin">Agregar evento</a></li>
          <li><a href="#aboutus">Acerca de nosotros</a></li>
          <li><a href="#contact">Contacto</a></li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
