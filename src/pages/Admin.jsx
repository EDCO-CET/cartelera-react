import { useNavigate } from 'react-router'
import Hero from '../components/Hero'
import FormularioEvento from '../components/FormularioEvento'

/*
  Página "/admin": el mismo FormularioEvento de la rama clase-form, ahora en su ruta.
  Cuando la API (simulada) confirma el evento, lo agregamos al estado de App
  y navegamos por código a la cartelera para verlo en la lista.
*/
function Admin({ onCrear }) {
  const navigate = useNavigate()

  const crearYVolver = (evento) => {
    onCrear(evento)   // App lo agrega a la lista
    navigate('/')     // navegación programática: no hay un <Link> que clicar
  }

  return (
    <>
      <Hero
        titulo="Agregar evento"
        texto="Publica un evento nuevo en la cartelera. Todos los campos son obligatorios."
      />
      <div className="layout">
        <main className="main">
          <section id="admin">
            <FormularioEvento onCrear={crearYVolver} />
          </section>
        </main>
      </div>
    </>
  )
}

export default Admin
