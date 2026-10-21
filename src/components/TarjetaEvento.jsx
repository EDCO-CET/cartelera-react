import { formatearPrecio, textoCupos } from '../utils/formato'

/*
  La misma tarjeta que crearTarjeta() en script.js, pero declarativa:
  en JS creábamos cada nodo con createElement + append (≈40 líneas);
  aquí describimos el resultado y React construye el DOM.
  Props: un objeto evento { id, titulo, descripcion, precio, cupos, imagen, alt }
*/
function TarjetaEvento({ evento }) {
  return (
    <article className="card">
      <div className="card-media">
        <img className="card-image" src={evento.imagen} alt={evento.alt} />
        <span className="card-tag">Ver detalles</span>
      </div>

      <div className="card-body">
        <h3>{evento.titulo}</h3>
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
