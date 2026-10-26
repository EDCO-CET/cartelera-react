import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// React Router 8: todo se importa de 'react-router' (react-router-dom ya no existe)
import { BrowserRouter } from 'react-router'
// Los mismos estilos del proyecto en JS: se importan una sola vez y aplican a toda la app
import './styles.css'
import App from './App.jsx'

// BrowserRouter en el nivel más alto: todo lo que use Link, NavLink o
// useNavigate debe quedar DENTRO de él
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
