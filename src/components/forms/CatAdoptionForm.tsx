'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const adoptionSchema = z.object({
  // Datos personales
  nombreCompleto: z.string().min(2, 'El nombre es requerido'),
  ci: z.string().min(5, 'La CI es requerida'),
  direccionCiudad: z.string().min(5, 'La dirección es requerida'),
  edad: z.string(),
  numeroCelular: z.string().min(8, 'El celular es requerido'),
  email: z.string().email('El email es inválido'),
  instagramFacebook: z.string().optional(),

  // Convivencia
  conviviraConNiñosAnimales: z.string().min(10, 'Indica si convivirá con niños/animales'),
  primeraVezAdoptaGato: z.string().min(10, 'Indica si es primera vez'),
  tienePatio: z.string().min(10, 'Indica si tiene patio'),

  // Adopción
  porqueAdoptar: z.string().min(20, 'Cuéntanos por qué querés adoptar'),
  puedePagarVeterinario: z.string().min(10, 'Indica si puede pagar veterinario'),
  dondeVivira: z.string().min(10, 'Indica dónde vivirá'),
  dondeDormiria: z.string().min(10, 'Indica dónde dormiría'),

  // Compromisos
  seComprometeCastrar: z.boolean(),
  seComprometeReportes: z.boolean(),
  seComprometeEntregarVuelta: z.boolean(),

  // Aporte
  aporta100milGs: z.string(),

  // Mascota de interés
  nombreMascotaInteres: z.string().min(2, 'Indica el nombre del gato de interés'),
})

type AdoptionFormData = z.infer<typeof adoptionSchema>

