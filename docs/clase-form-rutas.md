# Clase form + rutas: Inicio, Admin, detalle y edición con React Router

**Rama:** `clase-form-rutas` · **Viene de:** `clase-form` · **Presentación:** `Clase 16/clase-16-rutas-y-navegacion-en-react-con-react-router-presentacion-interactiva.html`

## Objetivo

Separar la cartelera de la rama `clase-form` en **páginas con URL propia**, aplicando lo de la presentación de rutas:

- `/`: la cartelera (eventos, destacado, acerca de y contacto).
- `/admin`: el formulario **Agregar evento**. Al publicar, la app vuelve sola a `/` con `useNavigate`.
- `/eventos/:id`: el **detalle** de un evento, con `useParams`. Se llega desde la tarjeta.
- `/eventos/:id/editar`: el **mismo formulario** en modo edición. **Por ahora cualquiera puede editar**: no hay login. En la clase 21 (Context y autenticación) se protege esta ruta.
- `*`: una página 404 para cualquier otra URL.

La validación y la API simulada con `setTimeout` se reutilizan de `clase-form`. `FormularioEvento` gana un modo edición (paso 10).

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
| `src/pages/DetalleEvento.jsx` | **Nuevo.** `/eventos/:id` con `useParams` |
| `src/pages/EditarEvento.jsx` | **Nuevo.** `/eventos/:id/editar`: `FormularioEvento` con los datos del evento |
| `src/components/TarjetaEvento.jsx` | El título y la imagen son `<Link>` al detalle |
| `src/components/FormularioEvento.jsx` | Prop opcional `evento` (modo edición); `onCrear` se renombra a `onGuardado` |
| `src/services/api.js` | Nueva función `actualizarEvento()` ("PUT" simulado) |
| `src/styles.css` | `.nav-list a.active`, `.header-logo`, enlaces de la tarjeta, página de detalle y color del texto de `.btn--secondary` |

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

  return <FormularioEvento onGuardado={crearYVolver} />  // (más el Hero y el layout)
}
```

**Qué explicar:**

- `FormularioEvento` llama `onGuardado(evento)` cuando la API simulada responde (en `clase-form` la prop se llamaba `onCrear`; se renombró porque ahora también edita). `Admin` decide qué significa "crear": agregar y navegar.
- `useNavigate` es para navegar **como consecuencia de una acción** (enviar un formulario), cuando no hay un enlace que el usuario pueda clicar.
- Solo navegamos si la API respondió bien. Si falla (un título con la palabra "error"), `onGuardado` no se llama: el usuario se queda en `/admin` con sus datos y el mensaje rojo.
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

## Paso 9: el detalle del evento con `useParams` (slides 23 y 24)

```jsx
// App.jsx
<Route path="eventos/:id" element={<DetalleEvento eventos={eventos} />} />

// pages/DetalleEvento.jsx
const { id } = useParams()
const evento = eventos.find((e) => String(e.id) === id)
```

```jsx
// TarjetaEvento.jsx: el título y la imagen llevan al detalle
const urlDetalle = `/eventos/${evento.id}`
<h3><Link to={urlDetalle}>{evento.titulo}</Link></h3>
```

**Qué explicar:**

- `:id` es la parte **dinámica** de la ruta: `/eventos/1`, `/eventos/2`... Una sola ruta sirve para todos los eventos.
- **Los parámetros siempre son texto.** En `/eventos/3`, `id` es `"3"`. `e.id === id` compara `3 === "3"` y da `false`: por eso `String(e.id) === id`. Demo: quitar el `String` y ver que todos los detalles dicen "Evento no encontrado".
- Si el id no existe (`/eventos/99`), la página muestra "Evento no encontrado" con su propio `Hero`. Es una 404 **dentro** de una ruta que sí existe.
- El detalle busca en el **mismo estado** de `App`: un evento recién creado en `/admin` ya tiene detalle (su id es el `Date.now()` que le dio la API simulada).
- La tarjeta tiene dos enlaces al mismo lugar (imagen y título). La imagen lleva `tabIndex={-1}` y `aria-hidden`, para que el teclado y el lector de pantalla encuentren **uno** solo.
- "Volver a la cartelera" es un `<Link to="/">` con destino **fijo**. Una primera versión usaba `navigate(-1)` (el botón atrás), y fallaba después de editar: "atrás" llevaba al formulario, no a la cartelera. Moraleja: `navigate(-1)` depende de cómo llegó el usuario. Si el destino es conocido, mejor un enlace.

## Paso 10: editar con el mismo formulario

```jsx
// App.jsx: reemplazar SOLO el evento editado (arreglo nuevo con map)
const actualizarEvento = (actualizado) => {
  setEventos((anteriores) =>
    anteriores.map((e) => (e.id === actualizado.id ? actualizado : e)),
  )
}

