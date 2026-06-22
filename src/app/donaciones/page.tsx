import Link from 'next/link'

export const metadata = {
  title: 'Donaciones - Dame una Pata Paraguay',
}

const impactItems = [
  {
    amount: 'Gs. 25.000',
    title: 'Alimento por un día',
    description: 'Ayuda a cubrir comida para animales rescatados mientras esperan hogar.',
  },
  {
    amount: 'Gs. 50.000',
    title: 'Traslado o medicación básica',
    description: 'Aporta para movilidad, desparasitación o insumos veterinarios simples.',
  },
  {
    amount: 'Gs. 100.000+',
    title: 'Veterinaria y recuperación',
    description: 'Suma para consultas, estudios, castraciones o tratamientos urgentes.',
  },
]

export default function DonacionesPage() {
  const whatsappText = encodeURIComponent('Hola! Quiero hacer una donación para Dame una Pata Paraguay')

  return (
    <div className="min-h-screen bg-[--background] py-12 px-4">
      <main className="max-w-4xl mx-auto">
        <Link href="/" className="text-[--primary] hover:underline">
          ← Volver al inicio
        </Link>

        <section className="bg-white rounded-2xl shadow-sm p-6 md:p-10 mt-6">
          <div className="text-center mb-10">
            <div className="text-5xl mb-4">💛</div>
            <h1 className="text-3xl md:text-4xl font-bold text-[--primary] mb-4">
              Doná y ayudanos a salvar más vidas
            </h1>
            <p className="text-[--text-muted] text-lg max-w-2xl mx-auto">
              Cada aporte ayuda con alimento, atención veterinaria, traslados, castraciones y recuperación de perros y gatos rescatados.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {impactItems.map((item) => (
              <article key={item.amount} className="border rounded-xl p-5 bg-[--background]">
                <p className="text-sm font-semibold text-[--primary] mb-2">{item.amount}</p>
                <h2 className="font-bold mb-2">{item.title}</h2>
                <p className="text-sm text-[--text-muted]">{item.description}</p>
              </article>
            ))}
          </div>

          <section className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="border rounded-xl p-6">
              <h2 className="text-xl font-bold text-[--primary] mb-4">Transferencia bancaria</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-[--text-muted]">Entidad</dt>
                  <dd className="font-medium">Configurar entidad bancaria</dd>
                </div>
                <div>
                  <dt className="text-[--text-muted]">Alias / Cuenta</dt>
                  <dd className="font-mono break-all">configurar-alias</dd>
                </div>
                <div>
                  <dt className="text-[--text-muted]">Titular</dt>
                  <dd className="font-medium">Dame una Pata Paraguay</dd>
                </div>
              </dl>
              <p className="text-xs text-[--text-muted] mt-4">
                Estos datos son placeholders para completar con la información oficial antes de publicar.
              </p>
            </div>

            <div className="border rounded-xl p-6">
              <h2 className="text-xl font-bold text-[--primary] mb-4">Comprobante por WhatsApp</h2>
              <p className="text-[--text-muted] mb-5">
                Después de donar, podés enviar el comprobante para que el equipo lo registre y agradezca tu ayuda.
              </p>
              <a
                href={`https://wa.me/595991234567?text=${whatsappText}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-[--primary] text-white px-6 py-3 rounded-lg font-medium hover:bg-[--primary-light] transition"
              >
                Enviar comprobante
              </a>
            </div>
          </section>

          <section className="bg-[--primary] text-white rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold mb-3">También podés ayudar compartiendo</h2>
            <p className="opacity-90 mb-5">
              Si no podés donar ahora, compartir la página también ayuda a que más personas conozcan los rescates.
            </p>
            <Link
              href="/adoptar"
              className="inline-block bg-white text-[--primary] px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition"
            >
              Ver mascotas para adoptar
            </Link>
          </section>
        </section>
      </main>
    </div>
  )
}
