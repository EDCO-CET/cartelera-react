import { useState } from 'react'
import { CATEGORIAS } from '../constants'
import { crearEvento } from '../services/api'
import { sinErrores } from '../utils/validaciones'

// Estado inicial: TODOS los campos definidos ('' o false) para que los inputs
// sean controlados desde el primer render
const VACIO = {
  titulo: '',
  categoria: '',
  fecha: '',
  lugar: '',
  precio: '',
  cupos: '',
  imagen: '',
  alt: '',
  descripcion: '',
  destacado: false,
}

/*
  Validación pura: recibe los datos y devuelve { campo: 'mensaje' }.
  Vive FUERA del componente porque no necesita estado ni props.
*/
function validateForm(formData) {
  const newErrors = {}
  const titulo = formData.titulo.trim()
  const descripcion = formData.descripcion.trim()

  if (!titulo) newErrors.titulo = 'El título es obligatorio'
  else if (titulo.length < 3) newErrors.titulo = 'Mínimo 3 caracteres'

  if (!formData.categoria) newErrors.categoria = 'Elige una categoría'
  if (!formData.fecha.trim()) newErrors.fecha = 'La fecha es obligatoria'
  if (!formData.lugar.trim()) newErrors.lugar = 'El lugar es obligatorio'

  // Los inputs entregan texto: '' es "vacío", no 0
  if (formData.precio === '') newErrors.precio = 'Escribe el precio (0 = entrada libre)'
  else if (Number(formData.precio) < 0) newErrors.precio = 'El precio no puede ser negativo'

  if (formData.cupos === '') newErrors.cupos = 'Los cupos son obligatorios'
  else if (!Number.isInteger(Number(formData.cupos)) || Number(formData.cupos) < 1) {
    newErrors.cupos = 'Debe ser un número entero mayor que 0'
  }

  const imagen = formData.imagen.trim()
  if (!imagen) newErrors.imagen = 'La imagen es obligatoria'
  else if (!imagen.startsWith('/') && !imagen.startsWith('http')) {
    newErrors.imagen = 'Usa una ruta que empiece por / (ej. /img/jazz.jpg) o una URL'
  }

  if (!formData.alt.trim()) newErrors.alt = 'Describe la imagen para lectores de pantalla'

  if (descripcion.length < 10) newErrors.descripcion = `Mínimo 10 caracteres (llevas ${descripcion.length})`
  else if (descripcion.length > 140) newErrors.descripcion = 'Máximo 140 caracteres'

  return newErrors
}

