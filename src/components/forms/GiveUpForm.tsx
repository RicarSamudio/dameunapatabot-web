'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const giveUpSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  phone: z.string().min(8, 'El teléfono es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  animalType: z.enum(['perro', 'gato']),
  breed: z.string().optional(),
  age: z.string().optional(),
  sex: z.enum(['macho', 'hembra']),
  description: z.string().min(10, 'Cuéntanos más sobre tu mascota'),
})

type GiveUpFormData = z.infer<typeof giveUpSchema>

export function GiveUpForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { register, handleSubmit, formState: { errors } } = useForm<GiveUpFormData>({
    resolver: zodResolver(giveUpSchema),
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Error al subir fotos')

      const data = await res.json()
      setUploadedPhotos(prev => [...prev, ...data.urls])
    } catch (err) {
      setUploadError('Error al subir las fotos. Intentá de nuevo.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removePhoto = (url: string) => {
    setUploadedPhotos(prev => prev.filter(p => p !== url))
  }

  const onSubmit = async (data: GiveUpFormData) => {
    setIsSubmitting(true)
    setError('')
    
    try {
      const res = await fetch('/api/forms/give-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, photos: uploadedPhotos }),
      })
      
      if (!res.ok) throw new Error('Error al enviar')
      
      const { token } = await res.json()
      router.push(`/gracias?token=${token}&type=give-up`)
    } catch (e) {
      setError('Hubo un error. Intentá de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[--primary]">Datos de contacto</h3>
        
        <div>
          <label className="block text-sm font-medium mb-1">Nombre completo *</label>
          <input {...register('name')} className="w-full p-3 border rounded-lg" placeholder="Tu nombre" />
          {errors.name && <p className="text-[--error] text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono / WhatsApp *</label>
          <input {...register('phone')} className="w-full p-3 border rounded-lg" placeholder="+595 9XX XXX XXX" />
          {errors.phone && <p className="text-[--error] text-sm mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input {...register('email')} type="email" className="w-full p-3 border rounded-lg" placeholder="tu@email.com" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[--primary]">Datos de tu mascota</h3>
        
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de animal *</label>
          <select {...register('animalType')} className="w-full p-3 border rounded-lg">
            <option value="">Seleccionar...</option>
            <option value="perro">🐶 Perro</option>
            <option value="gato">🐱 Gato</option>
          </select>
          {errors.animalType && <p className="text-[--error] text-sm mt-1">{errors.animalType.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Raza</label>
            <input {...register('breed')} className="w-full p-3 border rounded-lg" placeholder="Si se conoce" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Edad aproximada</label>
            <input {...register('age')} className="w-full p-3 border rounded-lg" placeholder="Ej: 3 años" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sexo *</label>
          <select {...register('sex')} className="w-full p-3 border rounded-lg">
            <option value="">Seleccionar...</option>
            <option value="macho">Macho</option>
            <option value="hembra">Hembra</option>
          </select>
          {errors.sex && <p className="text-[--error] text-sm mt-1">{errors.sex.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cuéntanos sobre tu mascota *</label>
          <textarea {...register('description')} rows={4} className="w-full p-3 border rounded-lg" placeholder="Personalidad, hábitos, estado de salud, vacunas..." />
          {errors.description && <p className="text-[--error] text-sm mt-1">{errors.description.message}</p>}
        </div>

        {/* Upload de fotos */}
        <div>
          <label className="block text-sm font-medium mb-1">📷 Fotos de tu mascota (opcional)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="pet-photos"
            />
            <label htmlFor="pet-photos" className="cursor-pointer">
              <div className="text-4xl mb-2">📸</div>
              <p className="text-sm text-[--text-muted]">
                {isUploading ? 'Subiendo...' : 'Hacé click para seleccionar fotos'}
              </p>
              <p className="text-xs text-[--text-muted] mt-1">Máximo 5MB por imagen</p>
            </label>
          </div>
          
          {uploadError && <p className="text-[--error] text-sm mt-1">{uploadError}</p>}
          
          {uploadedPhotos.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Fotos subidas ({uploadedPhotos.length}):</p>
              <div className="flex flex-wrap gap-2">
                {uploadedPhotos.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img 
                      src={url} 
                      alt={`Foto ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(url)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-[--error] text-center">{error}</p>}

      <button 
        type="submit" 
        disabled={isSubmitting || isUploading}
        className="w-full bg-[--primary] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[--primary-light] transition disabled:opacity-50"
      >
        {isSubmitting ? 'Enviando...' : isUploading ? 'Subiendo fotos...' : 'Enviar solicitud'}
      </button>
    </form>
  )
}
