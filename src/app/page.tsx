import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[--background]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-bold text-lg text-[--primary]">Dame una Pata</span>
          </div>
          <a 
            href="https://wa.me/595991234567" 
            target="_blank"
            className="bg-[--primary] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[--primary-light] transition"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </header>

      {/* Hero */}
      <section
        className="text-white py-20 px-4"
        style={{ background: 'linear-gradient(180deg, var(--primary) 0%, var(--primary-light) 100%)' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Rescatamos vidas, encontramos hogares 🐶🐱
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Somos una organización sin fines de lucro dedicada al rescate y adopción de perros y gatos en Paraguay.
          </p>
          <Link 
            href="/adoptar"
            className="inline-block bg-white text-[--primary] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-opacity-90 transition"
          >
            Adoptar una mascota
          </Link>
        </div>
      </section>

      {/* Forms Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">¿En qué podemos ayudarte?</h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Adoptar */}
            <Link href="/adoptar" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition group">
              <div className="text-4xl mb-4">🐶</div>
              <h3 className="text-xl font-semibold mb-2 text-[--primary]">Quiero Adoptar</h3>
              <p className="text-[--text-muted]">Completá el formulario para adoptar un perro o gato.</p>
            </Link>

            {/* Dar en adopción */}
            <Link href="/dar-adopcion" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition group">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2 text-[--primary]">Doy en Adopción</h3>
              <p className="text-[--text-muted]">¿No podés quedarte con tu mascota? Te ayudamos a encontrarle un nuevo hogar.</p>
            </Link>

            {/* Hogar temporal */}
            <Link href="/hogar-temporal" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition group">
              <div className="text-4xl mb-4">🧳</div>
              <h3 className="text-xl font-semibold mb-2 text-[--primary]">Hogar Temporal</h3>
              <p className="text-[--text-muted]">Ofrecé tu hogar temporalmente mientras encontramos su familia definitiva.</p>
            </Link>

            {/* Voluntariado */}
            <Link href="/voluntario" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition group">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2 text-[--primary]">Quiero Voluntariar</h3>
              <p className="text-[--text-muted]">Sumate al equipo para ayudar con rescates, eventos y más.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[--text] text-white py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-lg font-semibold mb-2">🐾 Dame una Pata Paraguay</p>
          <p className="opacity-70 text-sm">Rescate • Adopción • Cuidado</p>
          <p className="text-xs mt-4 opacity-50">© 2024 Dame una Pata Paraguay. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
