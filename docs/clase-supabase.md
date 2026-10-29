# Clase Supabase + Vercel: datos reales, login real, autorización en el servidor y despliegue

**Rama:** `clase-supabase` · **Viene de:** `clase-form-auth` · **Presentación:** `Clase 22/clase-22-autorizacion-supabase-y-vercel-presentacion-interactiva.html`

## Objetivo

En `clase-form-auth` todo era simulado: los eventos salían de un JSON, el login comparaba contra una lista en el código y "solo admin" lo decidía el frontend. En esta rama:

- Los eventos viven en una tabla **Postgres de Supabase** y se ven en el **Table Editor**.
- El login es **Supabase Auth** (`signInWithPassword`). Los usuarios se ven en **Authentication > Users**.
- El rol se lee de la tabla `profiles`; nadie puede cambiárselo desde el navegador.
- **RLS** (Row Level Security) bloquea en el servidor a quien no es admin, aunque se salte la interfaz.
- `vercel.json` deja la app lista para desplegar en Vercel.

Lo que **no** cambió: los componentes. `FormularioEvento` sigue llamando a `crearEvento()` y `actualizarEvento()`; solo cambió el cuerpo de esas funciones en `services/api.js`.

```bash
git switch clase-supabase
npm install                 # nueva dependencia: @supabase/supabase-js
cp .env.example .env        # pegar URL y publishable key del proyecto
npm run dev
```

> Cambios respecto a `clase-form-auth`: `git diff clase-form-auth clase-supabase -- src`

---

## Archivos

| Archivo | Cambio |
|---|---|
| `supabase/01-schema.sql` | **Nuevo.** Tablas `eventos` (mismas columnas que el JSON) y `profiles` (rol), trigger que crea el perfil |
| `supabase/02-rls.sql` | **Nuevo.** RLS: todos leen eventos, solo admin escribe; cada quien lee su perfil |
| `supabase/03-seed.sql` | **Nuevo.** Los 6 eventos del antiguo `eventos.json` |
| `src/lib/supabase.js` | **Nuevo.** `createClient` con las variables `VITE_*` y error claro si faltan |
| `src/services/api.js` | `obtenerEventos`, `crearEvento`, `actualizarEvento`, `iniciarSesion`, `cerrarSesion`, `obtenerPerfil`, `escucharSesion` contra Supabase. `enviarContacto` sigue simulado |
| `src/context/AuthProvider.jsx` | Sin `localStorage` manual: escucha `onAuthStateChange`. Nuevo `isLoading` |
| `src/components/RutaProtegida.jsx` | Espera `isLoading` antes de decidir |
| `src/components/Header.jsx` | No pinta "Ingresar" mientras carga la sesión |
| `src/App.jsx` | Carga los eventos con `useEffect`, con estados de carga y error. Se borra `src/data/eventos.json` |
| `.env.example`, `.gitignore` | Variables del proyecto; `.env` fuera del repo |
| `vercel.json` | **Nuevo.** Rewrite a `index.html` para que F5 en `/eventos/3` no dé 404 |

---

## Paso 1: crear el proyecto y ver la data

1. supabase.com → **New project**. Anotar la contraseña de la base de datos (no se usa en el frontend).
2. **SQL Editor** → pegar y ejecutar, en orden, `01-schema.sql`, `02-rls.sql` y `03-seed.sql`.
3. **Table Editor → eventos**: ahí están las 6 filas. Se pueden editar a mano como una hoja de cálculo; los cambios se ven al recargar la app.
4. Lo mismo con SQL: `select id, titulo, precio from eventos order by id;`

## Paso 2: usuarios y roles

1. **Authentication → Users → Add user → Create new user**, con **Auto Confirm User** marcado. Crear dos: el admin y un usuario común.
2. El trigger ya les creó su fila en `profiles` con rol `usuario`: verlo en **Table Editor → profiles**.
3. Volver admin a uno (SQL Editor):

```sql
update public.profiles set rol = 'admin'
where id = (select id from auth.users where email = 'TU-ADMIN@correo.com');
```

¿Por qué no un checkbox "soy admin" en el registro? Porque cualquiera lo marcaría. El rol se asigna en el servidor.

## Paso 3: conectar React

`.env` (copiado de `.env.example`) con **Project Settings → API Keys**: la URL del proyecto y la **publishable key**.

- La publishable key **es pública**: Vite la escribe dentro del bundle y cualquiera la ve en DevTools. Lo que protege los datos es RLS.
- La **secret key** (`sb_secret_...`) **nunca** va en el frontend: se salta RLS.
- Después de editar `.env` hay que **reiniciar** `npm run dev`.

`src/lib/supabase.js` crea **un** cliente para toda la app.

## Paso 4: los datos (`services/api.js` + `App.jsx`)

```js
const { data, error } = await supabase.from('eventos').select('*').order('id')
if (error) throw error
```