/*
  Formulario CONTROLADO para agregar un evento.
  Props: onCrear(evento) -> el padre decide qué hacer con el evento creado.
*/
function FormularioEvento({ onCrear }) {
  const [formData, setFormData] = useState(VACIO)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})          // campos que el usuario ya visitó
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mensaje, setMensaje] = useState(null)        // { texto, tipo: 'ok' | 'error' }

  // Solo mostramos errores de los campos tocados: nada de "obligatorio" antes de escribir
  const actualizarErrores = (datos, tocados) => {
    const todos = validateForm(datos)
    const visibles = {}
    for (const campo in todos) {
      if (tocados[campo]) visibles[campo] = todos[campo]
    }
    setErrors(visibles)
  }

  // Un solo manejador para todos los campos: usa el atributo name
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    const nuevo = { ...formData, [name]: type === 'checkbox' ? checked : value }
    setFormData(nuevo)
    setMensaje(null)
    // Validación en tiempo real, pero solo si el campo ya fue tocado
    if (touched[name]) actualizarErrores(nuevo, touched)
  }

  // Validación al perder el foco
  const handleBlur = (event) => {
    const tocados = { ...touched, [event.target.name]: true }
    setTouched(tocados)
    actualizarErrores(formData, tocados)
  }

  // Validación al enviar + llamada a la API (simulada)
  const handleSubmit = async (event) => {
    event.preventDefault()   // sin esto el navegador recarga la página

    const formErrors = validateForm(formData)
    setErrors(formErrors)
    setTouched(Object.fromEntries(Object.keys(VACIO).map((campo) => [campo, true])))
    if (!sinErrores(formErrors)) {
      setMensaje({ texto: 'Revisa los campos marcados en rojo.', tipo: 'error' })
      return
    }

    setIsSubmitting(true)
    setMensaje(null)
    try {
      // Convertimos los textos a los tipos que espera la API
      const creado = await crearEvento({
        ...formData,
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        precio: Number(formData.precio),
        cupos: Number(formData.cupos),
      })
      onCrear(creado)
      setFormData(VACIO)     // controlado: limpiar el estado limpia los inputs
      setTouched({})
      setErrors({})
      setMensaje({ texto: `"${creado.titulo}" se publicó en la cartelera.`, tipo: 'ok' })
    } catch (error) {
      console.error('Error al crear el evento:', error)
      // NO limpiamos el formulario: el usuario puede reintentar sin volver a escribir
      setMensaje({ texto: 'No se pudo publicar el evento. Intenta de nuevo.', tipo: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Props comunes de cada campo (se aplican con spread: {...propsDe('titulo')})
  const propsDe = (name) => ({
    id: `ev-${name}`,
    name,
    value: formData[name],
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `ev-${name}-error` : undefined,
  })

  // Función que devuelve JSX (no un componente): {mostrarError('titulo')}
  const mostrarError = (name) =>
    errors[name] && <small id={`ev-${name}-error`} className="form-error">{errors[name]}</small>

  return (
    // noValidate: sin globos del navegador, mostramos NUESTROS mensajes
    <form className="form" onSubmit={handleSubmit} noValidate>
      {/* fieldset disabled deshabilita TODOS los campos mientras se envía */}
      <fieldset className="form-group" disabled={isSubmitting}>
        <legend>Nuevo evento</legend>

        <div className="form-field">
          <label htmlFor="ev-titulo">Título</label>
          <input type="text" {...propsDe('titulo')} />
          {mostrarError('titulo')}
        </div>

        <div className="form-field">
          <label htmlFor="ev-categoria">Categoría</label>
          <select {...propsDe('categoria')}>
            <option value="">Elige una categoría</option>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {mostrarError('categoria')}
        </div>

        <div className="form-field">
          <label htmlFor="ev-fecha">Fecha</label>
          <input type="text" placeholder="Viernes 2 de octubre, 8 pm" {...propsDe('fecha')} />
          {mostrarError('fecha')}
        </div>

        <div className="form-field">
          <label htmlFor="ev-lugar">Lugar</label>
          <input type="text" {...propsDe('lugar')} />
          {mostrarError('lugar')}
        </div>

        <div className="form-field">
          <label htmlFor="ev-precio">Precio (0 = entrada libre)</label>
          <input type="number" min="0" step="500" {...propsDe('precio')} />
          {mostrarError('precio')}
        </div>

        <div className="form-field">
          <label htmlFor="ev-cupos">Cupos</label>
          <input type="number" min="1" step="1" {...propsDe('cupos')} />
          {mostrarError('cupos')}
        </div>

        <div className="form-field">
          <label htmlFor="ev-imagen">Imagen (ruta o URL)</label>
          <input type="text" placeholder="/img/jazz.jpg" {...propsDe('imagen')} />
          {mostrarError('imagen')}
        </div>

        <div className="form-field">
          <label htmlFor="ev-alt">Texto alternativo de la imagen</label>
          <input type="text" {...propsDe('alt')} />
          {mostrarError('alt')}
        </div>

        <div className="form-field form-field--full">
          {/* Contador en vivo: posible porque el valor está en el estado */}
          <label htmlFor="ev-descripcion">
            Descripción ({formData.descripcion.trim().length}/140)
          </label>
          <textarea rows="3" {...propsDe('descripcion')} />
          {mostrarError('descripcion')}
        </div>

        <div className="form-field form-field--check">
          {/* checkbox: se controla con checked, no con value */}
          <input
            type="checkbox"
            id="ev-destacado"
            name="destacado"
            checked={formData.destacado}
            onChange={handleChange}
          />
          <label htmlFor="ev-destacado">Mostrar como evento destacado</label>
        </div>
      </fieldset>

      {mensaje && (
        <p className={`form-mensaje form-mensaje--${mensaje.tipo}`} role="status">
          {mensaje.texto}
        </p>
      )}

      <div className="form-botones">
        <button
          className="btn btn--secondary"
          type="button"
          disabled={isSubmitting}
          onClick={() => {
            setFormData(VACIO)
            setErrors({})
            setTouched({})
            setMensaje(null)
          }}
        >
          Limpiar
        </button>
        {/* disabled evita el doble envío; el texto avisa que algo está pasando */}
        <button className="btn btn--accent form-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Publicando...' : 'Agregar evento'}
        </button>
      </div>
    </form>
  )
}

export default FormularioEvento
