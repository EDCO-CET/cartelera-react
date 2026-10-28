import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// React Router 8: todo se importa de 'react-router' (react-router-dom ya no existe)
import { BrowserRouter } from 'react-router'
// Los mismos estilos del proyecto en JS: se importan una sola vez y aplican a toda la app
import './styles.css'
import App from './App.jsx'
import AuthProvider from './context/AuthProvider.jsx'

// BrowserRouter en el nivel más alto: todo lo que use Link, NavLink o
// useNavigate debe quedar DENTRO de él.
// AuthProvider envuelve a App (no al revés): así App y todo lo que pinta
// pueden usar useAuth(). Va dentro del router por si algún día necesita useNavigate.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
