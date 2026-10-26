import { Link, useLocation } from 'react-router'
import Hero from '../components/Hero'

// Ruta comodín "*": cualquier URL que no coincida con las demás
function NoEncontrado() {
  const { pathname } = useLocation()

  return (
    <>
      <Hero titulo="Página no encontrada" texto={`La ruta ${pathname} no existe.`}>
        <Link className="btn btn--accent hero-cta" to="/">Volver a la cartelera</Link>
      </Hero>
      {/* layout vacío: el body es un grid de 4 filas (header|hero|layout|footer) */}
      <div className="layout" />
    </>
  )
}

export default NoEncontrado
