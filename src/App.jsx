import { useState } from 'react'
import { Route, Routes } from 'react-router'
import Layout from './components/Layout'
import RutaProtegida from './components/RutaProtegida'
import Inicio from './pages/Inicio'
import Admin from './pages/Admin'
import DetalleEvento from './pages/DetalleEvento'
import EditarEvento from './pages/EditarEvento'
import NoEncontrado from './pages/NoEncontrado'
import Login from './pages/Login'
// Datos fake: Vite convierte el .json en un arreglo de JS al importarlo
import eventosIniciales from './data/eventos.json'

/*
  App ahora tiene dos trabajos:
  1. Guardar el estado que comparten las rutas: /admin agrega, /eventos/:id/editar
     modifica, y / y /eventos/:id muestran.
     Si el estado viviera dentro de una página, se perdería al cambiar de ruta.
  2. Declarar qué componente se pinta en cada URL (<Routes>).
*/
function App() {
  // Los eventos son ESTADO: al agregar uno, React vuelve a pintar la lista
  const [eventos, setEventos] = useState(eventosIniciales)

  // El formulario entrega el evento ya "guardado" por la API (con id).
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
        <Route index element={<Inicio eventos={eventos} />} />
        <Route path="login" element={<Login />} />
        {/* :id es dinámico: /eventos/1, /eventos/2... */}
        <Route path="eventos/:id" element={<DetalleEvento eventos={eventos} />} />

        {/* Otra ruta padre SIN path, anidada en Layout: no cambia la URL, solo decide
            si sus hijas se muestran. Todo lo de adentro queda solo para admin. */}
        <Route element={<RutaProtegida rol="admin" />}>
          <Route path="admin" element={<Admin onCrear={agregarEvento} />} />
          <Route
            path="eventos/:id/editar"
            element={<EditarEvento eventos={eventos} onActualizar={actualizarEvento} />}
          />
        </Route>

        {/* Comodín: cualquier URL que no coincida con las anteriores */}
        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  )
}

export default App
