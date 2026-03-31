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

  // Vivienda y familia
  ConviveConNiñosAnimales: z.string().min(10, 'Indica si convivirá con niños/animales'),
  quienesVivenFrecuentan: z.string().min(10, 'Indica quiénes viven en casa'),
  otrasMascotas: z.string().optional(),
  tienePatioCerrado: z.string().min(10, 'Indica si tenés patio cerrado'),

  // Adopción
  porqueAdoptar: z.string().min(20, 'Cuéntanos por qué querés adoptar'),
  dondeDormiria: z.string().min(10, 'Indica dónde dormiría'),
  puedePagarVeterinario: z.string().min(10, 'Indica si puede pagar veterinario'),
  cualVeterinaria: z.string().optional(),
  puedeLlevarVacunas: z.string().min(10, 'Indica si puede llevarlo a vacunas'),
  puedeDedicarleTiempo: z.string().min(10, 'Indica si puede dedicarle tiempo'),

  // Compromisos
  seComprometeCastrar: z.boolean(),
  seComprometeFotosVideos: z.boolean(),
  seComprometeAvisarExtravio: z.boolean(),
  seComprometeEntregarVuelta: z.boolean(),

  // Aporte
  aporta100milGs: z.string(),

  // Mascota de interés
  nombreMascotaInteres: z.string().min(2, 'Indica el nombre del animal de interés'),
})

type AdoptionFormData = z.infer<typeof adoptionSchema>

export function AdoptionForm() {
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
      seComprometeFotosVideos: false,
      seComprometeAvisarExtravio: false,
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
        body: JSON.stringify({
          ...data,
          type: 'ADOPTION',
          photos: uploadedPhotos,
        }),
      })

      if (!res.ok) throw new Error('Error al enviar')

      const { token } = await res.json()
      router.push(`/gracias?token=${token}&type=adoption`)
    } catch (err) {
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
            <label className="block text-sm font-medium mb-1">Edad</label>
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

      {/* Vivienda y Familia */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[--primary]">🏠 Vivienda y Familia</h3>

        <div>
          <label className="block text-sm font-medium mb-1">¿Convivirá la mascota con niños y/o animales? *</label>
          <input {...register('ConviveConNiñosAnimales')} className="w-full p-3 border rounded-lg" placeholder="Contanos quiénes convivirán con la mascota" />
          {errors.ConviveConNiñosAnimales && <p className="text-[--error] text-sm mt-1">{errors.ConviveConNiñosAnimales.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">¿Quiénes viven y/o frecuentan la casa? *</label>
          <input {...register('quienesVivenFrecuentan')} className="w-full p-3 border rounded-lg" />
          {errors.quienesVivenFrecuentan && <p className="text-[--error] text-sm mt-1">{errors.quienesVivenFrecuentan.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Si tenés otras mascotas: ¿Cómo se llaman? ¿Qué edad tienen?</label>
          <input {...register('otrasMascotas')} className="w-full p-3 border rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">¿Tenés patio cerrado? ¿Nos podrías enviar fotos? *</label>
          <input {...register('tienePatioCerrado')} className="w-full p-3 border rounded-lg" />
          {errors.tienePatioCerrado && <p className="text-[--error] text-sm mt-1">{errors.tienePatioCerrado.message}</p>}
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
          <label className="block text-sm font-medium mb-1">¿Dónde dormiría el perro? *</label>
          <input {...register('dondeDormiria')} className="w-full p-3 border rounded-lg" />
          {errors.dondeDormiria && <p className="text-[--error] text-sm mt-1">{errors.dondeDormiria.message}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">¿Podrás pagar el veterinario? *</label>
            <input {...register('puedePagarVeterinario')} className="w-full p-3 border rounded-lg" />
            {errors.puedePagarVeterinario && <p className="text-[--error] text-sm mt-1">{errors.puedePagarVeterinario.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">¿A cuál veterinaria irías?</label>
            <input {...register('cualVeterinaria')} className="w-full p-3 border rounded-lg" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">¿Podrás llevarlo siempre a ponerse sus vacunas? *</label>
            <input {...register('puedeLlevarVacunas')} className="w-full p-3 border rounded-lg" />
            {errors.puedeLlevarVacunas && <p className="text-[--error] text-sm mt-1">{errors.puedeLlevarVacunas.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">¿Podrás dedicarle a tu mascota todo el tiempo que necesita? *</label>
            <input {...register('puedeDedicarleTiempo')} className="w-full p-3 border rounded-lg" />
            {errors.puedeDedicarleTiempo && <p className="text-[--error] text-sm mt-1">{errors.puedeDedicarleTiempo.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">¿Cuál es el nombre del perro/a que te interesa? *</label>
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
            <span className="text-sm">Te comprometes a llevarlo a una veterinaria a castrar a los 6 meses (requisito obligatorio) *</span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" {...register('seComprometeFotosVideos')} className="w-5 h-5 mt-0.5" />
            <span className="text-sm">Te comprometes a enviarnos siempre fotos/vídeos del perro para saber que está bien *</span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" {...register('seComprometeAvisarExtravio')} className="w-5 h-5 mt-0.5" />
            <span className="text-sm">Si el perro llegara a extraviarse, te comprometes a avisar a la organización *</span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" {...register('seComprometeEntregarVuelta')} className="w-5 h-5 mt-0.5" />
            <span className="text-sm">Si ya no le podés tener o vivirá en otro lugar, necesitamos que sea informado a la organización (no admitimos que sean dados en adopción a un lugar desconocido para nosotras) *</span>
          </label>
        </div>
      </div>

      {/* Aporte */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[--primary]">💰 Aporte</h3>
        <div>
          <label className="block text-sm font-medium mb-1">¿Estarías dispuesto/a a realizar un aporte monetario de 100.000 Gs a nuestra organización por esta adopción (para cubrir gastos de vacunación, antiparasitario, análisis, baños, etc.)? *</label>
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