- El SDK **no lanza** errores: devuelve `{ data, error }`. Por eso cada función hace `throw`.
- `insert(...).select().single()` devuelve la fila creada, con el `id` que puso Postgres.
- `update(...).eq('id', id)`: el filtro es obligatorio. Sin él, se intenta actualizar **todas** las filas.

## Paso 5: autenticación (`AuthProvider` + `api.js`)

- `signInWithPassword({ email, password })` → el SDK guarda la sesión (token) en `localStorage` y la renueva solo.
- `onAuthStateChange` avisa al cargar (sesión guardada), al entrar, al salir y al renovar. Reemplaza el `localStorage` manual de la clase anterior.
- `isLoading`: hasta que llega ese primer aviso no sabemos si hay sesión. `RutaProtegida` espera; si no, F5 en `/admin` siempre mandaría al login.
- El rol sale de `profiles` (`obtenerPerfil`), no del frontend.

## Paso 6: autorización en el servidor (RLS)

Ver `02-rls.sql`. Con la app abierta como **usuario común**, en la consola del navegador:

```js
// Pega esto en la consola: usa la misma publishable key que la app
const { supabase } = await import('/src/lib/supabase.js')
await supabase.from('eventos').insert({ titulo: 'hack', descripcion: 'x', categoria: 'x', fecha: 'x', lugar: 'x', cupos: 1, imagen: '/x', alt: 'x' })
// → error 42501: new row violates row-level security policy
await supabase.from('eventos').update({ titulo: 'hack' }).eq('id', 1).select()
// → { data: [], error: null }  ← NO hay error: RLS filtró la fila, se actualizaron 0
```

La segunda es la trampa: un `update`/`delete` bloqueado no falla, afecta 0 filas. Por eso `actualizarEvento` usa `.single()`: convierte "0 filas" en un error visible.

## Paso 7: desplegar en Vercel

1. `npm run build` en local **sin errores** (lo mismo que hará Vercel).
2. Subir el repo a GitHub (`.env` no sube: está en `.gitignore`).
3. vercel.com → **Add New → Project → Import** el repo. Vercel detecta Vite (`npm run build`, salida `dist`).
4. **Environment Variables**: `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`, antes del primer deploy. Si se agregan después, hay que hacer **Redeploy**: se leen al construir, no al ejecutar.
5. Probar F5 en `/eventos/3`: sin `vercel.json` daría 404, porque en el servidor no existe ese archivo.
6. Si se usa registro con confirmación por email: en Supabase, **Authentication → URL Configuration → Site URL** = la URL de Vercel.

---

## Verificación

- [ ] La cartelera muestra los eventos de la tabla; un cambio en el Table Editor se ve al recargar
- [ ] Sin `.env` la app muestra el error "Faltan VITE_SUPABASE_URL..." en la consola
- [ ] Contraseña incorrecta → "Credenciales inválidas"
- [ ] Admin: crea un evento y aparece como fila nueva en el Table Editor
- [ ] Admin: edita un evento y el cambio queda en la tabla
- [ ] F5 en `/admin` con sesión de admin: sigue en `/admin`
- [ ] Usuario común en `/admin` → "Acceso restringido"
- [ ] Usuario común, desde la consola: el `insert` falla con `42501` y el `update` devuelve `[]`
- [ ] "Salir" desde `/admin` → `/`
- [ ] En Vercel: la app carga, el login funciona y F5 en una ruta profunda no da 404

## Errores comunes

| Síntoma | Causa | Solución |
|---|---|---|
| `Faltan VITE_SUPABASE_URL...` | No hay `.env`, o no se reinició `npm run dev` | Copiar `.env.example` y reiniciar |
| La lista llega vacía sin error | RLS activa y sin política de `select` | Revisar la política "cualquiera lee" |
| `42501 ... row-level security` al crear | El usuario no es admin en `profiles` | `update profiles set rol='admin'...` |
| Editar "no hace nada" | `update` bloqueado por RLS = 0 filas, sin error | Usar `.select().single()` y revisar el rol |
| `Invalid login credentials` con la contraseña correcta | Usuario sin confirmar | Crearlo con **Auto Confirm**, o confirmar el email |
| F5 en `/admin` manda al login | Decidir antes de que termine `isLoading` | Esperar `isLoading` en `RutaProtegida` |
| Vercel: 404 al recargar `/eventos/3` | Falta el rewrite de SPA | `vercel.json` |
| Vercel: pantalla en blanco y error de variables | Variables no configuradas o agregadas después del build | Configurarlas y **Redeploy** |

## Retos

1. **Eliminar evento**: `eliminarEvento(id)` en `api.js` con `.delete().eq('id', id)` y un botón solo para admin en el detalle. Probar que un usuario común no puede, ni desde la consola.
2. **Registro**: página `/registro` con `supabase.auth.signUp`. ¿Qué rol recibe la cuenta nueva y por qué?
3. **Cupos**: crear una tabla `inscripciones` (evento_id, usuario_id) con RLS "cada quien ve las suyas" y un botón "Inscribirme".
4. **Preview**: crear una rama, hacer un cambio visible y abrir un PR. Ver la URL de preview que genera Vercel.
