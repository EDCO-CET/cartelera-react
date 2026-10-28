# Clase form + auth: login, sesión global y rutas protegidas con Context

**Rama:** `clase-form-auth` · **Viene de:** `clase-form-rutas` · **Presentación:** `Clase 21/clase-21-context-y-manejo-global-del-estado-en-react-presentacion-interactiva.html`

## Objetivo

En `clase-form-rutas` **cualquiera** podía entrar a `/admin` y editar eventos. En esta rama:

- Hay una página `/login` (login **simulado** en `services/api.js`, igual que `crearEvento`).
- La sesión vive en un **contexto** (`AuthProvider`) y cualquier componente la lee con `useAuth()`, sin props.
- `/admin` y `/eventos/:id/editar` quedan **solo para el rol admin** con una ruta layout `RutaProtegida`.
- El `Header` muestra "Ingresar" o "Hola, nombre · Salir", y "Agregar evento" solo al admin.
- El botón "Editar evento" del detalle solo lo ve el admin.
- La sesión sobrevive a F5 (`localStorage`).

Usuarios de prueba (contraseña `1234`): `admin@cartelera.co` (admin) y `ana@cartelera.co` (usuario).

```bash
git switch clase-form-auth
npm install          # no hay dependencias nuevas
npm run dev
```

> Cambios respecto a `clase-form-rutas`: `git diff clase-form-rutas clase-form-auth -- src`

---

## Archivos

| Archivo | Cambio |
|---|---|
| `src/services/api.js` | Nueva función `iniciarSesion(email, password)`: "POST /login" simulado que rechaza con `Credenciales inválidas` |
| `src/context/AuthContext.js` | **Nuevo.** Solo `createContext(null)` |
| `src/context/AuthProvider.jsx` | **Nuevo.** Estado `usuario`, `login`, `logout`, `hasRole` y persistencia en `localStorage` |
| `src/hooks/useAuth.js` | **Nuevo.** `useContext` + error claro si falta el Provider |
| `src/components/RutaProtegida.jsx` | **Nuevo.** Ruta layout: sin sesión → `<Navigate to="/login">`; sin rol → aviso; si no → `<Outlet />` |
| `src/pages/Login.jsx` | **Nuevo.** Formulario, error visible, carga, y vuelta a la página que se quería visitar |
| `src/main.jsx` | `<AuthProvider>` envuelve a `<App />` (dentro del `BrowserRouter`) |
| `src/App.jsx` | Ruta `login` y `RutaProtegida rol="admin"` envolviendo `admin` y `eventos/:id/editar` |
| `src/components/Header.jsx` | Lee la sesión con `useAuth()`; "Salir" con `startTransition` (paso 7) |
| `src/pages/DetalleEvento.jsx` | "Editar evento" solo con `hasRole('admin')` |
| `src/styles.css` | `.nav-usuario` y `.nav-salir` |

¿Por qué tres archivos para la sesión? `.oxlintrc.json` tiene la regla `react/only-export-components`: un archivo `.jsx` debería exportar **solo componentes** para que Fast Refresh conserve el estado al guardar. El contexto (`AuthContext.js`) y el hook (`useAuth.js`) no son componentes, así que van aparte.

---

## Paso 1: el login simulado (`services/api.js`)

```js
export function iniciarSesion(email, password) {
  // ... resuelve { id, nombre, email, rol, token } o rechaza con Error('Credenciales inválidas')
}
```

**Qué explicar:**

- La lista de usuarios con la contraseña está en el código **solo porque no hay backend**. En una app real, el servidor compara contra un hash y el frontend nunca ve las contraseñas de nadie.
- La función **rechaza** la promesa cuando las credenciales fallan. Con `fetch` real eso no pasa solo: un 401 resuelve la promesa y hay que revisar `response.ok` (slides 21–22). Si se conecta a una API real, este es el lugar del `if (!response.ok) throw ...`.

## Paso 2: el contexto (`context/AuthContext.js`) (slides 16–17)

```js
import { createContext } from 'react'
export const AuthContext = createContext(null)
```

**Qué explicar:**

