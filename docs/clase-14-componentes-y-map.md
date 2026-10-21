# Clase 14: de la cartelera en JS a React (componentes, JSX y `map`)

**Rama:** `clase-14` · **Viene de:** el proyecto en JS (`cartelera-js`, rama `clase-13`) · **Sigue:** `clase-15` (estado y carga)

## Objetivo

Al terminar, el estudiante puede:

- Crear un proyecto React con Vite y explicar qué hace cada archivo.
- Convertir HTML a JSX (`class` → `className`, etiquetas cerradas, `{}` para JS).
- Partir una página en componentes y pasarles datos por **props**.
- Pintar una lista con `.map()` y explicar para qué sirve `key`.

Resultado: la misma cartelera, con los mismos estilos, pero las 6 tarjetas salen de un JSON y un `map`.

## Antes de empezar

- Node 20 o superior (`node -v`).
- Tener abierto el proyecto JS para comparar: `styles.css`, `index.html`, `script.js` (`crearTarjeta`).

```bash
git switch clase-14
npm install
npm run dev        # abre http://localhost:5173
```

---

## Paso 1: crear el proyecto con Vite

```bash
npm create vite@latest cartelera-react -- --template react
cd cartelera-react
npm install
npm run dev
```

**Qué explicar (recorrido de archivos):**

| Archivo | Para qué |
|---|---|
| `index.html` | La única página. Tiene `<div id="root">` y carga `src/main.jsx` |
| `src/main.jsx` | Punto de entrada: `createRoot(...).render(<App />)` |
| `src/App.jsx` | El componente raíz. Todo lo demás cuelga de aquí |
| `public/` | Archivos que se sirven tal cual (`/favicon.svg`, `/img/...`) |
| `package.json` | Scripts `dev`, `build`, `lint` y dependencias |

> **Idea clave:** el navegador no entiende JSX. Vite lo traduce a JavaScript (`React.createElement(...)`) en cada guardado. Si sirve, enlaza con la demo `react/react-sin-jsx`.

## Paso 2: limpiar la plantilla

Borrar lo que trae Vite y no vamos a usar:

```bash
rm src/App.css src/index.css
rm -r src/assets
rm public/icons.svg
```

## Paso 3: traer los estilos y las imágenes del proyecto JS

```bash
cp ../clase\ 1/styles.css src/styles.css
mkdir -p public/img && cp ../clase\ 1/img/*.jpg public/img/
cp ../clase\ 1/favicon.svg public/
```

Solo hay **dos cambios** en `src/styles.css`:

1. La imagen del banner pasa a ruta absoluta (en Vite, `public/` es la raíz del sitio):

   ```css
   url("/img/banner.jpg");
   ```

2. Agregar justo antes de `h1, h2, h3 {`:

   ```css
   #root {
     display: contents;
   }
   ```

**Qué explicar:** en el proyecto JS el `body` es un grid de 4 filas (header | hero | layout | footer). En React todo queda dentro de `<div id="root">`, así que el body tiene **un solo hijo** y el grid se rompe. `display: contents` hace que ese div no cuente en el layout.

> 👀 **Demostración:** comentar la regla y mostrar cómo el footer deja de quedar abajo y el espaciado cambia.

## Paso 4: `index.html` y `main.jsx`

`index.html`: `lang="es"`, título `Cartelera` y la fuente Lato (los mismos `<link>` del proyecto JS). Ver el archivo.

`src/main.jsx`: importar los estilos una sola vez, para toda la app:

```jsx
import './styles.css'
```

## Paso 5: los datos fake (`src/data/eventos.json`)

Es el mismo `data/eventos.json` del proyecto JS, con un cambio: las imágenes empiezan con `/`.

```json
"imagen": "/img/jazz.jpg"
```

**Por qué la `/`:** `img/jazz.jpg` es relativa a la URL actual. Hoy funciona, pero en la clase 17, con rutas como `/eventos/3`, el navegador buscaría `/eventos/img/jazz.jpg`. Con `/img/...` siempre se busca desde la raíz.

Importar un JSON en Vite devuelve el arreglo directamente, sin `fetch`:

```jsx
import eventos from './data/eventos.json'
```

## Paso 6: funciones de ayuda (`src/utils/formato.js`)

Son `formatearPrecio` y `textoCupos`, copiadas de `script.js` y con `export`. No son componentes, son JS puro, y por eso viven fuera de `components/`.

```js
export const formatearPrecio = (precio) => { ... }
export const textoCupos = (cupos) => { ... }
```

## Paso 7: el primer componente, `TarjetaEvento`

Proyectar lado a lado `crearTarjeta()` de `script.js` y este archivo:

```jsx
import { formatearPrecio, textoCupos } from '../utils/formato'

function TarjetaEvento({ evento }) {
  return (
    <article className="card">
      <div className="card-media">
        <img className="card-image" src={evento.imagen} alt={evento.alt} />
        <span className="card-tag">Ver detalles</span>
      </div>

      <div className="card-body">
        <h3>{evento.titulo}</h3>
        <p>{evento.descripcion}</p>
        <small className="card-stock">{textoCupos(evento.cupos)}</small>
      </div>

      <div className="card-actions">
        <span className="card-price">{formatearPrecio(evento.precio)}</span>
        <button className="btn btn--accent">Comprar Ticket</button>
      </div>
    </article>
  )
}

export default TarjetaEvento
```

