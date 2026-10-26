# Clase form + rutas: Inicio y Admin con React Router

**Rama:** `clase-form-rutas` · **Viene de:** `clase-form` · **Presentación:** `Clase 16/clase-16-rutas-y-navegacion-en-react-con-react-router-presentacion-interactiva.html`

## Objetivo

Separar la cartelera de la rama `clase-form` en **páginas con URL propia**, aplicando lo de la presentación de rutas:

- `/`: la cartelera (eventos, destacado, acerca de y contacto).
- `/admin`: el formulario **Agregar evento**. Al publicar, la app vuelve sola a `/` con `useNavigate`.
- `*`: una página 404 para cualquier otra URL.

Los formularios, la validación y la API simulada con `setTimeout` **no cambian**: se reutilizan tal cual de `clase-form`.

```bash
git switch clase-form-rutas
npm install          # instala react-router (nuevo en esta rama)
npm run dev
```

> Cambios respecto a `clase-form`: `git diff clase-form clase-form-rutas -- src`

---

## Archivos

| Archivo | Cambio |
|---|---|
| `package.json` | Nueva dependencia `react-router@^8.5.0` |
| `src/main.jsx` | Envuelve `<App />` en `<BrowserRouter>` |
| `src/App.jsx` | Guarda `eventos` y declara las rutas con `<Routes>` |
| `src/components/Layout.jsx` | **Nuevo.** Header + `<Outlet />` + Footer |
| `src/components/Header.jsx` | `<a href>` → `<Link>` y `<NavLink>` |
| `src/components/Hero.jsx` | Recibe `titulo`, `texto` y `children` para reutilizarlo en cada página |
| `src/pages/Inicio.jsx` | **Nuevo.** Lo que antes era el cuerpo de `App`, sin el formulario de agregar |
| `src/pages/Admin.jsx` | **Nuevo.** `FormularioEvento` + `useNavigate` |
| `src/pages/NoEncontrado.jsx` | **Nuevo.** Ruta comodín `*` |
| `src/styles.css` | `.nav-list a.active` y `.header-logo` |

Convención: `components/` son piezas reutilizables; `pages/` tiene **un componente por ruta**.

---

## Paso 1: instalar React Router (slide 4)

```bash
npm install react-router
```

**Qué explicar:**

- En la v8 todo se importa de `'react-router'`. El paquete `react-router-dom` de los tutoriales (v6/v7) **ya no existe**: si un estudiante copia `import { Link } from 'react-router-dom'`, Vite muestra `Failed to resolve import "react-router-dom"`.
- Verificar la versión con `npm ls react-router`.

## Paso 2: `BrowserRouter` en `main.jsx` (slide 9)

```jsx
<StrictMode>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</StrictMode>
```

**Qué explicar:**

- Va en el nivel más alto: todo lo que use `Link`, `NavLink` o `useNavigate` debe quedar **dentro**. Si no, el error es `useHref() may be used only in the context of a <Router> component`.
- Usa la History API: `history.pushState` cambia la URL sin pedir nada al servidor.

## Paso 3: las páginas (`pages/`)

1. Crear `src/pages/Inicio.jsx` y **mover** ahí el JSX del cuerpo de `App` (Hero + `.layout`), **sin** la sección `#admin`.
2. Crear `src/pages/Admin.jsx` con un `Hero` propio y `<FormularioEvento />`.
3. Convertir `Hero` en un componente con props (`titulo`, `texto`, `children`), porque ahora cada página tiene su propio banner.

**Qué explicar:**

- **Cada página debe tener un `Hero` y un `.layout`.** El `body` es un grid de 4 filas (`header | .hero | .layout | footer`). Si una página omite una de esas piezas, el footer se sube o el contenido queda en la fila equivocada. Por eso la 404 tiene un `<div className="layout" />` vacío.
- El botón "Ver eventos" del Hero de Inicio sigue siendo `<a href="#events">`: es un ancla **dentro de la misma página** y no cambia de ruta, así que un `<a>` normal está bien.