- ⚠️ `createContext` viene de **`'react'`**. React Router 8 **también** exporta un `createContext` (para su middleware, otra cosa). Si el autoimport de VS Code trae el de `'react-router'`, `AuthContext.Provider` es `undefined` y React muestra "Element type is invalid" (error #130 en producción).

## Paso 3: el `AuthProvider` (slides 20, 25 y 42)

```jsx
const [usuario, setUsuario] = useState(leerSesion)   // lectura perezosa de localStorage

useEffect(() => {
  if (usuario) localStorage.setItem(CLAVE, JSON.stringify(usuario))
  else localStorage.removeItem(CLAVE)
}, [usuario])

const login = async (email, password) => setUsuario(await iniciarSesion(email, password))
const logout = () => setUsuario(null)
const hasRole = (rol) => usuario?.rol === rol
```

**Qué explicar:**

- `useState(leerSesion)` pasa la **función**, no su resultado: se ejecuta solo en el primer render. Con `useState(null)`, el efecto vería `null` al montar y **borraría** la sesión guardada (experimento de la slide 42).
- `leerSesion` tiene `try/catch`: si alguien deja un JSON inválido en `localStorage`, la app arranca sin sesión en vez de romperse.
- `login` **no** atrapa el error: lo deja subir para que la página `Login` decida cómo mostrarlo. Es una diferencia con el PDF, que pone `error` e `isLoading` en el contexto. Las dos opciones son válidas; aquí son estado local de `Login` porque nadie más los usa (slide 11: el estado empieza local).
- `hasRole` con `?.`: sin sesión devuelve `false` sin lanzar error.

## Paso 4: `useAuth` (slide 18)

```js
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return context
}
```

**Qué explicar:**

- Sin el `if`, el error de usarlo fuera del Provider sería `Cannot destructure property 'usuario' of ... null`, que no dice qué hacer.

## Paso 5: envolver la app (`main.jsx`)

```jsx
<BrowserRouter>
  <AuthProvider>
    <App />
  </AuthProvider>
</BrowserRouter>
```

**Qué explicar:**

- El Provider envuelve a `App` **desde afuera**. Si `App` renderizara el `<AuthProvider>`, el `useAuth()` de `App` estaría fuera de su propio Provider (slide 23).
- Va dentro del router por si el provider necesita `useNavigate` en el futuro. Hoy funcionaría igual por fuera.

## Paso 6: `RutaProtegida` como ruta layout (slides 30 y 31)

```jsx
<Route element={<Layout />}>
  ...
  <Route path="login" element={<Login />} />
  <Route element={<RutaProtegida rol="admin" />}>
    <Route path="admin" element={<Admin onCrear={agregarEvento} />} />
    <Route path="eventos/:id/editar" element={<EditarEvento ... />} />
  </Route>
</Route>
```

```jsx
if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />
if (rol && !hasRole(rol)) return /* Hero "Acceso restringido" */
return <Outlet />
```

**Qué explicar:**

- Es el mismo mecanismo de `Layout`: una ruta padre **sin `path`** no cambia la URL; pinta a la hija en su `<Outlet />`. `Layout` aporta header y footer; `RutaProtegida` aporta un control de acceso. Están **anidadas**, así que el header sigue visible en "Acceso restringido".
- `replace`: la URL protegida no queda en el historial. Sin él, "atrás" desde el login volvería a `/admin`, que redirige otra vez al login.
- `state.desde`: viaja con la navegación sin aparecer en la URL. `Login` lo usa para volver.
- Sin rol, mostramos el aviso **en la misma URL** (no redirigimos): así el usuario ve por qué no puede entrar.

## Paso 7: `Login` y "Salir"

`Login.jsx`:

```jsx
const destino = location.state?.desde ?? '/'
if (usuario) return <Navigate to={destino} replace />   // ya hay sesión
// submit:
await login(email, password)
navigate(destino, { replace: true })
```

`Header.jsx`:

```jsx
const salir = () => {
  navigate('/')
  startTransition(() => logout())
}
```

**Qué explicar:**

- `<Navigate>` se usa al **renderizar** (decisión por condición). `navigate()` se usa en **eventos** (después del submit).
- **La trampa de "Salir"** (la encontramos al probar la rama): con `logout(); navigate('/')` a secas, salir desde `/admin` terminaba en **`/login`**. `BrowserRouter` cambia la URL dentro de `startTransition` (es una actualización "no urgente": `node_modules/react-router/dist/development/lib/dom/lib.js`), pero `setUsuario(null)` es urgente. React pinta primero "sin usuario" **con la URL vieja**, `RutaProtegida` ve `/admin` sin sesión y redirige al login, y la navegación a `/` se pierde. Con `logout` también dentro de `startTransition`, React aplica los dos cambios juntos. Es una buena demo para la clase sobre cómo React agrupa actualizaciones.

## Paso 8: autorización en la interfaz (slides 27 y 44)

```jsx
{hasRole('admin') && <li><NavLink to="/admin">Agregar evento</NavLink></li>}
{hasRole('admin') && <Link to={`/eventos/${evento.id}/editar`} replace>Editar evento</Link>}
```

**Qué explicar:**

- Ocultar un botón es **experiencia de usuario**, no seguridad. Por eso las rutas además están protegidas. Y aun así, quien tenga la URL de la API puede llamarla directamente: **la protección real es el servidor validando el token**. Con la API simulada (o con MockAPI) no existe esa validación; decirlo explícitamente.
- Demo: DevTools → Application → Local Storage → editar `auth_user` y cambiar `"rol":"usuario"` por `"admin"`, recargar. Ana ve "Agregar evento". El frontend se deja engañar (slide 44).

---

## Verificación

1. Sin sesión: el menú dice "Inicio · Ingresar"; el detalle de un evento **no** tiene "Editar evento".
2. Escribir `/admin` en la barra → `/login`. Ingresar con `admin@cartelera.co` / `1234` → de vuelta en `/admin`.
3. Contraseña incorrecta → "Credenciales inválidas" y el formulario sigue ahí.
4. Después de ingresar, "atrás" **no** regresa al login.
5. Como admin: "Agregar evento" en el menú, "Editar evento" en el detalle; editar y guardar funciona como en `clase-form-rutas`.
6. F5 en `/admin` con sesión → sigue en `/admin`.
7. "Salir" desde `/admin` o desde `/eventos/1/editar` → `/`, con el menú en "Ingresar".
8. Con `ana@cartelera.co`: `/admin` muestra "Acceso restringido" con el header visible.
9. Ir a `/login` con sesión iniciada → redirige a `/`.
10. `npm run lint` y `npm run build` sin errores.

## Errores comunes

| Síntoma | Causa | Solución |
|---|---|---|
| "Element type is invalid" / error #130 al renderizar el Provider | `createContext` importado de `'react-router'` | Importarlo de `'react'` |
| `useAuth debe usarse dentro de <AuthProvider>` | El componente está fuera del Provider (o es el mismo que lo renderiza) | `AuthProvider` en `main.jsx`, envolviendo a `App` |
| F5 cierra la sesión aunque hay `useEffect` que guarda | `useState(null)`: el efecto borra lo guardado al montar | `useState(leerSesion)` (lectura perezosa) |
| Con contraseña mala entra "Bienvenido, !" | Con `fetch` real, un 401 no rechaza la promesa | `if (!response.ok) throw new Error(...)` |
| "Salir" desde `/admin` lleva a `/login` | `logout` urgente se pinta antes que la navegación (transición) | `navigate('/')` + `startTransition(() => logout())` |
| "Atrás" después de ingresar vuelve al login | Falta `replace` en `<Navigate>` o en `navigate(destino)` | `replace` en los dos |
| `Cannot read properties of null (reading 'nombre')` en el Header | `usuario.nombre` sin comprobar sesión | Renderizado condicional: `usuario ? ... : ...` |

## Retos

1. **Mensaje del servidor:** cambiar `iniciarSesion` para que falle distinto si el email no existe y si la contraseña es incorrecta. ¿Es buena idea decírselo al usuario? (Pista: enumeración de usuarios.)
2. **Rol editor:** agregar `eva@cartelera.co` con rol `editor` que pueda **editar** pero no **crear**. ¿Conviene seguir con `hasRole` o pasar a permisos (`hasPermission('edit_content')`)?
3. **Expiración:** guardar en la sesión `expira: Date.now() + 30 * 60 * 1000` y que `leerSesion` descarte una sesión vencida.
4. **Token en las peticiones:** que `crearEvento` y `actualizarEvento` reciban el token y fallen (como un 401) si no llega. ¿Desde dónde lo obtienen sin pasar props por todos lados?
