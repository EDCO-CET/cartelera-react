import { Link, useParams } from 'react-router'
import Hero from '../components/Hero'
import { formatearPrecio, textoCupos } from '../utils/formato'
import { useAuth } from '../hooks/useAuth'

/*
  Página "/eventos/:id". useParams() lee la parte dinámica de la URL.
  OJO: los parámetros SIEMPRE son texto. En /eventos/3, id es "3" (no 3),
  por eso comparamos con String(e.id).
*/
function DetalleEvento({ eventos }) {
  const { id } = useParams()
  const { hasRole } = useAuth()
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
              {/* Clase 21: solo el admin ve el enlace (la ruta /editar además está
                  protegida en App.jsx; ocultar el botón NO basta por sí solo).
                  replace: el formulario REEMPLAZA al detalle en el historial; al
                  guardar o cancelar, el detalle lo vuelve a reemplazar. Así "atrás"
                  nunca regresa al formulario ni repite el detalle */}
              {hasRole('admin') && (
                <Link className="btn btn--accent" to={`/eventos/${evento.id}/editar`} replace>
                  Editar evento
                </Link>
              )}
              {/* Destino fijo. navigate(-1) dependería del historial: después de
                  editar, "atrás" sería el formulario, no la cartelera */}
              <Link className="btn btn--secondary" to="/">
                Volver a la cartelera
              </Link>
            </div>
          </article>
        </main>
      </div>
    </>
  )
}

export default DetalleEvento
