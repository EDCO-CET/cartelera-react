# Cartelera de eventos — versión React

La misma cartelera del proyecto en JavaScript (`cartelera-js`), reconstruida en React con Vite y **los mismos estilos** (`src/styles.css`).

```bash
npm install
npm run dev      # http://localhost:5173
```

## Ramas (una por clase)

| Rama | Tema | Guía |
|---|---|---|
| `clase-14` | Componentes, JSX, props, lista con `map` y datos de un JSON | `docs/clase-14-componentes-y-map.md` |
| `clase-form` (desde `clase-14`) | Formularios controlados: agregar evento y contacto, validación y API simulada con `setTimeout` | `docs/clase-form-formularios.md` |
| `clase-form-rutas` (desde `clase-form`) | React Router: Inicio (`/`), Admin (`/admin`), detalle (`/eventos/:id`) y edición (`/eventos/:id/editar`), layout con `Outlet`, `NavLink`, `useParams`, `useNavigate` y 404 | `docs/clase-form-rutas.md` |
| `clase-form-auth` (desde `clase-form-rutas`) | Context API: login simulado, `AuthProvider` + `useAuth`, sesión en `localStorage`, `/admin` y `/eventos/:id/editar` solo para admin con `RutaProtegida` | `docs/clase-form-auth.md` |

Cada rama parte de la anterior: `git switch clase-XX` deja el proyecto como queda al final de esa clase.
