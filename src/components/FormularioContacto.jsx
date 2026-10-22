import { useState } from 'react'
import { ASUNTOS } from '../constants'
import { enviarContacto } from '../services/api'
import { sinErrores, validateEmail, validateTelefono } from '../utils/validaciones'

const VACIO = {
  nombre: '',
  email: '',
  telefono: '',
  asunto: '',
  mensaje: '',
  acepta: false,
}

const MAX_MENSAJE = 500

function validateForm(formData) {
  const newErrors = {}

  if (!formData.nombre.trim()) newErrors.nombre = 'Escribe tu nombre'

  if (!formData.email.trim()) newErrors.email = 'Escribe tu correo'
  else if (!validateEmail(formData.email)) newErrors.email = 'El correo debe tener @ y un dominio (ej. ana@correo.com)'

  // Opcional: solo se valida si el usuario escribió algo
  if (formData.telefono && !validateTelefono(formData.telefono)) {
    newErrors.telefono = `El celular debe tener 10 dígitos (llevas ${formData.telefono.length})`
  }

  if (!formData.asunto) newErrors.asunto = 'Elige un asunto'

  const largo = formData.mensaje.trim().length
  if (largo < 10) newErrors.mensaje = `Mínimo 10 caracteres (llevas ${largo})`
  else if (largo > MAX_MENSAJE) newErrors.mensaje = `Máximo ${MAX_MENSAJE} caracteres`

  if (!formData.acepta) newErrors.acepta = 'Debes aceptar el tratamiento de datos'

  return newErrors
}

/*
  Formulario de contacto controlado.
  Mismo patrón que FormularioEvento, más dos ideas:
  - formateo dinámico: el celular solo acepta dígitos
  - un campo opcional que se valida solo si tiene valor
*/
function FormularioContacto() {
  const [formData, setFormData] = useState(VACIO)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const actualizarErrores = (datos, tocados) => {
    const todos = validateForm(datos)
    const visibles = {}
    for (const campo in todos) {
      if (tocados[campo]) visibles[campo] = todos[campo]
    }
    setErrors(visibles)
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    let valor = type === 'checkbox' ? checked : value

    // Formateo dinámico: quitamos todo lo que no sea dígito y limitamos a 10
    if (name === 'telefono') valor = value.replace(/\D/g, '').slice(0, 10)

    const nuevo = { ...formData, [name]: valor }
    setFormData(nuevo)
    setMensaje(null)
    // El checkbox no tiene "blur" útil: lo validamos en cuanto cambia
    const tocados = type === 'checkbox' ? { ...touched, [name]: true } : touched
    if (type === 'checkbox') setTouched(tocados)
    if (tocados[name]) actualizarErrores(nuevo, tocados)
  }

  const handleBlur = (event) => {
    const tocados = { ...touched, [event.target.name]: true }
    setTouched(tocados)
    actualizarErrores(formData, tocados)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

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
      const { radicado } = await enviarContacto({
        ...formData,
        nombre: formData.nombre.trim(),
        mensaje: formData.mensaje.trim(),
      })
      setMensaje({
        texto: `¡Gracias, ${formData.nombre.trim()}! Recibimos tu mensaje. Radicado #${radicado}.`,
        tipo: 'ok',
      })
      setFormData(VACIO)
      setTouched({})
      setErrors({})
    } catch (error) {
      console.error('Error al enviar el contacto:', error)
      setMensaje({ texto: 'No pudimos enviar tu mensaje. Intenta de nuevo en unos minutos.', tipo: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const propsDe = (name) => ({
    id: `ct-${name}`,
    name,
    value: formData[name],
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `ct-${name}-error` : undefined,
  })

  const mostrarError = (name) =>
    errors[name] && <small id={`ct-${name}-error`} className="form-error">{errors[name]}</small>

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <fieldset className="form-group" disabled={isSubmitting}>
        <legend>Tus datos</legend>

        <div className="form-field">
          <label htmlFor="ct-nombre">Nombre</label>
          <input type="text" autoComplete="name" {...propsDe('nombre')} />
          {mostrarError('nombre')}
        </div>

        <div className="form-field">
          <label htmlFor="ct-email">Correo electrónico</label>
          <input type="email" autoComplete="email" {...propsDe('email')} />
          {mostrarError('email')}
        </div>

        <div className="form-field">
          <label htmlFor="ct-telefono">Celular (opcional)</label>
          <input type="tel" inputMode="numeric" autoComplete="tel" placeholder="3001234567" {...propsDe('telefono')} />
          {mostrarError('telefono')}
        </div>

        <div className="form-field">
          <label htmlFor="ct-asunto">Asunto</label>
          <select {...propsDe('asunto')}>
            <option value="">Elige un asunto</option>
            {ASUNTOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          {mostrarError('asunto')}
        </div>
      </fieldset>

      <fieldset className="form-group" disabled={isSubmitting}>
        <legend>Tu mensaje</legend>

        <div className="form-field form-field--full">
          <label htmlFor="ct-mensaje">
            Mensaje ({formData.mensaje.trim().length}/{MAX_MENSAJE})
          </label>
          <textarea rows="5" placeholder="¿En qué te podemos ayudar?" {...propsDe('mensaje')} />
          {mostrarError('mensaje')}
        </div>

        <div className="form-field form-field--full">
          <div className="form-field form-field--check">
            <input
              type="checkbox"
              id="ct-acepta"
              name="acepta"
              checked={formData.acepta}
              onChange={handleChange}
              aria-invalid={Boolean(errors.acepta)}
              aria-describedby={errors.acepta ? 'ct-acepta-error' : undefined}
            />
            <label htmlFor="ct-acepta">Acepto el tratamiento de mis datos personales</label>
          </div>
          {mostrarError('acepta')}
        </div>
      </fieldset>

      {mensaje && (
        <p className={`form-mensaje form-mensaje--${mensaje.tipo}`} role="status">
          {mensaje.texto}
        </p>
      )}

      <button className="btn btn--accent form-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  )
}

export default FormularioContacto