## Paso 4: las rutas en `App.jsx` (slides 10, 37 y 39)

```jsx
function App() {
  const [eventos, setEventos] = useState(eventosIniciales)

  const agregarEvento = (evento) => {
    setEventos((anteriores) => [...anteriores, evento])
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio eventos={eventos} />} />
        <Route path="admin" element={<Admin onCrear={agregarEvento} />} />
        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  )
}
```

**Qué explicar:**

- **El estado se queda en `App`.** `/admin` agrega eventos y `/` los muestra. Si `eventos` viviera en `Inicio`, al ir a `/admin` la página `Inicio` se desmonta y su estado se pierde. Es "levantar el estado" (clase 15) aplicado a rutas.
- `element` recibe **JSX**: `element={<Admin />}`, no `element={Admin}`. Con lo segundo no se pinta nada.
- La ruta padre **no tiene `path`**: solo aporta el layout. `index` es la ruta `/` dentro de ese padre.
- `path="*"` funciona aunque esté al final o al principio: React Router 8 elige la ruta **más específica**, no la primera que coincide (slide 13).

## Paso 5: el layout con `Outlet` (slide 37)

```jsx
function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}
```

**Qué explicar:**

- `<Outlet />` es el hueco donde se pinta la página de la ruta actual. Header y Footer se escriben **una vez** y no se vuelven a montar al navegar.

## Paso 6: navegación con `Link` y `NavLink` (slides 15 y 18)

```jsx
<h1><Link to="/" className="header-logo">Cartelera de eventos</Link></h1>
<ul className="nav-list">
  <li><NavLink to="/" end>Inicio</NavLink></li>
  <li><NavLink to="/admin">Agregar evento</NavLink></li>
</ul>
```

```css
.nav-list a.active::after { transform: scaleX(1); }
```

**Qué explicar:**

- **Demo clave:** agregar un evento, volver a Inicio y luego cambiar temporalmente un `NavLink` por `<a href="/admin">`. Al hacer clic, la página **se recarga** y el evento agregado **desaparece**: la recarga reinicia el estado al JSON original.
- `NavLink` agrega la clase `active` y `aria-current="page"` al enlace de la ruta actual. El CSS del proyecto en JS ya tenía el subrayado animado (`::after`); solo hubo que dejarlo fijo con `.active`.
- `end` en `"/"` es **opcional** en React Router 8: `"/"` solo se activa en la raíz. Lo dejamos por claridad. El PDF dice lo contrario; la corrección está en las notas de la slide 18.
- **Se quitaron del menú** los enlaces `#events`, `#aboutus` y `#contact`. Desde `/admin`, `href="#contact"` lleva a `/admin#contact`, donde esa sección no existe. Buena pregunta para la clase: "¿cómo harían un enlace a Contacto que funcione desde cualquier página?" (ver el Reto).

## Paso 7: volver a la cartelera con `useNavigate` (slide 19)

```jsx
function Admin({ onCrear }) {
  const navigate = useNavigate()

  const crearYVolver = (evento) => {
    onCrear(evento)   // App lo agrega a la lista
    navigate('/')     // navegación programática
  }

  return <FormularioEvento onCrear={crearYVolver} />  // (más el Hero y el layout)
}
```

**Qué explicar:**

- `FormularioEvento` **no se modificó**: sigue llamando `onCrear(creado)` cuando la API simulada responde. `Admin` decide qué significa "crear": agregar y navegar.
- `useNavigate` es para navegar **como consecuencia de una acción** (enviar un formulario), cuando no hay un enlace que el usuario pueda clicar.
- Solo navegamos si la API respondió bien. Si falla (un título con la palabra "error"), `onCrear` no se llama: el usuario se queda en `/admin` con sus datos y el mensaje rojo.
- **Efecto secundario a comentar:** el mensaje verde "se publicó en la cartelera" del formulario ya no se ve, porque `/admin` se desmonta al navegar. React 19 ignora en silencio esos `setState` sobre un componente desmontado. El Reto 2 lo resuelve.

