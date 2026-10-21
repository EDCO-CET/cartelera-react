// Tarjeta 3D del aside: el CSS es el mismo (.flip-card), solo cambian los datos
function EventoDestacado({ evento }) {
  return (
    <div
      className="flip-card"
      tabIndex={0}
      aria-label={`Evento destacado: ${evento.titulo}. Pasa el cursor o enfoca para ver detalles`}
    >
      <div className="flip-card-inner">
        <div className="flip-card-face flip-card-front">
          <img className="flip-card-image" src={evento.imagen} alt="" />
          <h3>{evento.titulo}</h3>
        </div>
        <div className="flip-card-face flip-card-back">
          <h3>{evento.titulo}</h3>
          <p>{evento.fecha}</p>
          <p>{evento.lugar}</p>
          <button className="btn btn--accent btn--pulse">Comprar</button>
        </div>
      </div>
    </div>
  )
}

export default EventoDestacado
