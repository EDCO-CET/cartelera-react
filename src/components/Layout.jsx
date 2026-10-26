import { Outlet } from 'react-router'
import Header from './Header'
import Footer from './Footer'

/*
  Ruta "layout": lo que se repite en todas las páginas.
  <Outlet /> es el hueco donde React Router pinta la página de la ruta actual.
*/
function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}

export default Layout