## Paso 8: la página 404 (slide 39)

```jsx
function NoEncontrado() {
  const { pathname } = useLocation()
  return (
    <>
      <Hero titulo="Página no encontrada" texto={`La ruta ${pathname} no existe.`}>
        <Link className="btn btn--accent hero-cta" to="/">Volver a la cartelera</Link>
      </Hero>
      <div className="layout" />
    </>
  )
}
```

**Qué explicar:**

- Está dentro del layout, así que conserva header y footer.
- En desarrollo, Vite responde `index.html` para cualquier URL, y por eso `/admin` funciona al recargar. En un hosting estático hay que configurar ese "fallback" (lo veremos en la clase de despliegue en Vercel).

---

## Verificación

`npm run lint` y `npm run build` pasan sin errores. En Chrome se probó: navegación sin recarga, enlace activo, crear evento y volver a `/`, error simulado, 404 y abrir `/admin` directamente. Atrás/adelante no se probó en el navegador: incluirlo en la revisión antes de clase.

- [ ] En `/`, "Inicio" aparece subrayado; en `/admin`, "Agregar evento".
- [ ] Al pasar de Inicio a Agregar evento, la página **no se recarga** (en DevTools → Network no hay una nueva petición del documento).
- [ ] Con datos válidos, el botón dice "Publicando..." y ~1,2 s después la app vuelve sola a `/`, con la tarjeta nueva al final de la lista.
- [ ] Con el título "error de prueba", sale el mensaje rojo, la URL sigue en `/admin` y los datos siguen en el formulario.
- [ ] `/no-existe` muestra "Página no encontrada" con header y footer, y el botón lleva a `/`.
- [ ] Los botones atrás y adelante del navegador recorren las páginas visitadas.
- [ ] Recargar con F5 en `/admin` abre directamente el formulario. Los eventos agregados se pierden: no hay base de datos, solo estado en memoria.

**Datos válidos para la demo:** título `Cine al parque`, categoría Música, fecha `Domingo 1 de noviembre, 5 pm`, lugar `Parque de la 93`, precio `0`, cupos `20`, imagen `/img/festival.jpg`, alt `Pantalla gigante en un parque`, descripción `Proyección de clásicos al aire libre`.

## Errores comunes

| Síntoma | Causa | Solución |
|---|---|---|
| `Failed to resolve import "react-router-dom"` | Código copiado de v6/v7 | Importar de `'react-router'` |
| `useHref() may be used only in the context of a <Router>` | `Link` o `useNavigate` fuera de `BrowserRouter` | Envolver `<App />` en `main.jsx` |
| La ruta no pinta nada | `element={Admin}` | `element={<Admin />}` |
| El evento agregado desaparece al navegar | `<a href>` en vez de `Link`, o estado dentro de `Inicio` | Usar `Link` / `NavLink` y dejar `eventos` en `App` |
| El footer queda pegado al header en una página | La página no tiene `Hero` o `.layout` | Cada página aporta las dos filas del grid |
| Pantalla en blanco con `Outlet` | Falta `<Outlet />` en `Layout` | Agregarlo entre Header y Footer |
| El menú no se subraya | Se usó `Link` en vez de `NavLink` | `NavLink` agrega la clase `active` |

## Reto

1. **Enlace a Contacto desde cualquier página:** crear la ruta `/contacto` y mover ahí `FormularioContacto` con su propio `Hero`.
2. **Mensaje después de navegar:** `navigate('/', { state: { creado: evento.titulo } })` y en `Inicio` leer `useLocation().state?.creado` para mostrar "«Cine al parque» se publicó".
3. **Detalle de evento:** ruta `eventos/:id` con `useParams` (recordar que el `id` llega como texto). La solución está en la rama `clase-17`.
