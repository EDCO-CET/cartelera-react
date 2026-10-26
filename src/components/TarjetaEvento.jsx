import { Link } from 'react-router'
import { formatearPrecio, textoCupos } from '../utils/formato'

/*
  La misma tarjeta que crearTarjeta() en script.js, pero declarativa:
  en JS creábamos cada nodo con createElement + append (≈40 líneas);
  aquí describimos el resultado y React construye el DOM.
  Props: un objeto evento { id, titulo, descripcion, precio, cupos, imagen, alt }
*/
function TarjetaEvento({ evento }) {
  const urlDetalle = `/eventos/${evento.id}`   // ruta dinámica: /eventos/1, /eventos/2...

  return (
    <article className="card">
      {/* La imagen también lleva al detalle. tabIndex -1 + aria-hidden: el teclado
          y el lector de pantalla usan solo el enlace del título (no dos iguales) */}
      <Link to={urlDetalle} className="card-media" tabIndex={-1} aria-hidden="true">
        <img className="card-image" src={evento.imagen} alt="" />
        <span className="card-tag">Ver detalles</span>
      </Link>

      <div className="card-body">
        <h3><Link to={urlDetalle}>{evento.titulo}</Link></h3>
        <p>{evento.descripcion}</p>
        <small className="card-stock">{textoCupos(evento.cupos)}</small>
      </div>

      <div className="card-actions">
        <span className="card-price">{formatearPrecio(evento.precio)}</span>
        <button className="btn btn--accent">Comprar Ticket</button>
      </div>
    </article>
  )
}

export default TarjetaEvento
