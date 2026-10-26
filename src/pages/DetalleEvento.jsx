import { Link, useNavigate, useParams } from 'react-router'
import Hero from '../components/Hero'
import { formatearPrecio, textoCupos } from '../utils/formato'

/*
  Página "/eventos/:id". useParams() lee la parte dinámica de la URL.
  OJO: los parámetros SIEMPRE son texto. En /eventos/3, id es "3" (no 3),
  por eso comparamos con String(e.id).
*/
function DetalleEvento({ eventos }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const evento = eventos.find((e) => String(e.id) === id)

  if (!evento) {
    return (
      <>
        <Hero titulo="Evento no encontrado" texto={`No existe un evento con id ${id}.`}>
          <Link className="btn btn--accent hero-cta" to="/">Volver a la cartelera</Link>
        </Hero>
        {/* layout vacío: el body es un grid de 4 filas (header|hero|layout|footer) */}
        <div className="layout" />
      </>
    )
  }

  return (
    <>
      <Hero titulo={evento.titulo} texto={evento.descripcion} />
      <div className="layout">
        <main className="main">
          <article className="detalle-evento">
            <img src={evento.imagen} alt={evento.alt} />
            <p><strong>Categoría:</strong> {evento.categoria}</p>
            <p><strong>Fecha:</strong> {evento.fecha}</p>
            <p><strong>Lugar:</strong> {evento.lugar}</p>
            <p><strong>Disponibilidad:</strong> {textoCupos(evento.cupos)}</p>
            <div className="detalle-acciones">
              <span className="card-price">{formatearPrecio(evento.precio)}</span>
              {/* Por ahora cualquiera puede editar. Cuando haya login (clase 21),
                  este enlace y la ruta /editar quedarán solo para administradores */}
              <Link className="btn btn--accent" to={`/eventos/${evento.id}/editar`}>
                Editar evento
              </Link>
              {/* navigate(-1) = botón "atrás" del navegador */}
              <button className="btn btn--secondary" onClick={() => navigate(-1)}>
                Volver
              </button>
            </div>
          </article>
        </main>
      </div>
    </>
  )
}

export default DetalleEvento
