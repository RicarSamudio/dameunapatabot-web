'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const volunteerAreas = [
  { value: 'rescate', label: 'Rescates y traslados' },
  { value: 'eventos', label: 'Eventos y ferias' },
  { value: 'redes', label: 'Redes sociales / difusión' },
  { value: 'fotografia', label: 'Fotos o videos' },
  { value: 'administracion', label: 'Gestión administrativa' },
]

const volunteerSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  phone: z.string().min(8, 'El teléfono es requerido'),
  email: z.string().email('Email inválido'),
  areas: z.array(z.string()).min(1, 'Elegí al menos un área'),
  availability: z.string().min(2, 'Indicá tu disponibilidad'),
  experience: z.string().min(5, 'Contanos brevemente tu experiencia'),
  comments: z.string().optional(),
})

type VolunteerFormData = z.infer<typeof volunteerSchema>

export function VolunteerForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      areas: [],
      comments: '',
    },
  })

  const onSubmit = async (data: VolunteerFormData) => {
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/forms/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Error al enviar')

      const { token } = await res.json()
      router.push(`/gracias?token=${token}&type=volunteer`)
    } catch {
      setError('Hubo un error. Intentá de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[--primary]">Datos de contacto</h3>

        <div>
          <label className="block text-sm font-medium mb-1">Nombre completo *</label>
          <input {...register('name')} className="w-full p-3 border rounded-lg" placeholder="Tu nombre" />
          {errors.name && <p className="text-[--error] text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono / WhatsApp *</label>
          <input {...register('phone')} inputMode="tel" className="w-full p-3 border rounded-lg" placeholder="+595 9XX XXX XXX" />
          {errors.phone && <p className="text-[--error] text-sm mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input {...register('email')} type="email" className="w-full p-3 border rounded-lg" placeholder="tu@email.com" />
          {errors.email && <p className="text-[--error] text-sm mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[--primary]">Cómo querés ayudar</h3>

        <fieldset>
          <legend className="block text-sm font-medium mb-2">Áreas de interés *</legend>
          <div className="space-y-2">
            {volunteerAreas.map((area) => (
              <label key={area.value} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                <input type="checkbox" value={area.value} {...register('areas')} className="h-4 w-4" />
                <span>{area.label}</span>
              </label>
            ))}
          </div>
          {errors.areas && <p className="text-[--error] text-sm mt-1">{errors.areas.message}</p>}
        </fieldset>

        <div>
          <label className="block text-sm font-medium mb-1">Disponibilidad *</label>
          <input {...register('availability')} className="w-full p-3 border rounded-lg" placeholder="Ej: sábados, noches, 2 veces al mes" />
          {errors.availability && <p className="text-[--error] text-sm mt-1">{errors.availability.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Experiencia o habilidades *</label>
          <textarea {...register('experience')} rows={4} className="w-full p-3 border rounded-lg" placeholder="Contanos si tenés movilidad, experiencia con animales, diseño, redes, organización, etc." />
          {errors.experience && <p className="text-[--error] text-sm mt-1">{errors.experience.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Comentarios adicionales</label>
          <textarea {...register('comments')} rows={3} className="w-full p-3 border rounded-lg" placeholder="Zona, horarios, restricciones o cualquier detalle útil" />
        </div>
      </div>

      {error && <p className="text-[--error] text-center">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[--primary] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[--primary-light] transition disabled:opacity-50"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar solicitud de voluntariado'}
      </button>
    </form>
  )
}
