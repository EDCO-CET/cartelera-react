import Hero from '../components/Hero'
import EventoDestacado from '../components/EventoDestacado'
import ListaEventos from '../components/ListaEventos'
import AcercaDe from '../components/AcercaDe'
import FormularioContacto from '../components/FormularioContacto'

/*
  Página "/": lo que antes era el cuerpo de App, sin el formulario de agregar
  (ese se mudó a /admin). Los eventos llegan por props porque viven en App.
*/
function Inicio({ eventos }) {
  // El primer evento marcado como destacado (o undefined si no hay ninguno)
  const destacado = eventos.find((evento) => evento.destacado)

  return (
    <>
      <Hero
        titulo="Bienvenido a la cartelera"
        texto="Conciertos, festivales, talleres y encuentros en Bogotá. Encuentra tu próximo plan y compra tu entrada en un solo lugar."
      >
        {/* Ancla dentro de la MISMA página: aquí un <a href> normal está bien */}
        <a className="btn btn--accent hero-cta" href="#events">Ver eventos</a>
      </Hero>

      <div className="layout">
        <aside className="aside aside--featured">
          <h2>Eventos destacados</h2>
          {/* Renderizado condicional: si no hay destacado no se pinta nada */}
          {destacado && <EventoDestacado evento={destacado} />}
        </aside>

        <main id="home" className="main">
          <section id="events">
            <h2>Proximos eventos</h2>
            <ListaEventos eventos={eventos} />
          </section>
          <AcercaDe />
          <section id="contact">
            <h2>Contacto</h2>
            <FormularioContacto />
          </section>
        </main>

        <aside className="aside aside--info">
          <h2>Info util</h2>
          <section>
            <h3>Horarios</h3>
            <p>Lunes a viernes de 7pm a 9pm</p>
          </section>
        </aside>
      </div>
    </>
  )
}

export default Inicio
