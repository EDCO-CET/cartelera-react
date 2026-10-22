# Clase form: agregar evento y contacto (formularios controlados + API simulada)

**Rama:** `clase-form` · **Viene de:** `clase-14` · **Presentación:** `Clase 15/clase-15-eventos-y-formularios-en-react-presentacion-interactiva.html`

## Objetivo

Aplicar en la cartelera lo de la presentación de eventos y formularios:

- Dos formularios **controlados**: **Agregar evento** y **Contacto**.
- Validación en los tres momentos: al **perder el foco** (`onBlur`), **en vivo** una vez tocado el campo (`onChange`) y al **enviar** (`onSubmit`).
- Envío **asíncrono** a una API **simulada con `setTimeout`**: `isSubmitting`, botón deshabilitado, `try / catch / finally`.
- Mensajes de éxito y de error, y errores accesibles por campo (`aria-invalid`, `aria-describedby`).

No se conecta a ningún servidor: `src/services/api.js` devuelve promesas que se resuelven en 1,2 s.

```bash
git switch clase-form
npm install
npm run dev
```

> Cambios respecto a `clase-14`: `git diff clase-14 clase-form -- src`

---

## Archivos nuevos

| Archivo | Para qué |
|---|---|
| `src/services/api.js` | API simulada: `crearEvento()` y `enviarContacto()` con `setTimeout` |
| `src/utils/validaciones.js` | `validateEmail`, `validateTelefono`, `sinErrores` (JS puro) |
| `src/constants.js` | Opciones de los `<select>`: `CATEGORIAS`, `ASUNTOS` |
| `src/components/FormularioEvento.jsx` | Formulario para agregar un evento a la cartelera |
| `src/components/FormularioContacto.jsx` | Formulario de contacto |

Cambios en los archivos existentes:

- **`App.jsx`:** `eventos` pasa a ser estado y se agregan las secciones `#admin` y `#contact`.
- **`Header.jsx`:** se agregan los enlaces a esas secciones.
- **`styles.css`:** se agregan al final `.form-error`, `[aria-invalid]` y `fieldset:disabled`.

---

## Paso 1: la API simulada (`services/api.js`)

```js
function simularPeticion(respuesta, fallar) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fallar) reject(new Error('La API respondió 500'))
      else resolve(respuesta)
    }, DEMORA_MS)
  })
}

export function crearEvento(evento) {
  return simularPeticion({ ...evento, id: Date.now() }, debeFallar(evento.titulo))
}
```

**Qué explicar:**

- Es una función que devuelve una **Promesa**, igual que `fetch`. El componente usa `await crearEvento(...)` y no sabe si detrás hay un servidor real.
- Para probar el `catch` sin internet: si el **título** del evento (o el **email** del contacto) contiene la palabra **"error"**, la promesa se rechaza.
- Cuando se conecte MockAPI, solo cambia el cuerpo de estas funciones, no los componentes.

## Paso 2: los eventos pasan a ser estado (`App.jsx`)

```jsx
const [eventos, setEventos] = useState(eventosIniciales)

const agregarEvento = (evento) => {
  setEventos((anteriores) => [...anteriores, evento])
}

<FormularioEvento onCrear={agregarEvento} />
```

**Qué explicar:** en la clase 14 `eventos` era una constante importada del JSON. Para que una tarjeta nueva aparezca, la lista tiene que ser **estado**. El formulario no conoce la lista: avisa con `onCrear` y el padre decide.

## Paso 3: estado y validación del formulario (`FormularioEvento.jsx`)

Mismos nombres que en la presentación:

```jsx
const [formData, setFormData] = useState(VACIO)        // lo que escribe el usuario
const [errors, setErrors] = useState({})               // un mensaje por campo
const [touched, setTouched] = useState({})             // campos ya visitados
const [isSubmitting, setIsSubmitting] = useState(false)
const [mensaje, setMensaje] = useState(null)           // { texto, tipo }
```

`validateForm(formData)` vive **fuera** del componente: es una función pura que devuelve `{ campo: 'mensaje' }`.

**Qué explicar:**

- `VACIO` define **todos** los campos (`''` o `false`) para que los inputs sean controlados desde el primer render.
- Los mensajes dicen cómo corregir: "Mínimo 10 caracteres (llevas 4)", no "Error".

## Paso 4: los tres momentos de validación

```jsx
// Solo se muestran los errores de campos tocados
const actualizarErrores = (datos, tocados) => { ... }

const handleChange = (event) => {
  const { name, value, type, checked } = event.target
  const nuevo = { ...formData, [name]: type === 'checkbox' ? checked : value }
  setFormData(nuevo)
  if (touched[name]) actualizarErrores(nuevo, touched)    // en vivo, si ya lo tocó
}

const handleBlur = (event) => { ... }                     // al salir del campo
```

Y en `handleSubmit` se valida **todo** y se marcan todos los campos como tocados.

**Qué explicar:**

- Al entrar y salir de "Título" sin escribir, aparece **solo** ese error.
- Después de tocar el campo, el error se actualiza **mientras se escribe** y desaparece al corregir.
- En `handleChange` se arma `nuevo` antes de llamar a `setFormData`, porque hay que validar con el valor **nuevo**. El estado no cambia hasta el siguiente render.

## Paso 5: el envío asíncrono

