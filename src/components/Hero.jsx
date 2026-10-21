// Banner de bienvenida: mismo HTML del proyecto en JS, con dos cambios de JSX:
// class -> className y aria-labelledby se escribe igual (los aria-* y data-* no cambian)
function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-content">
        <h2 id="hero-title">Bienvenido a la cartelera</h2>
        <p>
          Conciertos, festivales, talleres y encuentros en Bogotá. Encuentra tu
          próximo plan y compra tu entrada en un solo lugar.
        </p>
        <a className="btn btn--accent hero-cta" href="#events">Ver eventos</a>
      </div>
    </section>
  )
}

export default Hero
