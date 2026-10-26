import { useState } from 'react'
import { Route, Routes } from 'react-router'
import Layout from './components/Layout'
import Inicio from './pages/Inicio'
import Admin from './pages/Admin'
import NoEncontrado from './pages/NoEncontrado'
// Datos fake: Vite convierte el .json en un arreglo de JS al importarlo
import eventosIniciales from './data/eventos.json'

/*
  App ahora tiene dos trabajos:
  1. Guardar el estado que comparten las rutas: /admin agrega eventos y / los muestra.
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

  return (
    <Routes>
      {/* Ruta padre SIN path: solo aporta el layout (header + footer) */}
      <Route element={<Layout />}>
        {/* index = la ruta "/" dentro del padre */}
        <Route index element={<Inicio eventos={eventos} />} />
        <Route path="admin" element={<Admin onCrear={agregarEvento} />} />
        {/* Comodín: cualquier URL que no coincida con las anteriores */}
        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  )
}

export default App