**Qué explicar:**

- **Declarativo frente a imperativo:** en JS eran unas 40 líneas de `createElement` + `append`. Aquí describimos el resultado y React construye el DOM.
- **Reglas de JSX:** `className` en lugar de `class`; `<img />` se cierra; `{ }` sirve para cualquier expresión JS (variables, llamadas a funciones); se devuelve un solo elemento raíz.
- **Props:** `{ evento }` es desestructuración del objeto `props`. El componente es una función que recibe datos y devuelve UI.
- El nombre del componente va en **PascalCase**. Si se escribe `<tarjetaEvento />`, React lo trata como una etiqueta HTML desconocida.

## Paso 8: la lista con `map` (`ListaEventos`)

```jsx
function ListaEventos({ eventos }) {
  return (
    <div className="events-container">
      {eventos.map((evento) => (
        <TarjetaEvento key={evento.id} evento={evento} />
      ))}
    </div>
  )
}
```

**Qué explicar:**

- En JS hacíamos `for (let evento of eventos) crearTarjeta(evento)`. Aquí `map` **transforma** cada objeto en un elemento JSX y React pinta el arreglo resultante.
- `key` debe ser **única y estable**. Usar el `id`; el índice solo si la lista nunca cambia de orden.
- 👀 **Demostración:** quitar `key` y mostrar la advertencia en la consola (`Each child in a list should have a unique "key" prop`).

## Paso 9: partir el resto de la página en componentes

Cada bloque del `index.html` original pasa a ser un componente en `src/components/`:

| HTML original | Componente | Detalle para comentar |
|---|---|---|
| `<header class="header">` | `Header.jsx` | Copiar y pegar, cambiando `class` por `className` |
| `<section class="hero">` | `Hero.jsx` | `aria-*` y `data-*` se escriben igual |
| `.flip-card` del aside | `EventoDestacado.jsx` | Recibe el evento por props; `tabindex` → `tabIndex` (camelCase); template string en `aria-label` |
| `#aboutus` | `AcercaDe.jsx` | Componente estático, sin props |
| `<footer>` | `Footer.jsx` | Componente estático |

> Se omiten a propósito el formulario de contacto, la calculadora y la demo de grid. El formulario vuelve en la clase 16, ya como formulario controlado.

## Paso 10: componer todo en `App.jsx`

```jsx
import eventos from './data/eventos.json'

function App() {
  const destacado = eventos.find((evento) => evento.destacado)

  return (
    <>
      <Header />
      <Hero />
      <div className="layout">
        <aside className="aside aside--featured">
          <h2>Eventos destacados</h2>
          {destacado && <EventoDestacado evento={destacado} />}
        </aside>
        <main id="home" className="main">
          <section id="events">
            <h2>Proximos eventos</h2>
            <ListaEventos eventos={eventos} />
          </section>
          <AcercaDe />
        </main>
        <aside className="aside aside--info">...</aside>
      </div>
      <Footer />
    </>
  )
}
```

**Qué explicar:**

- `<>...</>` (Fragment) agrupa sin añadir un `div` al DOM, porque un `div` extra rompería el grid del body.
- `{destacado && <... />}` es renderizado condicional: si `destacado` es `undefined`, no se pinta nada.
- Los datos fluyen **de arriba hacia abajo**: `App` → `ListaEventos` → `TarjetaEvento`.

## Verificación

- [ ] `npm run dev` abre la cartelera y se ve igual que el proyecto JS.
- [ ] Se ven 6 tarjetas; la consola no muestra advertencias de `key`.
- [ ] La tarjeta 3D del aside muestra el evento destacado (jazz).
- [ ] Al cambiar un precio en `eventos.json`, la página se actualiza sola (HMR).
- [ ] `npm run build` termina sin errores.

## Errores comunes

| Síntoma | Causa | Solución |
|---|---|---|
| Página en blanco y en consola `X is not defined` | Falta el `import` del componente | Importarlo arriba del archivo |
| `Adjacent JSX elements must be wrapped` | Dos elementos raíz en el `return` | Envolver en `<>...</>` |
| Las clases CSS no aplican | Se escribió `class` | `className` |
| El footer no queda abajo y el layout se ve raro | Falta `#root { display: contents }` | Paso 3 |
| Imágenes rotas | Rutas `img/...` sin `/` o imágenes fuera de `public/` | `public/img` + `"/img/..."` |
| El componente no aparece | Nombre en minúscula | PascalCase |

## Reto para los estudiantes

1. Mostrar la `categoria` como etiqueta en la tarjeta.
2. Crear un componente `Etiqueta` reutilizable y usarlo en la tarjeta y en el aside.
3. Pintar en `EventoDestacado` **todos** los destacados con `filter` + `map`, no solo el primero.

## Qué sigue

Clase 15: el botón **Comprar Ticket** todavía no hace nada y los datos son fijos. Vamos a agregar **estado** (`useState`), cargar los eventos con `fetch` dentro de `useEffect`, y mostrar *cargando*, *error* y *vacío*.
