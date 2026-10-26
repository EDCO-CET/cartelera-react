/*
  Banner reutilizable: cada página le pasa su título y su texto.
  children = el contenido entre <Hero> y </Hero> (ej. el botón "Ver eventos").
*/
function Hero({ titulo, texto, children }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-content">
        <h2 id="hero-title">{titulo}</h2>
        {texto && <p>{texto}</p>}
        {children}
      </div>
    </section>
  )
}

export default Hero