export function CatAdoptionForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<AdoptionFormData>({
    resolver: zodResolver(adoptionSchema),
    defaultValues: {
      seComprometeCastrar: false,
      seComprometeReportes: false,
      seComprometeEntregarVuelta: false,
    }
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

  const onSubmit = async (data: AdoptionFormData) => {
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/forms/adoption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type: 'CAT', photos: uploadedPhotos }),
      })

      if (!res.ok) throw new Error('Error al enviar')

      const { token } = await res.json()
      router.push(`/gracias?token=${token}&type=adoption`)
    } catch (e) {
      setError('Hubo un error. Intentá de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Datos Personales */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[--primary]">📝 Datos Personales</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre completo *</label>
            <input {...register('nombreCompleto')} className="w-full p-3 border rounded-lg" />
            {errors.nombreCompleto && <p className="text-[--error] text-sm mt-1">{errors.nombreCompleto.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">C.I. *</label>
            <input {...register('ci')} className="w-full p-3 border rounded-lg" />
            {errors.ci && <p className="text-[--error] text-sm mt-1">{errors.ci.message}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Dirección, ciudad *</label>
            <input {...register('direccionCiudad')} className="w-full p-3 border rounded-lg" />
            {errors.direccionCiudad && <p className="text-[--error] text-sm mt-1">{errors.direccionCiudad.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Edad (si sos menor de edad necesitás autorización del mayor)</label>
            <input {...register('edad')} className="w-full p-3 border rounded-lg" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Número de celular *</label>
            <input {...register('numeroCelular')} className="w-full p-3 border rounded-lg" />
            {errors.numeroCelular && <p className="text-[--error] text-sm mt-1">{errors.numeroCelular.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input type="email" {...register('email')} className="w-full p-3 border rounded-lg" />
            {errors.email && <p className="text-[--error] text-sm mt-1">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Instagram / Facebook</label>
            <input {...register('instagramFacebook')} className="w-full p-3 border rounded-lg" />
          </div>
        </div>
      </div>

      {/* Convivencia */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[--primary]">🏠 Convivencia</h3>

        <div>
          <label className="block text-sm font-medium mb-1">¿Convivirá el gato/a con niños u otros animales? *</label>
          <input {...register('conviviraConNiñosAnimales')} className="w-full p-3 border rounded-lg" />
          {errors.conviviraConNiñosAnimales && <p className="text-[--error] text-sm mt-1">{errors.conviviraConNiñosAnimales.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">¿Es la primera vez que adoptás un gato/a? *</label>
          <input {...register('primeraVezAdoptaGato')} className="w-full p-3 border rounded-lg" />
          {errors.primeraVezAdoptaGato && <p className="text-[--error] text-sm mt-1">{errors.primeraVezAdoptaGato.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">¿Viviría en casa o departamento? ¿Nos podrías enviar fotos? *</label>
          <input {...register('dondeVivira')} className="w-full p-3 border rounded-lg" />
          {errors.dondeVivira && <p className="text-[--error] text-sm mt-1">{errors.dondeVivira.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">¿Tenés patio? *</label>
          <input {...register('tienePatio')} className="w-full p-3 border rounded-lg" />
          {errors.tienePatio && <p className="text-[--error] text-sm mt-1">{errors.tienePatio.message}</p>}
        </div>

        {/* Upload de fotos */}
        <div>
          <label className="block text-sm font-medium mb-1">📷 Fotos de tu vivienda (opcional)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="housing-photos"
            />
            <label htmlFor="housing-photos" className="cursor-pointer">
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

      {/* Sobre la Adopción */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[--primary]">❤️ Sobre la Adopción</h3>

        <div>
          <label className="block text-sm font-medium mb-1">¿Por qué quieres adoptar? *</label>
          <textarea {...register('porqueAdoptar')} rows={3} className="w-full p-3 border rounded-lg" />
          {errors.porqueAdoptar && <p className="text-[--error] text-sm mt-1">{errors.porqueAdoptar.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">¿Podrás pagar el veterinario? ¿Y encargarte de sus consultas y/o vacunas cuando las requiera? *</label>
          <input {...register('puedePagarVeterinario')} className="w-full p-3 border rounded-lg" />
          {errors.puedePagarVeterinario && <p className="text-[--error] text-sm mt-1">{errors.puedePagarVeterinario.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">¿En dónde dormiría? *</label>
          <input {...register('dondeDormiria')} className="w-full p-3 border rounded-lg" />
          {errors.dondeDormiria && <p className="text-[--error] text-sm mt-1">{errors.dondeDormiria.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">¿Cuál es el nombre del gato/a que te interesa? *</label>
          <input {...register('nombreMascotaInteres')} className="w-full p-3 border rounded-lg" placeholder="Nombre del animal" />
          {errors.nombreMascotaInteres && <p className="text-[--error] text-sm mt-1">{errors.nombreMascotaInteres.message}</p>}
        </div>
      </div>

      {/* Compromisos */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[--primary]">📋 Compromisos</h3>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" {...register('seComprometeCastrar')} className="w-5 h-5 mt-0.5" />
            <span className="text-sm">En caso de que el gato/a todavía sea muy pequeño para su castración, ¿te comprometes a llevarlo a castrar apenas esté apto/a? (requisito obligatorio) *</span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" {...register('seComprometeReportes')} className="w-5 h-5 mt-0.5" />
            <span className="text-sm">Te comprometes a enviarnos regularmente reportes (fotos, vídeos) de él/ella para saber que está bien cuidado/a *</span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" {...register('seComprometeEntregarVuelta')} className="w-5 h-5 mt-0.5" />
            <span className="text-sm">En caso de que ya no le quieran/puedan tener, ¿se comprometen a avisarnos y entregarnos el gato de vuelta? (nosotras nos encargaremos de buscarle un nuevo adoptante responsable) *</span>
          </label>
        </div>

        <div className="bg-[--background] rounded-lg p-4 mt-4">
          <p className="text-sm text-[--text-muted]">
            <strong>Recordatorio:</strong> Siempre es importante que el gato/a las primeras 3-4 semanas se mantenga dentro de la casa o departamento las 24hs, con su caja de arena sanitaria, comida y agua siempre dentro también.
          </p>
        </div>
      </div>

      {/* Aporte */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[--primary]">💰 Aporte</h3>
        <div>
          <label className="block text-sm font-medium mb-1">¿Podría aportar 100 mil Gs a la fundación para cubrir costos de vacuna, antiparasitario, castración, etc.? *</label>
          <select {...register('aporta100milGs')} className="w-full p-3 border rounded-lg">
            <option value="">Seleccionar...</option>
            <option value="si">Sí, puedo aportar</option>
            <option value="no">No puedo aportar</option>
          </select>
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
