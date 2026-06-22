'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const fosterSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  phone: z.string().min(8, 'El teléfono es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  housingType: z.string().min(2, 'Contanos qué tipo de vivienda tenés'),
  hasPets: z.string().min(1, 'Indicá si tenés mascotas'),
  hasChildren: z.string().min(1, 'Indicá si hay niños en casa'),
  availability: z.string().min(2, 'Indicá tu disponibilidad'),
  experience: z.string().min(5, 'Contanos brevemente tu experiencia'),
  comments: z.string().optional(),
})

type FosterFormData = z.infer<typeof fosterSchema>

export function FosterForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FosterFormData>({
    resolver: zodResolver(fosterSchema),
    defaultValues: {
      email: '',
      comments: '',
    },
  })

  const onSubmit = async (data: FosterFormData) => {
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/forms/foster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Error al enviar')

      const { token } = await res.json()
      router.push(`/gracias?token=${token}&type=foster`)
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
          <label className="block text-sm font-medium mb-1">Email</label>
          <input {...register('email')} type="email" className="w-full p-3 border rounded-lg" placeholder="tu@email.com" />
          {errors.email && <p className="text-[--error] text-sm mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[--primary]">Sobre tu hogar</h3>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo de vivienda *</label>
          <input {...register('housingType')} className="w-full p-3 border rounded-lg" placeholder="Casa con patio, departamento, dúplex..." />
          {errors.housingType && <p className="text-[--error] text-sm mt-1">{errors.housingType.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">¿Tenés mascotas actualmente? *</label>
          <textarea {...register('hasPets')} rows={3} className="w-full p-3 border rounded-lg" placeholder="Contanos especie, cantidad, vacunas/castración si aplica" />
          {errors.hasPets && <p className="text-[--error] text-sm mt-1">{errors.hasPets.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">¿Hay niños en casa? *</label>
          <input {...register('hasChildren')} className="w-full p-3 border rounded-lg" placeholder="No / Sí, edades aproximadas" />
          {errors.hasChildren && <p className="text-[--error] text-sm mt-1">{errors.hasChildren.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Disponibilidad *</label>
          <input {...register('availability')} className="w-full p-3 border rounded-lg" placeholder="Ej: 2 semanas, 1 mes, hasta adopción" />
          {errors.availability && <p className="text-[--error] text-sm mt-1">{errors.availability.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Experiencia cuidando animales *</label>
          <textarea {...register('experience')} rows={4} className="w-full p-3 border rounded-lg" placeholder="Contanos si ya cuidaste rescatados, medicación, cachorros, gatos, etc." />
          {errors.experience && <p className="text-[--error] text-sm mt-1">{errors.experience.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Comentarios adicionales</label>
          <textarea {...register('comments')} rows={3} className="w-full p-3 border rounded-lg" placeholder="Preferencias, restricciones, zona, horarios..." />
        </div>
      </div>

      {error && <p className="text-[--error] text-center">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[--primary] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[--primary-light] transition disabled:opacity-50"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar solicitud de hogar temporal'}
      </button>
    </form>
  )
}
