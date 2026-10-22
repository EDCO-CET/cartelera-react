import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import EventoDestacado from './components/EventoDestacado'
import ListaEventos from './components/ListaEventos'
import AcercaDe from './components/AcercaDe'
import FormularioEvento from './components/FormularioEvento'
import FormularioContacto from './components/FormularioContacto'
import Footer from './components/Footer'
// Datos fake: Vite convierte el .json en un arreglo de JS al importarlo
import eventosIniciales from './data/eventos.json'

function App() {
  // Los eventos ahora son ESTADO: al agregar uno, React vuelve a pintar la lista
  const [eventos, setEventos] = useState(eventosIniciales)

  // El formulario entrega el evento ya "guardado" por la API (con id).
  // Arreglo NUEVO con spread: nunca eventos.push(...)
  const agregarEvento = (evento) => {
    setEventos((anteriores) => [...anteriores, evento])
  }

  // El primer evento marcado como destacado (o undefined si no hay ninguno)
  const destacado = eventos.find((evento) => evento.destacado)

  return (
    // Fragmento <>...</>: agrupa sin agregar un div extra al DOM
    <>
      <Header />
      <Hero />
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
          <section id="admin">
            <h2>Agregar evento</h2>
            <FormularioEvento onCrear={agregarEvento} />
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
      <Footer />
    </>
  )
}

export default App
