import { Link, useNavigate, useParams } from 'react-router'
import Hero from '../components/Hero'
import FormularioEvento from '../components/FormularioEvento'

/*
  Página "/eventos/:id/editar": el MISMO FormularioEvento de /admin,
  pero arrancando con los datos del evento (prop evento).
*/
function EditarEvento({ eventos, onActualizar }) {
  const { id } = useParams()   // texto: "3", no 3
  const navigate = useNavigate()
  const evento = eventos.find((e) => String(e.id) === id)

  if (!evento) {
    return (
      <>
        <Hero titulo="Evento no encontrado" texto={`No existe un evento con id ${id}.`}>
          <Link className="btn btn--accent hero-cta" to="/">Volver a la cartelera</Link>
        </Hero>
        <div className="layout" />
      </>
    )
  }

  const guardarYVer = (actualizado) => {
    onActualizar(actualizado)               // App reemplaza el evento en la lista
    navigate(`/eventos/${actualizado.id}`)  // volvemos al detalle con los datos nuevos
  }

  return (
    <>
      <Hero titulo={`Editar: ${evento.titulo}`} texto="Cambia los datos y guarda. Los cambios se ven al instante en la cartelera." />
      <div className="layout">
        <main className="main">
          <section id="admin">
            {/* key: si la URL pasa a otro evento sin salir de esta página, React
                crea un formulario NUEVO (useState vuelve a leer el valor inicial) */}
            <FormularioEvento key={evento.id} evento={evento} onGuardado={guardarYVer} />
          </section>
        </main>
      </div>
    </>
  )
}

export default EditarEvento