```jsx
const handleSubmit = async (event) => {
  event.preventDefault()
  const formErrors = validateForm(formData)
  setErrors(formErrors)
  if (!sinErrores(formErrors)) return ...

  setIsSubmitting(true)
  try {
    const creado = await crearEvento({ ...formData, precio: Number(formData.precio), ... })
    onCrear(creado)
    setFormData(VACIO)
    setMensaje({ texto: `"${creado.titulo}" se publicó en la cartelera.`, tipo: 'ok' })
  } catch (error) {
    setMensaje({ texto: 'No se pudo publicar el evento. Intenta de nuevo.', tipo: 'error' })
  } finally {
    setIsSubmitting(false)
  }
}
```

En el JSX:

```jsx
<fieldset className="form-group" disabled={isSubmitting}>  {/* bloquea TODOS los campos */}
...
<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Publicando...' : 'Agregar evento'}
</button>
```

**Qué explicar:**

- Es el mismo flujo del Taller 2 (`ocupar(boton)` → `try` → `finally`), ahora con estado.
- `<fieldset disabled>` deshabilita de una vez todos los inputs de su interior.
- Si la "API" falla, **no** se limpia el formulario: el usuario reintenta sin volver a escribir.
- Los textos se convierten a número (`Number(...)`) antes de enviar.

## Paso 6: accesibilidad por campo

```jsx
const propsDe = (name) => ({
  id: `ev-${name}`, name, value: formData[name],
  onChange: handleChange, onBlur: handleBlur,
  'aria-invalid': Boolean(errors[name]),
  'aria-describedby': errors[name] ? `ev-${name}-error` : undefined,
})

<label htmlFor="ev-titulo">Título</label>
<input type="text" {...propsDe('titulo')} />
{mostrarError('titulo')}
```

`mostrarError` es una **función que devuelve JSX**, no un componente: un componente definido dentro de otro se vuelve a montar en cada render y el input pierde el foco.

## Paso 7: el formulario de contacto (`FormularioContacto.jsx`)

Es el mismo patrón, más tres ideas nuevas:

| Idea | Código |
|---|---|
| **Formateo dinámico**: el celular solo acepta dígitos (máx. 10) | `if (name === 'telefono') valor = value.replace(/\D/g, '').slice(0, 10)` |
| **Campo opcional**: se valida solo si tiene valor | `if (formData.telefono && !validateTelefono(...))` |
| **Checkbox obligatorio**: se valida apenas cambia (no tiene `blur` útil) | `const tocados = type === 'checkbox' ? {...touched, [name]: true} : touched` |

Al enviar se muestra un número de radicado simulado y se limpia el formulario.

---

## Verificación

**Agregar evento**

- [ ] Al entrar y salir de "Título" sin escribir, solo ese campo muestra el error.
- [ ] Al pulsar **Agregar evento** con todo vacío aparecen 9 errores y "Revisa los campos marcados en rojo.".
- [ ] Con datos válidos, el botón dice "Publicando..." y los campos se deshabilitan; ~1,2 s después aparece una **tarjeta nueva** en la lista, el formulario queda vacío y el mensaje sale en verde.
- [ ] Con el título "error de prueba", sale el mensaje rojo, **no** se agrega la tarjeta y los datos siguen en el formulario.

**Contacto**

- [ ] Al escribir `300-12a3 4567999` en el celular, queda `3001234567`.
- [ ] Al enviar vacío salen 5 errores (el celular es opcional).
- [ ] Con un celular de 5 dígitos aparece el error "llevas 5"; si se borra, el error desaparece.
- [ ] Con datos válidos, el botón dice "Enviando..." y luego aparece "¡Gracias, Ana! ... Radicado #NNNNN".
- [ ] Con un email que contenga "error", sale el mensaje de fallo.

**Ejemplo de datos válidos para la demo:** título `Cine al parque`, categoría Música, fecha `Domingo 1 de noviembre, 5 pm`, lugar `Parque de la 93`, precio `0`, cupos `20`, imagen `/img/festival.jpg`, alt `Pantalla gigante en un parque`, descripción `Proyección de clásicos al aire libre`.

## Errores comunes

| Síntoma | Causa | Solución |
|---|---|---|
| Al escribir se borran los otros campos | `setFormData({ [name]: value })` sin spread | `{ ...formData, [name]: value }` |
| `A component is changing an uncontrolled input to be controlled` | Falta un campo en `VACIO` | Definir todos los campos |
| El error usa el valor anterior | Se validó con `formData` justo después de `setFormData` | Validar con el objeto `nuevo` |
| Doble envío con doble clic | El botón no se deshabilita | `disabled={isSubmitting}` |
| La página se recarga | Falta `event.preventDefault()` | Primera línea de `handleSubmit` |
| El input pierde el foco en cada tecla | Componente definido dentro de otro componente | Usar una función que devuelve JSX (`mostrarError`) |

## Reto

1. Vista previa en vivo: mostrar un `<TarjetaEvento evento={formData} />` mientras se llena el formulario.
2. Extraer la lógica repetida de los dos formularios (`touched`, `actualizarErrores`, `handleBlur`) a un custom hook `useFormulario`.
3. Cambiar `api.js` para que haga `fetch` real a MockAPI, sin tocar los componentes.
