import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'
import Layout from './components/Layout'
import Hero from './components/Hero'
import RutaProtegida from './components/RutaProtegida'
import Inicio from './pages/Inicio'
import Admin from './pages/Admin'
import DetalleEvento from './pages/DetalleEvento'
import EditarEvento from './pages/EditarEvento'
import NoEncontrado from './pages/NoEncontrado'
import Login from './pages/Login'
import { obtenerEventos } from './services/api'

// Mientras llegan los eventos (o si fallan), las páginas que los usan muestran esto.
// Sin esperar, /eventos/3 diría "no encontrado" durante la carga.
function EstadoEventos({ error }) {
  return (
    <>
      <Hero
        titulo={error ? 'No se pudieron cargar los eventos' : 'Cargando eventos...'}
        texto={error ? 'Revisa tu conexión y recarga la página.' : 'Un momento, por favor.'}
      />
      <div className="layout" />
    </>
  )
}

/*
  App ahora tiene dos trabajos:
  1. Guardar el estado que comparten las rutas: /admin agrega, /eventos/:id/editar
     modifica, y / y /eventos/:id muestran.
     Si el estado viviera dentro de una página, se perdería al cambiar de ruta.
  2. Declarar qué componente se pinta en cada URL (<Routes>).
*/
function App() {
  // Los eventos son ESTADO: al agregar uno, React vuelve a pintar la lista.
  // Clase Supabase: arrancan vacíos y llegan de la base de datos.
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // [] = solo al montar. La función async va ADENTRO: useEffect no acepta una async directa.
  useEffect(() => {
    const cargar = async () => {
      try {
        setEventos(await obtenerEventos())
      } catch (err) {
        console.error('Error al cargar los eventos:', err)
        setError(err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  // Envuelve las páginas que necesitan la lista de eventos
  const conEventos = (pagina) => (cargando || error ? <EstadoEventos error={error} /> : pagina)

  // El formulario entrega el evento ya guardado en Supabase (con el id que asignó Postgres).
  // Arreglo NUEVO con spread: nunca eventos.push(...)
  const agregarEvento = (evento) => {
    setEventos((anteriores) => [...anteriores, evento])
  }

  // Editar = arreglo NUEVO donde solo cambia el evento con ese id
  const actualizarEvento = (actualizado) => {
    setEventos((anteriores) =>
      anteriores.map((e) => (e.id === actualizado.id ? actualizado : e)),
    )
  }

  return (
    <Routes>
      {/* Ruta padre SIN path: solo aporta el layout (header + footer) */}
      <Route element={<Layout />}>
        {/* index = la ruta "/" dentro del padre */}
        <Route index element={conEventos(<Inicio eventos={eventos} />)} />
        <Route path="login" element={<Login />} />
        {/* :id es dinámico: /eventos/1, /eventos/2... */}
        <Route path="eventos/:id" element={conEventos(<DetalleEvento eventos={eventos} />)} />

        {/* Otra ruta padre SIN path, anidada en Layout: no cambia la URL, solo decide
            si sus hijas se muestran. Todo lo de adentro queda solo para admin. */}
        <Route element={<RutaProtegida rol="admin" />}>
          <Route path="admin" element={<Admin onCrear={agregarEvento} />} />
          <Route
            path="eventos/:id/editar"
            element={conEventos(<EditarEvento eventos={eventos} onActualizar={actualizarEvento} />)}
          />
        </Route>

        {/* Comodín: cualquier URL que no coincida con las anteriores */}
        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  )
}

export default App
