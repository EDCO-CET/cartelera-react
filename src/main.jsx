import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Los mismos estilos del proyecto en JS: se importan una sola vez y aplican a toda la app
import './styles.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
