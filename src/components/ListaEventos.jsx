import TarjetaEvento from './TarjetaEvento'

/*
  En JS: for (let evento of eventos) { crearTarjeta(evento) }
  En React: .map() transforma cada objeto del arreglo en un <TarjetaEvento />.
  key ayuda a React a saber qué tarjeta es cuál cuando la lista cambia:
  debe ser única y estable -> el id, nunca el índice si la lista se reordena.
*/
function ListaEventos({ eventos }) {
  return (
    <div className="events-container">
      {eventos.map((evento) => (
        <TarjetaEvento key={evento.id} evento={evento} />
      ))}
    </div>
  )
}

export default ListaEventos