<Route
  path="eventos/:id/editar"
  element={<EditarEvento eventos={eventos} onActualizar={actualizarEvento} />}
/>
```

```jsx
// pages/EditarEvento.jsx
const volverAlDetalle = () => navigate(`/eventos/${evento.id}`, { replace: true })

const guardarYVer = (actualizado) => {
  onActualizar(actualizado)
  volverAlDetalle()
}

<FormularioEvento
  key={evento.id}
  evento={evento}
  onGuardado={guardarYVer}
  onCancelar={volverAlDetalle}
/>
```

```jsx
// FormularioEvento.jsx: el modo depende de si llega la prop evento
function FormularioEvento({ evento = null, onGuardado, onCancelar }) {
  const editando = evento !== null
  const inicial = editando ? aFormulario(evento) : VACIO
  const [formData, setFormData] = useState(inicial)
  // ...
  const guardado = editando ? await actualizarEvento(datos) : await crearEvento(datos)
```

**Qué explicar:**

- **Un formulario, dos usos.** Lo único que cambia es el valor inicial, la petición (POST o PUT) y los textos ("Editar evento", "Guardar cambios"). La validación y la accesibilidad son las mismas.
- **Cancelar** sale sin guardar y vuelve al detalle. Si `onCancelar` no llega (en `/admin`), el mismo botón dice "Limpiar" y vacía el formulario. Una primera versión tenía "Descartar cambios" (restaurar los datos originales sin salir). Al probarlo en clase no se entendía: si no se había cambiado nada, no pasaba nada visible, y el botón tenía texto negro sobre azul oscuro, así que parecía deshabilitado. Al editar, lo esperado es **salir** sin guardar.
- **Historial con `replace`:** el enlace "Editar evento" lleva `replace`, y al guardar o cancelar se navega con `{ replace: true }`. Así el formulario **nunca queda en el historial**: el botón atrás del navegador, desde el detalle, vuelve a la cartelera y no al formulario. Demo: quitar los dos `replace`, editar, guardar y pulsar atrás.
- `aFormulario` convierte `precio` y `cupos` a **texto**, porque los inputs trabajan con texto. Al enviar, el formulario los vuelve a convertir con `Number(...)`, igual que al crear.
- `useState(inicial)` solo usa el valor inicial en el **primer render**. Por eso `key={evento.id}`: si la URL cambia a otro evento sin salir de la página, React crea un formulario nuevo en vez de mostrar los datos del anterior.
- Inmutabilidad: `map` devuelve un **arreglo nuevo** donde solo cambia el evento editado. Con `eventos[i] = actualizado` React no se entera del cambio.
- Al editar, el destacado del aside y la tarjeta de Inicio se actualizan solos, porque leen del mismo estado.
- **Pregunta abierta para la clase:** "¿qué impide que cualquier visitante edite un evento?" Hoy, nada. Aquí se conecta con autenticación y rutas protegidas (clase 21). Además, la seguridad real va en el servidor: esconder el botón no basta.

---

## Verificación

`npm run lint` y `npm run build` pasan sin errores. En Chrome se probó:

- Navegación sin recarga, enlace activo, crear evento y volver a `/`, error simulado, 404 y abrir `/admin` directamente.
- Detalle desde la tarjeta, "Volver a la cartelera", `/eventos/99`, formulario de edición con los datos cargados, "Cancelar" (sin guardar), error simulado al editar, guardar y ver el cambio en el detalle, en la tarjeta y en el destacado.
- Editar un evento recién creado.
- Botón atrás del navegador después de guardar y después de cancelar: no vuelve al formulario.

El botón **adelante** del navegador no se probó.

- [ ] En `/`, "Inicio" aparece subrayado; en `/admin`, "Agregar evento".
- [ ] Al pasar de Inicio a Agregar evento, la página **no se recarga** (en DevTools → Network no hay una nueva petición del documento).
- [ ] Con datos válidos, el botón dice "Publicando..." y ~1,2 s después la app vuelve sola a `/`, con la tarjeta nueva al final de la lista.
- [ ] Con el título "error de prueba", sale el mensaje rojo, la URL sigue en `/admin` y los datos siguen en el formulario.
- [ ] `/no-existe` muestra "Página no encontrada" con header y footer, y el botón lleva a `/`.
- [ ] Los botones atrás y adelante del navegador recorren las páginas visitadas.
- [ ] Recargar con F5 en `/admin` abre directamente el formulario. Los eventos agregados se pierden: no hay base de datos, solo estado en memoria.
- [ ] Clic en el título o la imagen de "Concierto de jazz" lleva a `/eventos/1` con todos sus datos.
- [ ] `/eventos/99` muestra "Evento no encontrado".
- [ ] "Editar evento" abre `/eventos/1/editar` con el formulario lleno, incluida la casilla de destacado.
- [ ] Cambiar el título a "Jazz error" y guardar: el botón dice "Guardando...", sale el mensaje rojo y la URL no cambia.
- [ ] "Cancelar" vuelve al detalle sin guardar lo escrito.
- [ ] Después de guardar, el botón atrás del navegador lleva a la cartelera, no al formulario.
- [ ] "Volver a la cartelera" lleva a `/`, vengas de donde vengas.
- [ ] Cambiar el título y el precio, y guardar: la app vuelve a `/eventos/1` con los datos nuevos, y en Inicio cambian la tarjeta y el destacado.

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
| Todos los detalles dicen "Evento no encontrado" | `e.id === id` compara número con texto | `String(e.id) === id` |
| El formulario de edición sale vacío o con datos de otro evento | `useState` solo lee el valor inicial al montar | `key={evento.id}` en `FormularioEvento` |
| `A component is changing an uncontrolled input to be controlled` al editar | Al evento le falta un campo del formulario | `aFormulario` parte de `{ ...VACIO, ...evento }` |
| Se edita pero la lista no cambia | Se mutó el arreglo (`eventos[i] = ...`) | `map` que devuelve un arreglo nuevo |
| Después de guardar, "atrás" vuelve a abrir el formulario | La edición quedó en el historial | `replace` en el enlace a `/editar` y `{ replace: true }` al salir |
| Un botón de "Volver" lleva a lugares distintos | `navigate(-1)` depende del historial | `<Link to="...">` con destino fijo |

## Reto

1. **Enlace a Contacto desde cualquier página:** crear la ruta `/contacto` y mover ahí `FormularioContacto` con su propio `Hero`.
2. **Mensaje después de navegar:** `navigate('/', { state: { creado: evento.titulo } })` y en `Inicio` leer `useLocation().state?.creado` para mostrar "«Cine al parque» se publicó".
3. **Eliminar evento:** un botón "Eliminar" en el detalle, con confirmación, que use `filter` en `App` y navegue a `/`.
4. **Ruta solo para administradores (adelanto de la clase 21):** un componente `RutaProtegida` que, si no hay usuario, haga `<Navigate to="/" />` en vez de mostrar `EditarEvento`.
